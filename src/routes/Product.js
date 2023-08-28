const express = require("express");
const validator = require("express-validator");

const {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require("../controllers/Product");

const { getSingleProductReviews } = require("../controllers/Review");

const {
  authenticateUser,
  authorizePermissions,
} = require("../middlewares/Authenticate");
const fieldsValidator = require("../middlewares/FieldsValidator");
const router = express.Router();

router.get("/", getAllProducts);
router.get("/:pId", getSingleProduct);
router.get("/:pId/reviews", getSingleProductReviews);

router.use(authenticateUser);
router.use(authorizePermissions);

router.post(
  "/",
  [
    validator
      .check("name")
      .not()
      .isEmpty()
      .withMessage("'name' field should not be left blank!"),
    validator
      .check("price")
      .not()
      .isEmpty()
      .withMessage("'price' field should not be left blank!"),
    validator
      .check("description")
      .not()
      .isEmpty()
      .withMessage("'description' field should not be left blank!"),
    validator
      .check("category")
      .not()
      .isEmpty()
      .withMessage("'category' field should not be left blank!"),
    validator
      .check("company")
      .not()
      .isEmpty()
      .withMessage("'company' field should not be left blank!"),
    validator
      .check("colors")
      .not()
      .isEmpty()
      .withMessage("'colors' field should not be left blank!"),
  ],
  fieldsValidator,
  createProduct
);
router.post("/uploadProductImage", uploadProductImage);
router.patch("/:pId", updateProduct);
router.delete("/:pId", deleteProduct);

module.exports = router;
