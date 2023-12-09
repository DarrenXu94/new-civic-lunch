const { Client } = require("@notionhq/client");
require("dotenv").config();

const notion = new Client({ auth: process.env.NETLIFY_NOTION_KEY });

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
};

// https://www.notion.so/darrenxu/Lunch-reviews-c40b0c12d45b453ba4f02b954c8d3d06?pvs=4

const MAINID = "c40b0c12d45b453ba4f02b954c8d3d06";
const BLUEGINGERID = "3b665c92-316b-4f0e-9dda-4af4b6f003a8";

exports.handler = async function (event, context) {
  const response = await notion.blocks.children.list({
    block_id: MAINID,
    page_size: 50,
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ response }),
  };
};
