const { validationResult } = require('express-validator');

/**
 * Validator middleware checks the validation results of express-validator.
 * Returns a 400 Bad Request error if validators failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Map express-validator errors to standard api payload
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({ errors: formattedErrors });
  }
  next();
};

module.exports = validate;
