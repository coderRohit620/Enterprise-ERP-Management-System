const express = require('express');
const { checkIn, checkOut, getAttendanceLogs } = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Attendance routes (all routes require JWT authentication)
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/', protect, getAttendanceLogs);

module.exports = router;
