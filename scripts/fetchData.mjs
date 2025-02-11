// const fs = require("fs");
import axios from "axios";
import fs from "fs";
import NotionApiService from "./notionApiService.js";
import downloadImage from "./downloadImage.js";
import urlExtension from "./urlExtension.js";
import createFolderIfNotExists from "./createFolderIfNotExists.js";

import convertToWebp from "./convertToWebp.js";

const isLocalHost = process.env.NODE_ENV !== "production";

const notionApiService = new NotionApiService(isLocalHost);

const cleanName = (name) => {
  return name.replace(/'/g, "’");
};

const createMarkdown = (
  title,
  pubDate,
  content,
  icon,
  rating,
  graveyard
) => `---
title: '${cleanName(title)}'
pubDate: '${pubDate}'
heroImage: '/assets/covers/${cleanName(title).replaceAll(" ", "_")}.webp'
description: 'A review about ${cleanName(title)}'
icon: ${icon}
rating: ${rating}
graveyard: ${graveyard || false}
---

${content}
`;

function createFormattedDate(dateString) {
  let [day, month, year] = dateString
    .split("/")
    .map((part) => parseInt(part, 10));
  let date = new Date(year, month - 1, day);
  return date;
}

const main = async (newOnly) => {
  // Gets all the ids for all the pages
  const res = await notionApiService.getAllBlogs();

  const log = res.data.response;

  const resultsList = log.results;

  if (log.results) {
    // for (const result of [resultsList[0]]) {
    for (const result of resultsList) {
      // If this is a newOnly run, check if the file already exists

      if (newOnly) {
        const title = result.child_page.title;
        const titleNoSpace = cleanName(title).replaceAll(" ", "_");

        if (fs.existsSync(`../src/content/reviews/${titleNoSpace}.md`)) {
          console.log(`Skipping ${cleanName(title)} as it already exists`);
          continue;
        }
      }

      const id = result.id;
      const page = await notionApiService.getPageData(id);
      const item = await notionApiService.getPageContent(id);

      const title = result.child_page.title;
      const titleNoSpace = cleanName(title).replaceAll(" ", "_");

      try {
        const cover =
          page.data.response?.cover?.external?.url ||
          page.data.response?.cover.file?.url;

        await axios({
          method: "get",
          url: cover,
          responseType: "arraybuffer",
        }).then(async function (response) {
          const resizedImagePath = `../public/assets/covers/${titleNoSpace}.webp`;
          if (response.headers["content-type"] === "image/jpeg") {
            try {
              // Resize the image while maintaining aspect ratio using sharp library

              convertToWebp(Buffer.from(response.data), resizedImagePath);
            } catch (err) {
              console.error("Error resizing and saving image:", err);
            }
          } else {
            await downloadImage(response.config.url, resizedImagePath);
          }
        });
      } catch (error) {
        console.log("Error downloading image:", error);
      }

      let arrayContent = [];
      let imgIdx = 0;
      for (let block of item.data.response.results) {
        // console.log(block);
        const plainText = block.paragraph?.rich_text[0]?.plain_text;
        if (plainText) {
          arrayContent.push(block.paragraph?.rich_text[0]?.plain_text);
        }
        const bulletedText =
          block.bulleted_list_item?.rich_text[0]?.text.content;
        if (bulletedText) {
          arrayContent.push(`- ${bulletedText}`);
        }
        const img = block.image?.file?.url;
        if (img) {
          const ext = urlExtension(img);
          arrayContent.push(`IMG: ${imgIdx}.${ext}`);

          createFolderIfNotExists(`../public/assets/content/${titleNoSpace}`);

          const contentImagePath = `../public/assets/content/${titleNoSpace}/${imgIdx}.${ext}`;

          await downloadImage(img, contentImagePath);
          imgIdx++;
        }
      }

      const hasActualDate = arrayContent.findIndex((content) => {
        if (content.startsWith("Meta Actual date:")) {
          return true;
        }
      });

      let created_time = page.data.response.created_time;

      if (hasActualDate !== -1) {
        created_time = createFormattedDate(
          arrayContent[hasActualDate].split(":")[1].trim()
        );

        arrayContent.splice(hasActualDate, 1);
      }

      const isGraveyard = arrayContent.findIndex((content) => {
        if (content.startsWith("Meta Graveyard")) {
          return true;
        }
      });

      if (isGraveyard !== -1) {
        arrayContent.splice(isGraveyard, 1);
      }

      const createdTime = new Date(created_time).toLocaleDateString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      let rating;

      const findRating = arrayContent.find((content) => {
        if (content.startsWith("Rating:")) {
          return true;
        }
      });

      if (findRating) {
        rating = findRating.split(":")[1].trim().charAt(0);
      }

      const icon = page.data.response.icon
        ? page.data.response.icon.emoji
        : null;

      const markdownContent = createMarkdown(
        title,
        createdTime,
        arrayContent.join("\n\n"),
        icon,
        rating,
        isGraveyard !== -1
      );

      fs.writeFileSync(
        `../src/content/reviews/${cleanName(title).replaceAll(" ", "_")}.md`,
        markdownContent
      );
    }
  }
};

const args = process.argv.slice(2);

if (args.includes("new-only")) {
  main(true);
} else {
  main();
}
