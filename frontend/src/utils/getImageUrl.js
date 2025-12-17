// Function to construct proper image URLs
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // If it's already a complete URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads, construct the full URL
  if (imagePath.startsWith('/uploads/')) {
    return `https://campus-ballot-backend.onrender.com${imagePath}`;
  }
  
  // If it's just a filename, assume it's in uploads
  if (!imagePath.startsWith('/')) {
    return `https://campus-ballot-backend.onrender.com/uploads/${imagePath}`;
  }
  
  // Default case - prepend the base URL
  return `https://campus-ballot-backend.onrender.com${imagePath}`;
}

export default getImageUrl;
