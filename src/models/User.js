const mongoose = require("mongoose");
const uuid = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");
const bcrypt = require("bcryptjs");
const { StatusCodes } = require("http-status-codes");
const HttpError = require("../utils/HttpError");

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, default: uuid.v4, identifier: true },
    name: { type: String, required: true, minLength: 3, maxLength: 50 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minLength: 8 },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return;
  try {
    let salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  next();
});

UserSchema.methods.comparePassword = async function (originalPassword) {
  let isMatched;
  isMatched = await bcrypt.compare(originalPassword, this.password);
  return isMatched;
};

module.exports = mongoose.model("User", UserSchema);
