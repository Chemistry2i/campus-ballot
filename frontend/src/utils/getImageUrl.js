// Function to construct proper image URLs
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  // If it's already a complete URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, prepend API URL to create full path
  return `https://api.campusballot.tech${imagePath}`;
}

export default getImageUrl;
