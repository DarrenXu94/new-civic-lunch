const { Client } = require("@notionhq/client");
require("dotenv").config({ path: "../.env" });
const axios = require("axios");

const BASE_URL = process.env.URL;
const LOCAL_URL = "http://localhost:9999";

const FUNCTION_LINK = "/.netlify/functions/notion";

const MAINID = "c40b0c12d45b453ba4f02b954c8d3d06"; // ID of the main page

class NotionApiService {
  constructor(localHost, key) {
    // If localhost create a notion client object and save in class locally, otherwise use api calls
    this.isLocalHost = localHost;
    if (this.isLocalHost) {
      this.notion = new Client({ auth: process.env.NETLIFY_NOTION_KEY });
    }
  }

  async getAllBlogs() {
    if (this.isLocalHost) {
      const response = await this.notion.blocks.children.list({
        block_id: MAINID,
        page_size: 50,
      });
      return {
        statusCode: 200,

        data: { response },
      };
    } else {
      const url = new URL(`${BASE_URL}${FUNCTION_LINK}`);

      return axios.get(url.toString());
    }
  }

  async getPageData(id) {
    if (this.isLocalHost) {
      const response = await this.notion.pages.retrieve({
        page_id: id,
        page_size: 50,
      });
      return {
        statusCode: 200,

        data: { response },
      };
    } else {
      const url = new URL(`${BASE_URL}${FUNCTION_LINK}`);
      url.searchParams.set("id", id);
      url.searchParams.set("type", "page");

      return axios.get(url.toString());
    }
  }

  async getPageContent(id) {
    if (this.isLocalHost) {
      const response = await this.notion.blocks.children.list({
        block_id: id,
        page_size: 50,
      });
      return {
        statusCode: 200,

        data: { response },
      };
    } else {
      const url = new URL(`${BASE_URL}${FUNCTION_LINK}`);
      url.searchParams.set("id", id);
      url.searchParams.set("type", "block");

      return axios.get(url.toString());
    }
  }
}

module.exports = NotionApiService;
