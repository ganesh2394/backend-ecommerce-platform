const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Replace this secret with your secure environment variable
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Sign Up route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Will be hashed automatically in the User model
      address,
    });
    const savedUser = await newUser.save();

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(500)
      .json({ message: "Error during signup.", error: error.message });
  }
});

// Sign In route
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" } // Token expires in 1 day
    );

    res.status(200).json({
      message: "User logged in successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error during signin:", error);
    res
      .status(500)
      .json({ message: "Error during signin.", error: error.message });
  }
});

// Update user details route (for address, etc.)
router.put("/updateuser/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, address } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.address = address || user.address;

    // Save updated user
    const updatedUser = await user.save();

    res.status(200).json({
      message: "User updated successfully.",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address,
      },
    });
  } catch (error) {
    console.error("Error during user update:", error);
    res
      .status(500)
      .json({ message: "Error during user update.", error: error.message });
  }
});

// Delete user route
router.delete("/deleteuser/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and delete user by ID
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error during user deletion:", error);
    res
      .status(500)
      .json({ message: "Error during user deletion.", error: error.message });
  }
});

module.exports = router;
