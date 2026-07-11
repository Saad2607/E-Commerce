const Order = require("../models/Order");
const sendEmail = require("../config/email");
const User = require("../models/User");
const Product = require("../models/Product");
const generateInvoice = require("../utils/generateInvoice");
const { orderStatusTemplate } = require("../utils/emailTemplates");

const VALID_STATUSES = ["Pending", "Shipped", "Out for Delivery", "Delivered"];

// Create Order (unpaid — cart cleared and confirmation email sent after payment)
exports.createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod } = req.body;

        if (!Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ msg: "No items in order" });
        }

        const validatedItems = [];
        let totalPrice = 0;

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ msg: `Product not found` });
            }

            const qty = Math.max(1, Number(item.qty) || 1);
            const stock = product.stock ?? product.countInStock ?? 0;

            if (stock < qty) {
                return res.status(400).json({ msg: `Insufficient stock for ${product.name}` });
            }

            totalPrice += product.price * qty;
            validatedItems.push({
                product: product._id,
                name: product.name,
                qty,
                price: product.price,
                image: product.images?.[0] || "",
            });
        }

        const order = new Order({
            user: req.user._id,
            orderItems: validatedItems,
            shippingAddress,
            paymentMethod: paymentMethod || "Razorpay",
            totalPrice,
        });

        const createdOrder = await order.save();

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Get My Orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate("orderItems.product")
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrderInvoice = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: "Order not found" });
        }
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ msg: "Not authorized" });
        }
        if (!order.isPaid) {
            return res.status(400).json({ msg: "Invoice available only for paid orders" });
        }

        const user = await User.findById(req.user._id);
        const pdfBuffer = await generateInvoice(order, user);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="QuickKart-Invoice-${order._id}.pdf"`
        );
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Admin: Get All Orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("orderItems.product");

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Order status (Admin)
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ msg: "Order not found" });
        }

        if (!VALID_STATUSES.includes(req.body.status)) {
            return res.status(400).json({ msg: "Invalid order status" });
        }

        order.status = req.body.status;

        if (req.body.status === "Delivered") {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        await order.save();

        const user = await User.findById(order.user);
        if (user) {
            try {
                await sendEmail(
                    user.email,
                    "Order Update 🚚 — QuickKart",
                    orderStatusTemplate(order, user)
                );
            } catch (emailErr) {
                console.error("Order status email failed:", emailErr.message);
            }
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        const revenueData = await Order.aggregate([
            { $match: { isPaid: true } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                },
            },
        ]);

        res.json({
            totalOrders,
            totalUsers,
            totalProducts,
            totalRevenue: revenueData[0]?.totalRevenue || 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
