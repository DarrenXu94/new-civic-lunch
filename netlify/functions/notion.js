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
  const id = event.queryStringParameters.id || MAINID;
  const type = event.queryStringParameters.type || "block";

  let response;

  // console.log(id);

  if (type === "page") {
    response = await notion.pages.retrieve({
      page_id: id,
      page_size: 50,
    });
  } else {
    response = await notion.blocks.children.list({
      block_id: id,
      page_size: 50,
    });
  }

  // console.log(event.queryStringParameters);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ response }),
  };
};
