// Function to construct proper image URLs
function getImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // If it's already a complete URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads, construct the full URL
  if (imagePath.startsWith('/uploads/')) {
    return `https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev${imagePath}`;
  }
  
  // If it's just a filename, assume it's in uploads
  if (!imagePath.startsWith('/')) {
    return `https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev/uploads/${imagePath}`;
  }
  
  // Default case - prepend the base URL
  return `https://studious-space-robot-674g6rw49gg3rxr5-5000.app.github.dev${imagePath}`;
}

export default getImageUrl;
