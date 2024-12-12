const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const router = express.Router();
const authenticateUser = require("../middlewares/authMiddleware");

// Add product to cart (POST /api/cart/add)
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Input Validation: Check if all required fields are provided
    if (!userId || !productId || !quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Input Validation: Check if quantity is greater than 0
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the cart for the user or create a new one if it doesn't exist
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    // Check if the product is already in the cart
    const existingProduct = cart.products.find(
      (p) => p.productId.toString() === productId
    );
    if (existingProduct) {
      // Update the quantity if product already exists in the cart
      existingProduct.quantity += quantity;
    } else {
      // Add the new product to the cart
      cart.products.push({ productId, quantity });
    }

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error adding product to cart",
      error: error.message,
    });
  }
});

// Get user's cart (GET /api/cart/:userId)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the cart for the user
    const cart = await Cart.findOne({ userId }).populate(
      "products.productId",
      "name price"
    );

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving cart",
      error: error.message,
    });
  }
});

// Update product quantity in cart (PUT /api/cart/update/:userId/:productId)
router.put("/update/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    // Input Validation: Check if quantity is provided and is greater than 0
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    // Find the cart for the user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Find the product in the cart
    const product = cart.products.find(
      (p) => p.productId.toString() === productId
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    // Update the quantity
    product.quantity = quantity;

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating cart",
      error: error.message,
    });
  }
});

// Remove product from cart (DELETE /api/cart/remove/:userId/:productId)
router.delete("/remove/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    // Find the cart for the user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Remove the product from the cart
    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== productId
    );

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error removing product from cart",
      error: error.message,
    });
  }
});

// Clear user's cart (DELETE /api/cart/clear/:userId)
router.delete("/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the cart for the user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Clear all products in the cart
    cart.products = [];

    // Save the updated cart
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
});

module.exports = router;
