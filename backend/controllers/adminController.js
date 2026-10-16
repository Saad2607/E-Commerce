const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();

        const paidOrders = await Order.find({ isPaid: true }).select("totalPrice createdAt");
        const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const paidOrdersCount = paidOrders.length;
        const pendingOrdersCount = await Order.countDocuments({ status: "Pending" });
        const averageOrderValue = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;

        // 1. Chronological Sales & Order Trends (Last 7 Days)
        const allOrders = await Order.find().select("totalPrice isPaid status createdAt").sort({ createdAt: 1 });

        const dateMap = {};
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
            const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            dateMap[dateKey] = { date: label, revenue: 0, orders: 0 };
        }

        allOrders.forEach((o) => {
            if (o.createdAt) {
                const dateKey = new Date(o.createdAt).toISOString().split("T")[0];
                if (dateMap[dateKey]) {
                    dateMap[dateKey].orders += 1;
                    if (o.isPaid) {
                        dateMap[dateKey].revenue += (o.totalPrice || 0);
                    }
                } else {
                    const label = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    dateMap[dateKey] = {
                        date: label,
                        orders: 1,
                        revenue: o.isPaid ? (o.totalPrice || 0) : 0,
                    };
                }
            }
        });

        const salesTrends = Object.entries(dateMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, val]) => val);

        // 2. Order Status Breakdown
        const statusMap = {
            Pending: 0,
            Shipped: 0,
            "Out for Delivery": 0,
            Delivered: 0,
        };

        allOrders.forEach((o) => {
            const st = o.status || "Pending";
            if (statusMap[st] !== undefined) {
                statusMap[st] += 1;
            } else {
                statusMap[st] = 1;
            }
        });

        const statusBreakdown = [
            { name: "Pending", count: statusMap.Pending, color: "#f59e0b" },
            { name: "Shipped", count: statusMap.Shipped, color: "#3b82f6" },
            { name: "Out for Delivery", count: statusMap["Out for Delivery"], color: "#a855f7" },
            { name: "Delivered", count: statusMap.Delivered, color: "#10b981" },
        ];

        // 3. Category Inventory & Distribution Breakdown
        const categories = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 }, avgPrice: { $avg: "$price" } } },
            { $sort: { count: -1 } },
        ]);

        const categoryBreakdown = categories.map((c) => ({
            category: c._id || "General",
            count: c.count,
            avgPrice: Math.round(c.avgPrice || 0),
        }));

        // 4. Top Rated Products
        const topProducts = await Product.find().sort({ rating: -1, numReviews: -1 }).limit(5);

        // 5. Recent 5 Orders (Newest on top)
        const recentOrders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue,
            paidOrdersCount,
            pendingOrdersCount,
            averageOrderValue,
            salesTrends,
            statusBreakdown,
            categoryBreakdown,
            topProducts,
            recentOrders,
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
