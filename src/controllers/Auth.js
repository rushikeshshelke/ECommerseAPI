const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const HttpError = require("../utils/HttpError");
const { createJWT } = require("../utils/JWT");
const createUserToken = require("../utils/UserToken");

const signup = async (req, res, next) => {
  console.log(req.body);
  const { name, email, password } = req.body;

  let exisingUser;
  try {
    exisingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to sign you in, Please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  if (exisingUser) {
    return next(
      new HttpError(
        "User already exists, Try to login instead!",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // First user as admin user

  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  const createdUser = new User({
    name,
    email,
    password,
    role,
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(
      new HttpError(
        `Could not create user, Please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  let token;
  let user = createUserToken(createdUser);
  try {
    token = createJWT(user);
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    user: {
      _id: createdUser._id,
      name: createdUser.name,
      role: createdUser.role,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    },
    accessToken: token,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError(
        `Could not logged you in, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!existingUser) {
    return next(
      new HttpError(
        "User not exists, Please try signing in instead!",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  let isMatched = await existingUser.comparePassword(password);
  if (!isMatched) {
    return next(
      new HttpError(
        "Invalid credentials, Please provide correct one!",
        StatusCodes.UNAUTHORIZED
      )
    );
  }
  let token;
  let user = createUserToken(existingUser);
  try {
    token = createJWT(user);
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res.status(StatusCodes.OK).json({
    success: true,
    user: user,
    accessToken: token,
  });
};

const logout = (req, res, next) => {
  res.status(StatusCodes.OK).json(req.body);
};

module.exports = { signup, login, logout };
