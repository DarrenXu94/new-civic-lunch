// const fs = require("fs");
import axios from "axios";
import fs from "fs";
import sharp from "sharp";

const createMarkdown = (title, pubDate, content) => `---
title: '${title}'
pubDate: '${pubDate}'
heroImage: '/assets/covers/${title.replaceAll(" ", "_")}.jpeg'
description: 'A review about ${title}'
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

const main = async () => {
  const res = await getData();

  const log = res.data.response;

  // const resultsList = [log.results[log.results.length - 1]];

  const resultsList = log.results;

  if (log.results) {
    for (const result of resultsList) {
      console.log(result.child_page.title);
      const id = result.id;
      const page = await getData(id, "page"); // for cover photo only
      const item = await getData(id); // page content

      const title = result.child_page.title;
      const titleNoSpace = title.replaceAll(" ", "_");

      const cover =
        page.data.response?.cover?.external?.url ||
        page.data.response?.cover.file?.url;

      await axios({
        method: "get",
        url: cover,
        responseType: "arraybuffer",
      }).then(async function (response) {
        if (response.headers["content-type"] === "image/jpeg") {
          const resizedImagePath = `../public/assets/covers/${titleNoSpace}.jpeg`;

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
          console.log("Invalid cover photo format");
        }
      });

      const arrayContent = [];
      for (let block of item.data.response.results) {
        const plainText = block.paragraph?.rich_text[0]?.plain_text;
        if (plainText) {
          arrayContent.push(block.paragraph?.rich_text[0]?.plain_text);
        }
      }

      const createdTime = new Date(
        page.data.response.created_time
      ).toLocaleDateString("en-us", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const markdownContent = createMarkdown(
        title,
        createdTime,
        arrayContent.join("\n\n")
      );

      fs.writeFileSync(
        `../src/content/reviews/${title.replaceAll(" ", "_")}.md`,
        markdownContent
      );
    }
  }
};

main();

// fs.writeFileSync("../src/content/file.txt", "test");
