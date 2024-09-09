const fs = require("fs");
const path = require("path");

function createFolderIfNotExists(folderPath) {
  // Use the `path` module to resolve the full path of the folder
  const fullPath = path.resolve(folderPath);

  // Check if the folder exists
  if (!fs.existsSync(fullPath)) {
    // If the folder does not exist, create it
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Folder created: ${fullPath}`);
  } else {
    console.log(`Folder already exists: ${fullPath}`);
  }
}

module.exports = createFolderIfNotExists;
