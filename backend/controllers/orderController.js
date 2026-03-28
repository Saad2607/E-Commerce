const Order = require("../models/Order");
const sendEmail = require("../config/email");
const { orderTemplate } = require("../utils/emailTemplates");
const User = require("../models/User");
const generateInvoice = require("../utils/generateInvoice");
const Product = require("../models/Product");

// Create Order
exports.createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;
        const user = await User.findById(req.user._id);

        if (orderItems.length === 0) {
            return res.status(400).json({ msg: "No items in order" });
        }

        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
        });

        const createdOrder = await order.save();

        const pdfBuffer = await generateInvoice(createdOrder);

        await sendEmail(
            user.email,
            "Order Confirmation 🛒",
            orderTemplate(createdOrder, user),
            [
                {
                    filename: "invoice.pdf",
                    content: pdfBuffer,
                }
            ]
        );

        const users = await User.findById(req.user._id);
        users.cart = [];
        await users.save();

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
    const order = await Order.findById(req.params.id);
    const user = await User.findById(order.user);

    order.status = req.body.status;

    if (req.body.status === "Delivered") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    }

    await order.save();

    await sendEmail(
        user.email,
        "Order Update 🚚",
        `
            <h2>Order Status Updated</h2>
            <p>Order ID: ${order._id}</p>
            <p>Updated Status: ${order.status}</p>
        `
    );

    res.json(order);
};

exports.getAdminStats = async (req, res) => {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const revenueData = await Order.aggregate([
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
};