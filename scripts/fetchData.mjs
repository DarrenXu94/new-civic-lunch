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

  if (log.results) {
    for (const result of log.results) {
      console.log(result.child_page.title);
    }
  }
};

main();

fs.writeFileSync("../src/content/file.txt", "test");
