// Function to construct proper image URLs
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  // If it's already a complete URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, return null (do not fallback to /uploads)
  return null;
  return `https://api.campusballot.tech${imagePath}`;
}

export default getImageUrl;
