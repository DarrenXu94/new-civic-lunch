import axios from "axios";

const BASE_URL = "https://CHANGE.netlify.app";
const LOCAL_URL = "http://localhost:9999";

const FUNCTION_LINK = "/.netlify/functions/notion";

export const getData = async () => {
  const isLocalHost = process.env.NODE_ENV === "development";

  return axios.get(`${isLocalHost ? LOCAL_URL : BASE_URL}${FUNCTION_LINK}`);
};
