const express = require("express");
const validator = require("express-validator");

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/User");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middlewares/Authenticate");
const fieldsValidator = require("../middlewares/FieldsValidator");
const router = express.Router();

// Auth Middleware
router.use(authenticateUser);

router.get("/", authorizePermissions, getAllUsers);
router.get("/showMe", showCurrentUser);
router.get("/:userId", getSingleUser);
router.patch(
  "/updateUser",
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
  ],
  fieldsValidator,
  updateUser
);
router.patch(
  "/updateUserPassword",
  [
    validator
      .check("oldPassword")
      .not()
      .isEmpty()
      .withMessage("'oldPassword' field should not be left blank!"),
    validator
      .check("newPassword")
      .not()
      .isEmpty()
      .withMessage("'newPassword' field should not be left blank!"),
    validator
      .check("newPassword")
      .isLength({ min: 8 })
      .withMessage("'newPassword' should be minimun 8 characters long!"),
  ],
  fieldsValidator,
  updateUserPassword
);

module.exports = router;
