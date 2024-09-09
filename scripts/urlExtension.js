function getExtensionFromUrl(url) {
  // Use a regular expression to find the file extension after the last dot before a question mark or end of the string
  const match = url.match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
  return match ? match[1] : null; // Return the extension if found, otherwise return null
}

module.exports = getExtensionFromUrl;
