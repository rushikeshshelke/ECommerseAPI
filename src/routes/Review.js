const express = require("express");
const validator = require("express-validator");

const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/Review");

const { authenticateUser } = require("../middlewares/Authenticate");
const fieldsValidator = require("../middlewares/FieldsValidator");
const router = express.Router();

router.get("/", getAllReviews);
router.get("/:rvId", getReviewById);

router.use(authenticateUser);

router.post(
  "/",
  [
    validator
      .check("product")
      .not()
      .isEmpty()
      .withMessage("'product' field should not be left blank!"),
    validator
      .check("rating")
      .not()
      .isEmpty()
      .withMessage("'rating' field should not be left blank!"),
    validator
      .check("title")
      .not()
      .isEmpty()
      .withMessage("'title' field should not be left blank!"),
    validator
      .check("comment")
      .not()
      .isEmpty()
      .withMessage("'comment' field should not be left blank!"),
  ],
  fieldsValidator,
  createReview
);
router.patch(
  "/:rvId",
  [
    validator
      .check("rating")
      .not()
      .isEmpty()
      .withMessage("'rating' field should not be left blank!"),
    validator
      .check("title")
      .not()
      .isEmpty()
      .withMessage("'title' field should not be left blank!"),
    validator
      .check("comment")
      .not()
      .isEmpty()
      .withMessage("'comment' field should not be left blank!"),
  ],
  fieldsValidator,
  updateReview
);
router.delete("/:rvId", deleteReview);

module.exports = router;
