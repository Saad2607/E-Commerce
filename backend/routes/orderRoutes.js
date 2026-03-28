const express = require("express");
const router = express.Router();

const {createOrder, getMyOrders, getAllOrders, updateOrderStatus, getAdminStats} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// User
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);

// Admin
router.get("/", protect, admin, getAllOrders);
router.put("/:id", protect, admin, updateOrderStatus);

router.get("/admin/stats", protect, admin, getAdminStats);

module.exports = router;