const { validationResult } = require('express-validator');
const AppError = require('./AppError');

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new AppError('Validation failed', 422)
    );
  }

  next();
};
