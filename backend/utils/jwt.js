const jwt = require('jsonwebtoken');

/**
 * Generates a signed JSON Web Token for the user.
 * @param {string} userId - The MongoDB User ID.
 * @returns {string} The signed JWT.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

module.exports = generateToken;
