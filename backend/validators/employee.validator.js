const { check } = require('express-validator');

const createEmployeeRules = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('role')
    .isIn(['Admin', 'Manager', 'Employee'])
    .withMessage('Role must be Admin, Manager, or Employee'),
  check('employee_code')
    .trim()
    .notEmpty()
    .withMessage('Employee code is required'),
  check('designation')
    .trim()
    .notEmpty()
    .withMessage('Designation is required'),
  check('joining_date')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid joining date (YYYY-MM-DD)'),
  check('salary')
    .isNumeric()
    .withMessage('Salary must be a valid number')
    .custom((val) => parseFloat(val) >= 0)
    .withMessage('Salary cannot be negative'),
  check('phone')
    .optional()
    .trim(),
  check('address')
    .optional()
    .trim(),
];

const updateEmployeeRules = [
  check('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  check('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  check('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('role')
    .optional()
    .isIn(['Admin', 'Manager', 'Employee'])
    .withMessage('Role must be Admin, Manager, or Employee'),
  check('employee_code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Employee code cannot be empty'),
  check('designation')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Designation cannot be empty'),
  check('joining_date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid joining date (YYYY-MM-DD)'),
  check('salary')
    .optional()
    .isNumeric()
    .withMessage('Salary must be a valid number')
    .custom((val) => parseFloat(val) >= 0)
    .withMessage('Salary cannot be negative'),
  check('phone')
    .optional()
    .trim(),
  check('address')
    .optional()
    .trim(),
  check('status')
    .optional()
    .isIn(['Active', 'Inactive', 'Terminated'])
    .withMessage('Status must be Active, Inactive, or Terminated'),
];

module.exports = {
  createEmployeeRules,
  updateEmployeeRules,
};
