const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const uuid = require("uuid");
const Order = require("../models/Order");
const Product = require("../models/Product");
const checkPermissions = require("../utils/CheckPermissions");
const HttpError = require("../utils/HttpError");
const createQueryObject = require("../utils/QueryObject");
const pagination = require("../utils/Pagination");

const fakeStripeAPI = async ({ amount, current }) => {
  const clientSecret = uuid.v4();
  return { clientSecret, amount };
};

const getAllOrders = async (req, res, next) => {
  let orders;
  let queryObject = createQueryObject(req.query);
  const { limit, skip } = pagination(req.query);
  try {
    orders = await Order.find(queryObject)
      .skip(skip)
      .limit(limit)
      .sort("-createdAt");
  } catch (err) {
    return next(
      new HttpError(
        `Couldn't able to fetch order, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  res
    .status(StatusCodes.OK)
    .json({ success: true, totalCount: orders.length, orders: orders });
};

const getSingleOrder = async (req, res, next) => {
  let order;
  const orderId = req.params.orderId;
  try {
    order = await Order.findById(orderId);
  } catch (err) {
    return next(
      new HttpError(
        `Couldn't able to fetch order, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  if (!order) {
    return next(
      new HttpError(`Order ${orderId} does not exists`, StatusCodes.BAD_REQUEST)
    );
  }
  if (!checkPermissions(req.user, order.user)) {
    return next(
      new HttpError(
        "You are not authorized to see this content!",
        StatusCodes.FORBIDDEN
      )
    );
  }

  res.status(StatusCodes.OK).json({ success: true, order: order });
};

const getCurrentUserOrders = async (req, res, next) => {
  const userId = req.user.userId;
  let orders;
  try {
    orders = await Order.find({ user: userId });
  } catch (err) {
    return next(
      new HttpError(
        `Couldn't able to fetch order, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res
    .status(StatusCodes.OK)
    .json({ success: true, totalCount: orders.length, orders: orders });
};

const createOrder = async (req, res, next) => {
  const { tax, shippingFee, items } = req.body;
  console.log(req.body);
  let orderItems = [];
  let subTotal = 0;
  for (const item of items) {
    let product;
    try {
      product = await Product.findOne({ _id: item.product });
    } catch (err) {
      return next(
        new HttpError(
          `Something went wrong, Please try again : ${err}`,
          StatusCodes.INTERNAL_SERVER_ERROR
        )
      );
    }
    if (!product) {
      return next(
        new HttpError(
          `Product ${item.product} does not exists!`,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    if (product.inventory < item.quantity) {
      return next(
        new HttpError(
          `Couldn't place the order, Stock is unavailable!`,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    const { name, price, image, _id } = product;
    const singleCartItem = {
      quantity: item.quantity,
      name,
      price,
      image,
      product: _id,
    };
    orderItems = [...orderItems, singleCartItem];
    subTotal += item.quantity * price;
  }
  const total = tax + shippingFee + subTotal;

  const payment = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = new Order({
    tax,
    shippingFee,
    subTotal,
    total,
    orderItems,
    user: req.user.userId,
    clientSecret: payment.clientSecret,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await order.save({ session: sess });
    await order.updateInventory();
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError(
        `Could not able to place order, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  res.status(StatusCodes.CREATED).json({ success: true, order: order });
};

const updateOrder = async (req, res, next) => {
  let order;
  const orderId = req.params.orderId;
  try {
    order = await Order.findById(orderId);
  } catch (err) {
    return next(
      new HttpError(
        `Couldn't able to fetch order, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }

  if (!order) {
    return next(
      new HttpError(`Order ${orderId} does not exists`, StatusCodes.BAD_REQUEST)
    );
  }
  if (!checkPermissions(req.user, order.user)) {
    return next(
      new HttpError(
        "You are not authorized to see this content!",
        StatusCodes.FORBIDDEN
      )
    );
  }
  const { transationId, status } = req.body;
  order.transationId = transationId;
  order.status = status;
  try {
    await order.save();
  } catch (err) {
    return next(
      new HttpError(
        `Couldn't able to update the order, please try again : ${err}`,
        StatusCodes.INTERNAL_SERVER_ERROR
      )
    );
  }
  res.status(StatusCodes.OK).json({ success: true, order: order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
