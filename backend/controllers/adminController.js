const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getDashboardStats = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const orders = await Order.find({})
        .populate("user", "name email")
        .sort({ createdAt: -1 });
    const totalRevenue = orders.reduce(
        (acc, item) => acc + item.totalPrice,
        0
    );

    const topProducts = await Product.find().sort({ rating: -1 }).limit(5);

    res.json({
        totalUsers,
        totalOrders,
        totalRevenue,
        topProducts
    });
};