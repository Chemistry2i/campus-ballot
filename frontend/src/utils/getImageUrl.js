// Function to construct proper image URLs
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // If it's already a complete URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads, construct the full URL
  if (imagePath.startsWith('/uploads/')) {
    return `https://api.campusballot.tech${imagePath}`;
  }
  
  // If it's just a filename, assume it's in uploads
  if (!imagePath.startsWith('/')) {
    return `https://api.campusballot.tech/uploads/${imagePath}`;
  }
  
  // Default case - prepend the base URL
  return `https://api.campusballot.tech${imagePath}`;
}

export default getImageUrl;
