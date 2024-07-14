// const fs = require("fs");
import axios from "axios";
import fs from "fs";
import sharp from "sharp";

const createMarkdown = (title, pubDate, content, icon) => `---
title: '${title}'
pubDate: '${pubDate}'
heroImage: '/assets/covers/${title.replaceAll(" ", "_")}.jpeg'
description: 'A review about ${title}'
icon: ${icon}
---

${content}
`;

const BASE_URL = process.env.URL;
const LOCAL_URL = "http://localhost:9999";

const FUNCTION_LINK = "/.netlify/functions/notion";

const getData = async (id, type) => {
  const isLocalHost = true;

  const url = new URL(`${isLocalHost ? LOCAL_URL : BASE_URL}${FUNCTION_LINK}`);

  if (id) {
    url.searchParams.set("id", id);
  }

  if (type) {
    url.searchParams.set("type", type);
  }

  return axios.get(url.toString());
};

/**
 * Function to download an image from a URL or base64 data URL
 * @param {string} url - The URL or base64 data URL of the image
 * @param {string} outputPath - The path where the image will be saved
 */
async function downloadImage(url, outputPath) {
  try {
    if (url.startsWith("data:image")) {
      if (!url.startsWith("data:image/jpeg")) return console.log("Not JPEG");
      // Handle base64 data URL
      const base64Data = url.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(outputPath, buffer);
      console.log("Image downloaded and saved as:", outputPath);
    } else {
      // Handle regular URL
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(outputPath, response.data);
      console.log("Image downloaded and saved as:", outputPath);
    }
  } catch (error) {
    console.error("Error downloading image:", error);
  }
}

function createFormattedDate(dateString) {
  let [day, month, year] = dateString
    .split("/")
    .map((part) => parseInt(part, 10));
  let date = new Date(year, month - 1, day);
  return date;
}

const main = async () => {
  const res = await getData();

  const log = res.data.response;

  const resultsList = log.results;

  if (log.results) {
    for (const result of resultsList) {
      console.log(result.child_page.title);
      const id = result.id;
      const page = await getData(id, "page"); // for cover photo only
      const item = await getData(id); // page content

      const title = result.child_page.title;
      const titleNoSpace = title.replaceAll(" ", "_");

      try {
        const cover =
          page.data.response?.cover?.external?.url ||
          page.data.response?.cover.file?.url;

        await axios({
          method: "get",
          url: cover,
          responseType: "arraybuffer",
        }).then(async function (response) {
          const resizedImagePath = `../public/assets/covers/${titleNoSpace}.jpeg`;
          if (response.headers["content-type"] === "image/jpeg") {
            try {
              // Resize the image while maintaining aspect ratio using sharp library
              const resizedBuffer = await sharp(Buffer.from(response.data))
                .rotate()
                .resize(800, null) // Specify the desired width (300 in this case), height will be adjusted to maintain aspect ratio
                .toBuffer();

              // Save the resized image
              fs.writeFileSync(resizedImagePath, resizedBuffer);
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
      for (let block of item.data.response.results) {
        const plainText = block.paragraph?.rich_text[0]?.plain_text;
        if (plainText) {
          arrayContent.push(block.paragraph?.rich_text[0]?.plain_text);
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

      const createdTime = new Date(created_time).toLocaleDateString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const icon = page.data.response.icon
        ? page.data.response.icon.emoji
        : null;

      const markdownContent = createMarkdown(
        title,
        createdTime,
        arrayContent.join("\n\n"),
        icon
      );

      fs.writeFileSync(
        `../src/content/reviews/${title.replaceAll(" ", "_")}.md`,
        markdownContent
      );
    }
  }
};

main();
