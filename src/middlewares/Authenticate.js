const { StatusCodes } = require("http-status-codes");
const { verifyJWT } = require("../utils/JWT");
const HttpError = require("../utils/HttpError");

const authenticateUser = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token || !token.startsWith("Bearer")) {
    return next(
      new HttpError(
        "Authentication failed. Invalid Bearer token. Please provide valid one!",
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  try {
    const decodedToken = verifyJWT(token.split(" ")[1]);
    req.user = {
      userId: decodedToken.userId,
      name: decodedToken.name,
      role: decodedToken.role,
    };
    next();
  } catch (err) {
    return next(
      new HttpError(
        `Authentication failed. Please try again : ${err}`,
        StatusCodes.UNAUTHORIZED
      )
    );
  }
};

const authorizePermissions = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(
      new HttpError(
        "Unauthorized user. You don't have access to see this content!",
        StatusCodes.FORBIDDEN
      )
    );
  }
  next();
};

module.exports = { authenticateUser, authorizePermissions };
