import axios from "axios";

const BASE_URL = "https://CHANGE.netlify.app";
const LOCAL_URL = "http://localhost:9999";

const FUNCTION_LINK = "/.netlify/functions/notion";

export const getData = async (id?: string, type?: string) => {
  const isLocalHost = process.env.NODE_ENV === "development";

  const url = new URL(`${isLocalHost ? LOCAL_URL : BASE_URL}${FUNCTION_LINK}`);

  if (id) {
    url.searchParams.set("id", id);
  }

  if (type) {
    url.searchParams.set("type", type);
  }

  // console.log({ id });

  return axios.get(url.toString());
};

export const getReview = async (id) => {};
