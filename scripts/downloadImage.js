const axios = require("axios");
const fs = require("fs");

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

module.exports = downloadImage;
