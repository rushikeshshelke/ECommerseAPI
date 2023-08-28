const mongoose = require("mongoose");
const uuid = require("uuid");

const SingleOrderItemSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: uuid.v4, identifier: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  product: { type: String, required: true, ref: "Product" },
});

module.exports = SingleOrderItemSchema;
