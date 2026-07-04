const { check } = require('express-validator');

const applyLeaveRules = [
  check('leave_type')
    .isIn(['Casual', 'Sick', 'Maternity', 'Paternity', 'Unpaid'])
    .withMessage('Leave type must be Casual, Sick, Maternity, Paternity, or Unpaid'),
  check('start_date')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date (YYYY-MM-DD)'),
  check('end_date')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date (YYYY-MM-DD)'),
  check('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason is required'),
];

module.exports = {
  applyLeaveRules,
};
