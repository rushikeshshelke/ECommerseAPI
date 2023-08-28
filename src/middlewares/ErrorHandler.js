const { StatusCodes } = require("http-status-codes");

const errorHandler = (error, req, res, next) => {
  res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || "An unknown error occurred!",
  });
};

module.exports = errorHandler;
