const mongoose = require("mongoose");
const uuid = require("uuid");
const SingleOrderItemSchema = require("./Cart");

// const SingleCartItemSchema = new mongoose.Schema({
//   _id: { type: String, required: true, default: uuid.v4, identifier: true },
//   name: { type: String, required: true },
//   image: { type: String, required: true },
//   price: { type: Number, required: true },
//   amount: { type: Number, required: true },
//   product: { type: String, required: true, ref: "Product" },
// });

const OrderSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true, default: uuid.v4, identifier: true },
    tax: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    subTotal: { type: Number, required: true },
    total: { type: Number, required: true },
    orderItems: [SingleOrderItemSchema],
    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "canceled"],
      default: "pending",
    },
    user: { type: String, required: true, ref: "User" },
    clientSecret: { type: String, required: true },
    transationId: { type: String, default: "" },
  },
  { timestamps: true }
);

OrderSchema.methods.updateInventory = async function () {
  for (const item of this.orderItems) {
    let product;
    console.log(item);
    product = await this.model("Product").findOne({ _id: item.product });
    console.log(product);
    product.inventory = product.inventory - item.quantity;
    await product.save();
  }
};

module.exports = mongoose.model("Order", OrderSchema);
