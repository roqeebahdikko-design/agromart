const jwt = require('jsonwebtoken');

const generateToken = (userId, role = 'user') =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

module.exports = generateToken;
