const express = require('express');
const {
  applyLeave,
  getLeaves,
  getLeaveBalance,
  cancelLeave,
  approveLeave,
  rejectLeave,
} = require('../controllers/leave.controller');
const { protect, authorize } = require('../middleware/auth');
const { applyLeaveRules } = require('../validators/leave.validator');
const validate = require('../middleware/validate');

const router = express.Router();

// Apply for leave (Protected)
router.post('/', protect, applyLeaveRules, validate, applyLeave);

// Get leave history logs (Protected)
router.get('/', protect, getLeaves);

// Get leave balances breakdown (Protected)
router.get('/balance', protect, getLeaveBalance);

// Cancel a pending leave request (Protected)
router.put('/:id/cancel', protect, cancelLeave);

// Approve leave (Protected, Admin & Manager only)
router.put('/:id/approve', protect, authorize('Admin', 'Manager'), approveLeave);

// Reject leave (Protected, Admin & Manager only)
router.put('/:id/reject', protect, authorize('Admin', 'Manager'), rejectLeave);

module.exports = router;
