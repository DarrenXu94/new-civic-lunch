const sharp = require("sharp");
const fs = require("fs");

/**
 *
 * @param {*} imgBuffer
 * @param {*} outputPath
 */
const convertToWebp = async (imgBuffer, outputPath) => {
  const resizedBuffer = await sharp(imgBuffer)
    .rotate()
    .resize(800, null) // Specify the desired width (300 in this case), height will be adjusted to maintain aspect ratio
    .webp()
    .toBuffer();

  fs.writeFileSync(outputPath, resizedBuffer);
};

module.exports = convertToWebp;
