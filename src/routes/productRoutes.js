const Product = require("../models/Product");
const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

// Middleware to validate product input
const validateProductInput = [
  body("name").notEmpty().withMessage("Product name is required"),
  body("description").notEmpty().withMessage("Product description is required"),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
  body("category").notEmpty().withMessage("Product category is required"),
  body("stock").isInt({ gt: 0 }).withMessage("Stock must be a positive number"),
];

// GET all products with pagination, sorting, and filtering
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "price",
      order = "asc",
      category,
      minPrice,
      maxPrice,
      stockAvailable,
    } = req.query;

    // Building the query object dynamically based on the filters
    const query = {};
    if (category) query.category = category;
    if (minPrice) query.price = { $gte: minPrice };
    if (maxPrice) query.price = { ...query.price, $lte: maxPrice };
    if (stockAvailable) query.stock = { $gt: 0 };

    const products = await Product.find(query)
      .sort({ [sort]: order === "asc" ? 1 : -1 }) // Sorting
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

// POST a new product
router.post("/addproduct", validateProductInput, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation errors",
      errors: errors.array(),
    });
  }

  try {
    const { name, description, price, category, stock } = req.body;
    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
    });

    const savedProduct = await product.save();
    res.status(201).json({
      message: "Product created successfully!",
      product: savedProduct,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating product",
      error: error.message,
    });
  }
});

// PUT to update a product by ID
router.put(
  "/updateproduct/:productId",
  validateProductInput,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    try {
      const product = await Product.findByIdAndUpdate(
        req.params.productId,
        req.body,
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({
        message: "Product updated successfully!",
        product,
      });
    } catch (error) {
      res.status(400).json({
        message: "Error updating product",
        error: error.message,
      });
    }
  }
);

// DELETE a product by ID
router.delete("/deleteproduct/:productId", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
});

// GET a single product by ID
router.get("/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
});

// SEARCH products by name, description, or category
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query; // The search term
    const regex = new RegExp(query, "i"); // Case-insensitive regex search
    const products = await Product.find({
      $or: [{ name: regex }, { description: regex }, { category: regex }],
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching for products",
      error: error.message,
    });
  }
});

module.exports = router;
