const express = require("express");
const validator = require("express-validator");

const { signup, login, logout } = require("../controllers/Auth");
const fieldsValidator = require("../middlewares/FieldsValidator");
const router = express.Router();

router.post(
  "/signup",
  [
    validator
      .check("name")
      .not()
      .isEmpty()
      .withMessage("'name' field should not be left blank!"),
    validator
      .check("email")
      .not()
      .isEmpty()
      .withMessage("'email' field should not be left blank!"),
    validator
      .check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter the valid email!"),
    validator
      .check("password")
      .not()
      .isEmpty()
      .withMessage("'password' field should not be left blank!"),
    validator
      .check("password")
      .isLength({ min: 8 })
      .withMessage("Password should be minimun 8 characters long!"),
  ],
  fieldsValidator,
  signup
);

router.post(
  "/login",
  [
    validator
      .check("email")
      .not()
      .isEmpty()
      .withMessage("'email' field should not be left blank!"),
    validator
      .check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter the valid email!"),
    validator
      .check("password")
      .not()
      .isEmpty()
      .withMessage("'password' field should not be left blank!"),
  ],
  fieldsValidator,
  login
);

router.get("/logout", logout);

module.exports = router;
