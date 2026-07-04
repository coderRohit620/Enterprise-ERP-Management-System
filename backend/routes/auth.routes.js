const express = require('express');
const { login, getProfile, changePassword, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { loginRules, changePasswordRules } = require('../validators/auth.validator');
const validate = require('../middleware/validate');

const router = express.Router();

// Public Routes
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);

// Protected Routes
router.get('/profile', protect, getProfile);
router.put('/change-password', protect, changePasswordRules, validate, changePassword);

module.exports = router;
