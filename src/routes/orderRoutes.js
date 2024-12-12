const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const router = express.Router();

// Place an order (POST /api/order/place)
router.post("/place", async (req, res) => {
  try {
    const { userId, cartId, shippingAddress, paymentMethod } = req.body;

    // Find the cart by cartId
    const cart = await Cart.findById(cartId).populate(
      "products.productId",
      "price"
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Calculate the total amount
    let totalAmount = 0;
    cart.products.forEach((product) => {
      totalAmount += product.productId.price * product.quantity;
    });

    // Create a new order
    const order = new Order({
      userId,
      cartId,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    await order.save();

    // Optionally, clear the cart after placing the order
    // cart.products = [];
    // await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error placing the order",
      error: error.message,
    });
  }
});

// Get all orders for a user (GET /api/order/user/:userId)
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all orders for the user
    const orders = await Order.find({ userId }).populate("cartId", "products");
    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving orders",
      error: error.message,
    });
  }
});

// Get a specific order by ID (GET /api/order/:orderId)
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order by orderId
    const order = await Order.findById(orderId).populate("cartId", "products");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving order",
      error: error.message,
    });
  }
});

// Update the order status (PUT /api/order/update/:orderId)
router.put("/update/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Update the status of the order
    order.status = status;
    order.updatedAt = Date.now();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
});

// Update the payment status (PUT /api/order/payment/:orderId)
router.put("/payment/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    // Find the order by orderId
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Update the payment status
    order.paymentStatus = paymentStatus;
    order.updatedAt = Date.now();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message,
    });
  }
});

module.exports = router;
