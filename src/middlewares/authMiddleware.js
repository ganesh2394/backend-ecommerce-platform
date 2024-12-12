const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Assuming you have a User model

// Middleware to check if the user is authenticated
const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", ""); // Expecting token in Authorization header as Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is missing or invalid",
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET should be stored in .env file

    // Find the user by ID (or any relevant field from the decoded token)
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach user data to request object to use in the route handlers
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticateUser;
