const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const {
  getMaterials,
  uploadMaterials,
  downloadMaterial,
  deleteMaterial
} = require('../controllers/candidateMaterialController');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({
  storage
});

router.get('/materials', protect, getMaterials);
router.post('/materials', protect, upload.array('files', 10), uploadMaterials);
router.get('/materials/:id/download', protect, downloadMaterial);
router.delete('/materials/:id', protect, deleteMaterial);

module.exports = router;
