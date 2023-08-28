const { StatusCodes } = require("http-status-codes");

const User = require("../models/User");
const HttpError = require("../utils/HttpError");
const createUserToken = require("../utils/UserToken");
const checkPermissions = require("../utils/CheckPermissions");
const createQueryObject = require("../utils/QueryObject");

const getAllUsers = async (req, res, next) => {
  let queryObject = createQueryObject(req.query);
  let users;
  try {
    users = await User.find(queryObject, "-__v -password").sort("-createdAt");
  } catch (err) {
    return next(
      new HttpError(
        `Could not able fetch users, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  res
    .status(StatusCodes.OK)
    .json({ success: true, totalCount: users.length, users: users });
};

const getSingleUser = async (req, res, next) => {
  let userId = req.params.userId;
  let user;
  try {
    user = await User.findById(userId, "-__v -password");
  } catch (err) {
    return next(
      new HttpError(
        `Could not able fetch users, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  if (!user) {
    return next(
      new HttpError(
        "User details not found for requested user id: " + userId,
        StatusCodes.NOT_FOUND
      )
    );
  }

  if (!checkPermissions(req.user, user._id)) {
    return next(
      new HttpError(
        "You are not authorized to access this route. Permission denied!",
        StatusCodes.FORBIDDEN
      )
    );
  }

  res.status(StatusCodes.OK).json({ success: true, user: user });
};

const showCurrentUser = (req, res, next) => {
  res.status(StatusCodes.OK).json({ success: true, user: req.user });
};

const updateUser = async (req, res, next) => {
  const { name, email } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email, _id: req.user.userId });
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to update user, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!existingUser) {
    return next(new HttpError("User not exists!", StatusCodes.BAD_REQUEST));
  }

  existingUser.name = name;
  try {
    await existingUser.save();
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to update user, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res
    .status(StatusCodes.OK)
    .json({ success: true, user: createUserToken(existingUser) });
};

const updateUserPassword = async (req, res, next) => {
  console.log(req.user);
  let userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;
  let existingUser;
  try {
    existingUser = await User.findById(userId);
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to update password, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!existingUser) {
    return next(
      new HttpError(
        "Unable to update password, User not exists",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  let isMatched = await existingUser.comparePassword(oldPassword);
  if (!isMatched) {
    return next(
      new HttpError(
        "Invalid login credentials, Please provide correct one!",
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  existingUser.password = newPassword;
  try {
    await existingUser.save();
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to update password, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res
    .status(StatusCodes.OK)
    .json({ success: true, message: "Password updated successfully." });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
