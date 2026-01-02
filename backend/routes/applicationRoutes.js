const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { createApplication } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// Candidate self-application
router.post('/', protect, upload.fields([{ name: 'photo', maxCount: 1 }]), createApplication);

module.exports = router;
