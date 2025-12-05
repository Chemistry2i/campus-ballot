const express = require('express');
const router = express.Router();
const { getFaculties, getCohorts } = require('../controllers/metaController');

// Get all faculties
router.get('/faculties', getFaculties);

// Get all cohorts
router.get('/cohorts', getCohorts);

module.exports = router;
