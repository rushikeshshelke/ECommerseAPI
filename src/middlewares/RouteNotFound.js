const { StatusCodes } = require("http-status-codes");
const HttpError = require("../utils/HttpError");

const routeNotFound = (req, res, next) => {
  return next(
    new HttpError("Could not found this route!", StatusCodes.BAD_REQUEST)
  );
};

module.exports = routeNotFound;
