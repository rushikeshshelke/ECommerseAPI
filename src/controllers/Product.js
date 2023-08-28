require("dotenv").config();
const mongoose = require("mongoose");
const uuid = require("uuid");
const { StatusCodes } = require("http-status-codes");
const path = require("path");
const Product = require("../models/Product");
const Review = require("../models/Review");
const HttpError = require("../utils/HttpError");
const createQueryObject = require("../utils/QueryObject");
const pagination = require("../utils/Pagination");

const getAllProducts = async (req, res, next) => {
  let products;
  let queryObject = createQueryObject(req.query);
  const { limit, skip } = pagination(req.query);
  let sort = "";
  if (sort) {
    sort = req.query.sort.split(",").join(" ");
  }

  try {
    products = await Product.find(queryObject, "-__v")
      .populate("reviews")
      .sort(sort)
      .skip(skip)
      .limit(limit);
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to fetch products, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  res
    .status(StatusCodes.OK)
    .json({ success: true, totalCount: products.length, products: products });
};

const getSingleProduct = async (req, res, next) => {
  let pId = req.params.pId;
  let product;
  try {
    product = await Product.findById(pId, "-__v").populate("reviews");
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to fetch product, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!product) {
    return next(
      new HttpError(`Could not find product ${pId}`, StatusCodes.BAD_REQUEST)
    );
  }
  res.status(StatusCodes.OK).json({ success: true, product: product });
};

const createProduct = async (req, res, next) => {
  const {
    name,
    price,
    description,
    image,
    category,
    company,
    colors,
    featured,
    freeShipping,
    inventory,
    averageRating,
  } = req.body;
  const userId = req.user.userId;
  const product = new Product({
    name,
    price,
    description,
    image,
    category,
    company,
    colors,
    featured,
    freeShipping,
    inventory,
    averageRating,
    user: userId,
  });

  try {
    await product.save();
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to create product, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res.status(StatusCodes.CREATED).json({ success: true, product: product });
};

const updateProduct = async (req, res, next) => {
  let pId = req.params.pId;
  let product;
  try {
    product = await Product.findOneAndUpdate({ _id: pId }, req.body, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to update product, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  if (!product) {
    return next(
      new HttpError(`Could not find product ${pId}`, StatusCodes.BAD_REQUEST)
    );
  }
  res.status(StatusCodes.OK).json({ success: true, product: product });
};

const deleteProduct = async (req, res, next) => {
  let pId = req.params.pId;
  let product;
  try {
    product = await Product.findById(pId, "-__v");
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to fetch product, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  if (!product) {
    return next(
      new HttpError(`Could not find product ${pId}`, StatusCodes.BAD_REQUEST)
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await Review.deleteMany({ product: pId }, { session: sess });
    await await product.deleteOne({ _id: pId }, { session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to delete product, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  res.status(StatusCodes.NO_CONTENT).json({ success: true });
};

const uploadProductImage = async (req, res, next) => {
  console.log(req.files);
  if (!req.files) {
    return next(
      new HttpError(
        "No file selected, please try again!",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  if (!process.env.MIME_TYPES.includes(req.files.image.mimetype)) {
    return next(
      new HttpError(
        "Invalid file format, image should be either in jpeg, png or jpg format!",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  if (req.files.image.size > Number(process.env.MAX_FILE_SIZE)) {
    return next(
      new HttpError(
        "Image size should not be greater then 2 MB!",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  const imagePath = path.join(
    __dirname,
    `../../public/uploads/${uuid.v4()}.` + req.files.image.name.split(".")[1]
  );

  await req.files.image.mv(imagePath);

  res.status(StatusCodes.OK).json({
    success: true,
    image: `uploads/${uuid.v4()}.${req.files.image.name.split(".")[1]}`,
  });
};

module.exports = {
  getAllProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
