const mongoose = require("mongoose");
const uuid = require("uuid");
const { StatusCodes } = require("http-status-codes");
const HttpError = require("../utils/HttpError");

const ReviewSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, default: uuid.v4, identifier: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, required: true, maxLength: 100 },
    comment: { type: String, required: true },
    user: { type: String, required: true, ref: "User" },
    product: { type: String, required: true, ref: "Product" },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAvgRating = async function (productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        noOfReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  await this.model("Product").findOneAndUpdate(
    { _id: productId },
    {
      averageRating: Math.ceil(result[0]?.averageRating || 0),
      noOfReviews: result[0]?.noOfReviews || 0,
    }
  );
};

ReviewSchema.post("save", async function (next) {
  try {
    await this.constructor.calculateAvgRating(this.product);
  } catch (err) {
    return next(
      new HttpError(
        `Something went wrong, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
});

ReviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      await this.constructor.calculateAvgRating(this.product);
    } catch (err) {
      return next(
        new HttpError(
          `Something went wrong, please try again : ${err}`,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
  }
);

module.exports = mongoose.model("Review", ReviewSchema);
