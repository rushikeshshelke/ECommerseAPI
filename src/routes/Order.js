const express = require("express");
const validator = require("express-validator");

const router = express.Router();
const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require("../controllers/Order");

const {
  authenticateUser,
  authorizePermissions,
} = require("../middlewares/Authenticate");
const fieldsValidator = require("../middlewares/FieldsValidator");

router.get("/", [authenticateUser, authorizePermissions], getAllOrders);
router.get("/showAllMyOrders", authenticateUser, getCurrentUserOrders);
router.get("/:orderId", authenticateUser, getSingleOrder);

router.post(
  "/",
  authenticateUser,
  [
    validator
      .check("tax")
      .isNumeric()
      .withMessage(
        "'tax' field should not be left blank and it should be a type Numeric!"
      ),
    validator
      .check("shippingFee")
      .isNumeric()
      .withMessage(
        "'shippingFee' field should not be left blank and it should be a type Numeric!"
      ),
    validator
      .check("items")
      .isArray()
      .withMessage("'items' field should be type array of objects!"),
    validator
      .check("items.*.name")
      .not()
      .isEmpty()
      .withMessage("'items.name' field should not be left blank!"),
    validator
      .check("items.*.price")
      .isNumeric()
      .withMessage(
        "'items.price' field should not be left blank and it should be a type Numeric!"
      ),
    validator
      .check("items.*.image")
      .not()
      .isEmpty()
      .withMessage("'items.image' field should not be left blank!"),
    validator
      .check("items.*.quantity")
      .isNumeric()
      .withMessage(
        "'items.quantity' field should not be left blank and it should be a type Numeric!"
      ),
    validator
      .check("items.*.product")
      .not()
      .isEmpty()
      .withMessage("'items.product' field should not be left blank!"),
  ],
  fieldsValidator,
  createOrder
);
router.patch("/:orderId", authenticateUser, updateOrder);

module.exports = router;
