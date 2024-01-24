// const fs = require("fs");
import axios from "axios";
import fs from "fs";

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
  // console.log(url.toString());
  // const res = await axios.get(url.toString());
  const res = await getData();

  const log = res.data.response;

  // console.log(log);

  const resultsList = [log.results[0]];
  // const resultsList = log.results;

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
        responseType: "stream",
      }).then(function (response) {
        // console.log(response.headers["content-type"], "image response");

        if (response.headers["content-type"] === "image/jpeg") {
          response.data.pipe(
            fs.createWriteStream(`../public/assets/covers/${titleNoSpace}.jpeg`)
          );
        }
      });

      // let content = "";
      const arrayContent = [];
      for (let block of item.data.response.results) {
        // console.log(block);
        // content += block.paragraph?.rich_text[0]?.plain_text;
        const plainText = block.paragraph?.rich_text[0]?.plain_text;
        if (plainText) {
          arrayContent.push(block.paragraph?.rich_text[0]?.plain_text);
        }
      }

      // console.log(cover, arrayContent);
    }
  }
};

main();

fs.writeFileSync("../src/content/file.txt", "test");
