const mongoose = require("mongoose");
require("dotenv").config(); // Ensure dotenv is loaded

const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URL).then(() => {
      console.log("Database connected successfully.");
    });
  } catch (error) {
    console.error("Error connecting to the database: ", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
