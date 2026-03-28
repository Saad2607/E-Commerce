const express = require("express");
const router = express.Router();

const {getProducts, getProductById, createProduct, updateProduct, deleteProduct, createReview, deleteReview} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

// Review
router.post("/:id/reviews", protect, createReview);
router.delete("/:id/reviews", protect, deleteReview);

module.exports = router;