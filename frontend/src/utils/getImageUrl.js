// Function to construct proper image URLs
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  // If it's already a complete URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, return null (do not fallback to /uploads)
  return null;
  return `https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev${imagePath}`;
}

export default getImageUrl;
