const mongoose = require("mongoose");
const uuid = require("uuid");

const ProductSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      default: uuid.v4,
      identifier: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      minLenght: 3,
      maxLength: 100,
    },
    price: { type: Number, required: true, default: 0 },
    description: { type: String, trim: true, required: true, maxLength: 1000 },
    image: { type: String, default: "/uploads/example.jpeg" },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["office", "kitchen", "sports", "bedroom", "home"],
        message: "{VALUE} is not supported!",
      },
    },
    company: {
      type: String,
      required: true,
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported!",
      },
    },
    colors: { type: [String], required: true },
    featured: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: false },
    inventory: { type: Number, default: 10 },
    averageRating: { type: Number, default: 0 },
    noOfReviews: { type: Number, default: 0 },
    user: { type: String, required: true, ref: "User" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

ProductSchema.pre("remove", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
});

module.exports = mongoose.model("Product", ProductSchema);
