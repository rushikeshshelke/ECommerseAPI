const Review = require("../models/Review");
const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const HttpError = require("../utils/HttpError");
const createQueryObject = require("../utils/QueryObject");
const pagination = require("../utils/Pagination");
const checkPermissions = require("../utils/CheckPermissions");

const getAllReviews = async (req, res, next) => {
  let reviews;
  let queryObject = createQueryObject(req.query);
  const { limit, skip } = pagination(req.query);
  try {
    reviews = await Review.find(queryObject, "-__v")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt")
      .populate("user", "name")
      .populate("product", "name company price");
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to fetch reviews, please try again`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res
    .status(StatusCodes.OK)
    .json({ success: true, totalCount: reviews.length, reviews: reviews });
};

const getReviewById = async (req, res, next) => {
  const reviewId = req.params.rvId;
  let review;
  try {
    review = await Review.findById(reviewId)
      .populate("user", "name")
      .populate("product", "name company price");
  } catch (err) {
    return next(
      new HttpError(
        `Couldn't able to fetch the review, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!review) {
    return next(
      new HttpError(
        `Review ${reviewId} does not exists!`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  res.status(StatusCodes.OK).json({ success: true, review: review });
};

const createReview = async (req, res, next) => {
  const { rating, title, comment, product } = req.body;
  const userId = req.user.userId;
  let existingProduct;
  try {
    existingProduct = await Product.findById(product);
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to create review, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  if (!existingProduct) {
    return next(
      new HttpError(
        `Product ${product} does not exists!`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  let alreadySubmittedReview;
  try {
    alreadySubmittedReview = await Review.findOne({
      user: userId,
      product: product,
    });
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to create review, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  if (alreadySubmittedReview) {
    return next(
      new HttpError(
        "You have already reviewed this product!",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  const review = new Review({
    rating,
    title,
    comment,
    user: userId,
    product,
  });
  try {
    await review.save();
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to create review, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res.status(StatusCodes.CREATED).json({ success: true, review: review });
};

const updateReview = async (req, res, next) => {
  const reviewId = req.params.rvId;
  let review;
  try {
    review = await Review.findById(reviewId);
  } catch (err) {
    return next(
      new HttpError(
        `Couldn't able to fetch the review, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!review) {
    return next(
      new HttpError(
        `Review ${reviewId} does not exists!`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  if (!checkPermissions(req.user, review.user)) {
    return next(
      new HttpError(
        "You are not authorized to update this review!",
        StatusCodes.FORBIDDEN
      )
    );
  }

  const { rating, title, comment } = req.body;
  review.rating = rating;
  review.title = title;
  review.comment = comment;

  try {
    await review.save();
  } catch (err) {
    return next(
      new HttpError(
        `Couldn't update review, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res.status(StatusCodes.OK).json({ success: true, review: review });
};

const deleteReview = async (req, res, next) => {
  const reviewId = req.params.rvId;
  let review;
  try {
    review = await Review.findById(reviewId);
  } catch (err) {
    return next(
      new HttpError(
        `Couldn't able to fetch the review, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!review) {
    return next(
      new HttpError(
        `Review ${reviewId} does not exists!`,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  if (!checkPermissions(req.user, review.user)) {
    return next(
      new HttpError(
        "You are not authorized to delete this review!",
        StatusCodes.FORBIDDEN
      )
    );
  }

  try {
    await review.deleteOne({ _id: reviewId });
  } catch (err) {
    return next(
      new HttpError(
        `Couldn't able to delete review, please try again`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  res.status(StatusCodes.OK).json({ success: true });
};

const getSingleProductReviews = async (req, res, next) => {
  let pId = req.params.pId;
  let reviews;
  try {
    reviews = await Review.find({ product: pId });
  } catch (err) {
    return next(
      new HttpError(
        `Couldn't able to get reviews of product, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!reviews) {
    return next(
      new HttpError(
        `Could not find reviews for product : ${pId}`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  res
    .status(StatusCodes.OK)
    .json({ success: true, totalCount: reviews.length, reviews: reviews });
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
