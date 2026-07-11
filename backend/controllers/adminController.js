const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();

        const revenueData = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
        ]);

        const topProducts = await Product.find().sort({ rating: -1 }).limit(5);

        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue: revenueData[0]?.totalRevenue || 0,
            topProducts,
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
