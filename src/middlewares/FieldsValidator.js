const { StatusCodes } = require("http-status-codes");
const validators = require("express-validator");
const HttpError = require("../utils/HttpError");

const fieldsValidator = (req, res, next) => {
  const errors = validators.validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        errors.formatWith((error) => error.msg).array(),
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    );
  }
  next();
};

module.exports = fieldsValidator;
