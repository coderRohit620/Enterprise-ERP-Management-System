const { check } = require('express-validator');

const createDepartmentRules = [
  check('department_name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required'),
  check('description')
    .optional()
    .trim(),
  check('manager_id')
    .optional()
    .custom((value) => {
      // Validate MongoDB ObjectId structure if manager_id is specified
      if (value && value !== '' && !value.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Manager ID must be a valid MongoDB ObjectId');
      }
      return true;
    }),
];

const updateDepartmentRules = [
  check('department_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department name cannot be empty'),
  check('description')
    .optional()
    .trim(),
  check('manager_id')
    .optional()
    .custom((value) => {
      // Allow null values for removal, otherwise validate ObjectId structure
      if (value && value !== '' && value !== null && !value.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Manager ID must be a valid MongoDB ObjectId');
      }
      return true;
    }),
];

module.exports = {
  createDepartmentRules,
  updateDepartmentRules,
};
