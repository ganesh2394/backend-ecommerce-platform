const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true,
  },
  price: {
    type: Number,
    required: [false, "Product price is required"],
    min: [0, "Price must be a positive number"],
  },
  category: {
    type: String,
    required: [false, "Product category is required"],
    trim: true,
  },
  stock: {
    type: Number,
    required: [false, "Stock quantity is required"],
    min: [0, "Stock must be a non-negative number"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
