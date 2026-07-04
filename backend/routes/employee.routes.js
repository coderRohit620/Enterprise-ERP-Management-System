const express = require('express');
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employee.controller');
const { protect, authorize } = require('../middleware/auth');
const { createEmployeeRules, updateEmployeeRules } = require('../validators/employee.validator');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

// Get all employees (Admin & Manager access only)
router.get('/', protect, authorize('Admin', 'Manager'), getEmployees);

// Get single employee details (Admin, Manager, or Employee owner access)
router.get('/:id', protect, getEmployeeById);

// Create employee (Admin only - accepts Multer field upload for profile image)
router.post(
  '/',
  protect,
  authorize('Admin'),
  upload.single('profile_image'),
  createEmployeeRules,
  validate,
  createEmployee
);

// Update employee (Admin or Employee owner - accepts Multer field upload)
router.put(
  '/:id',
  protect,
  upload.single('profile_image'),
  updateEmployeeRules,
  validate,
  updateEmployee
);

// Delete employee (Admin only)
router.delete('/:id', protect, authorize('Admin'), deleteEmployee);

module.exports = router;
