const express = require('express');
const { generatePayroll, getPayrollLogs, downloadSalarySlip } = require('../controllers/payroll.controller');
const { protect, authorize } = require('../middleware/auth');
const { generatePayrollRules } = require('../validators/payroll.validator');
const validate = require('../middleware/validate');

const router = express.Router();

// Generate monthly payroll (Protected, Admin only)
router.post('/generate', protect, authorize('Admin'), generatePayrollRules, validate, generatePayroll);

// Get payroll logs list (Protected)
router.get('/', protect, getPayrollLogs);

// Download PDF salary slip (Protected)
router.get('/:id/download', protect, downloadSalarySlip);

module.exports = router;
