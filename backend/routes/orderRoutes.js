const express = require("express");
const router = express.Router();

const {createOrder, getMyOrders, getAllOrders, updateOrderStatus, getAdminStats, getOrderInvoice} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// User
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);

// Admin (specific paths before /:id routes)
router.get("/admin/stats", protect, admin, getAdminStats);
router.get("/", protect, admin, getAllOrders);
router.put("/:id", protect, admin, updateOrderStatus);

router.get("/:id/invoice", protect, getOrderInvoice);

module.exports = router;