const express = require("express");
const router = express.Router();

const {addToCart, removeFromCart, getCart} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.delete("/:productId", protect, removeFromCart);

module.exports = router;