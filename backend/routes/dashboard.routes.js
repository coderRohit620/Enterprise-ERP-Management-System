const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics (Protected)
router.get('/stats', protect, getDashboardStats);

module.exports = router;
