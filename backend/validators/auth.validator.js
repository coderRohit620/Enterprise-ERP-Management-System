const { check } = require('express-validator');

const loginRules = [
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  check('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const changePasswordRules = [
  check('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  check('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

module.exports = {
  loginRules,
  changePasswordRules,
};
