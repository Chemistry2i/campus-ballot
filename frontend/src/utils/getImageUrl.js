// Function to construct proper image URLs
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  // If it's already a complete URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, return null (do not fallback to /uploads)
  return null;
  return `https://laughing-memory-wrjgjx7g5qqq3g559-5000.app.github.dev${imagePath}`;
}

export default getImageUrl;
