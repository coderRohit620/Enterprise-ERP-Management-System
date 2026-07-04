const { check } = require('express-validator');

const generatePayrollRules = [
  check('employee_id')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isMongoId()
    .withMessage('Employee ID must be a valid MongoDB ObjectId'),
  check('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be an integer between 1 and 12'),
  check('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be a valid integer year'),
  check('bonus')
    .optional()
    .isNumeric()
    .withMessage('Bonus must be a valid number')
    .custom((val) => parseFloat(val) >= 0)
    .withMessage('Bonus cannot be negative'),
  check('deduction')
    .optional()
    .isNumeric()
    .withMessage('Deduction must be a valid number')
    .custom((val) => parseFloat(val) >= 0)
    .withMessage('Deduction cannot be negative'),
  check('tax')
    .optional()
    .isNumeric()
    .withMessage('Tax must be a valid number')
    .custom((val) => parseFloat(val) >= 0)
    .withMessage('Tax cannot be negative'),
  check('pf')
    .optional()
    .isNumeric()
    .withMessage('PF must be a valid number')
    .custom((val) => parseFloat(val) >= 0)
    .withMessage('PF cannot be negative'),
];

module.exports = {
  generatePayrollRules,
};
