const express = require('express');
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
} = require('../controllers/department.controller');
const { protect, authorize } = require('../middleware/auth');
const { createDepartmentRules, updateDepartmentRules } = require('../validators/department.validator');
const validate = require('../middleware/validate');

const router = express.Router();

// Get all departments (Protected)
router.get('/', protect, getDepartments);

// Get department stats (Protected, Admin & Manager only)
router.get('/stats', protect, authorize('Admin', 'Manager'), getDepartmentStats);

// Get department by ID (Protected)
router.get('/:id', protect, getDepartmentById);

// Create department (Protected, Admin only)
router.post('/', protect, authorize('Admin'), createDepartmentRules, validate, createDepartment);

// Update department (Protected, Admin only)
router.put('/:id', protect, authorize('Admin'), updateDepartmentRules, validate, updateDepartment);

// Delete department (Protected, Admin only)
router.delete('/:id', protect, authorize('Admin'), deleteDepartment);

module.exports = router;
