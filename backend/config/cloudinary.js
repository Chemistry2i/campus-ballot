// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary credentials missing in .env file!');
  console.error('Please add: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
} else {
  console.log('✅ Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME);
}

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campus-ballot/candidates', // Folder in Cloudinary where files will be stored
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    transformation: [{ 
      width: 1000, 
      height: 1000, 
      crop: 'limit', // Don't upscale, only downscale if larger
      quality: 'auto', // Automatic quality optimization
      fetch_format: 'auto' // Automatic format selection (WebP for modern browsers)
    }],
    // Generate unique filename
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filenameParts = file.originalname.split('.');
      const name = filenameParts[0].replace(/[^a-zA-Z0-9]/g, '-'); // Clean filename
      return `${file.fieldname}-${name}-${uniqueSuffix}`;
    }
  }
});

// File filter to validate image uploads
const fileFilter = (req, file, cb) => {
  console.log('🔍 Validating file upload:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // Allowed MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    console.log('✅ File type accepted:', file.mimetype);
    cb(null, true);
  } else {
    console.log('❌ File type rejected:', file.mimetype);
    cb(new Error(`Invalid file type. Only images are allowed. Got: ${file.mimetype}`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Middleware to log upload results
upload.logUpload = (req, res, next) => {
  if (req.files) {
    console.log('📤 Files uploaded to Cloudinary:');
    
    Object.entries(req.files).forEach(([fieldName, files]) => {
      files.forEach(file => {
        console.log(`   ✅ ${fieldName}:`, {
          originalName: file.originalname,
          cloudinaryUrl: file.path,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          format: file.format,
          width: file.width,
          height: file.height
        });
      });
    });
  }
  next();
};

module.exports = { cloudinary, upload };