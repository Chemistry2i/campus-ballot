const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const CampaignMaterial = require('../models/CampaignMaterial');

const isAdminUser = (user = {}) => ['admin', 'super_admin'].includes(user.role);

const canManageMaterial = (material, user) => {
  if (!material || !user) return false;
  if (isAdminUser(user)) return true;
  return material.user.toString() === user._id.toString();
};

const normalizeCategory = (category) => {
  const allowed = CampaignMaterial.allowedCategories || [];
  if (!category) return 'other';
  const normalized = category.toLowerCase();
  return allowed.includes(normalized) ? normalized : 'other';
};

// @desc    Get materials for the logged-in candidate (admin can query by ?userId=)
// @route   GET /api/candidate/materials
// @access  Candidate/Admin
const getMaterials = asyncHandler(async (req, res) => {
  const filter = {};
  if (isAdminUser(req.user) && req.query.userId) {
    filter.user = req.query.userId;
  } else {
    filter.user = req.user._id;
  }

  const materials = await CampaignMaterial.find(filter)
    .sort({ createdAt: -1 });

  res.json(materials);
});

// @desc    Upload one or more materials for the logged-in candidate
// @route   POST /api/candidate/materials
// @access  Candidate/Admin
const uploadMaterials = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const category = normalizeCategory(req.body.category);
  const baseTitle = req.body.title?.trim();

  const createdMaterials = await Promise.all(
    req.files.map((file, index) => {
      const title = baseTitle || file.originalname;
      return CampaignMaterial.create({
        user: req.user._id,
        title: req.files.length > 1 && baseTitle ? `${title} (${index + 1})` : title,
        category,
        fileType: file.mimetype,
        fileSize: Number((file.size / (1024 * 1024)).toFixed(2)), // store as MB
        url: `/uploads/${file.filename}`,
        originalName: file.originalname,
        uploadDate: new Date()
      });
    })
  );

  res.status(201).json(createdMaterials);
});

// @desc    Download a specific material (increments downloads)
// @route   GET /api/candidate/materials/:id/download
// @access  Candidate/Admin
const downloadMaterial = asyncHandler(async (req, res) => {
  const material = await CampaignMaterial.findById(req.params.id);

  if (!material) {
    return res.status(404).json({ message: 'Material not found' });
  }

  if (!canManageMaterial(material, req.user)) {
    return res.status(403).json({ message: 'Not authorized to access this material' });
  }

  const filePath = path.join(__dirname, '..', material.url.replace(/^\//, ''));

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found on server' });
  }

  material.downloads += 1;
  await material.save();

  const downloadName = material.originalName || material.title;
  return res.download(filePath, downloadName, (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ message: 'Failed to download material' });
    }
  });
});

// @desc    Delete a material
// @route   DELETE /api/candidate/materials/:id
// @access  Candidate/Admin
const deleteMaterial = asyncHandler(async (req, res) => {
  const material = await CampaignMaterial.findById(req.params.id);

  if (!material) {
    return res.status(404).json({ message: 'Material not found' });
  }

  if (!canManageMaterial(material, req.user)) {
    return res.status(403).json({ message: 'Not authorized to delete this material' });
  }

  const filePath = path.join(__dirname, '..', material.url.replace(/^\//, ''));

  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Failed to delete file from disk:', err.message);
    }
  }

  await material.deleteOne();

  res.json({ message: 'Material deleted successfully' });
});

module.exports = {
  getMaterials,
  uploadMaterials,
  downloadMaterial,
  deleteMaterial,
};
