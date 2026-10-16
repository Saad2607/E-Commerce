import { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import { showSuccess, showError } from "../utils/toast";
import AdminLayout from "../components/AdminLayout";
import { FaBox, FaUser, FaRupeeSign, FaClock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    Shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "Out for Delivery": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    Delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const formatDate = (date) => {
    if (!date) return "Recent";
    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const isNewOrder = (date) => {
    if (!date) return false;
    const diffHours = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const fetchOrders = async () => {
        try {
            const { data } = await API.get("/orders");
            // Ensure orders are strictly sorted descending (newest on top)
            const sorted = [...(data || [])].sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
            setOrders(sorted);
        } catch {
            showError("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/orders/${id}`, { status });
            showSuccess("Status updated ✅");
            fetchOrders();
        } catch {
            showError("Error updating status");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filtered = useMemo(() => {
        return orders
            .filter((o) => {
                if (filter === "paid") return o.isPaid;
                if (filter === "unpaid") return !o.isPaid;
                if (filter === "pending") return o.status === "Pending";
                if (filter === "delivered") return o.status === "Delivered";
                return true;
            })
            // Extra guarantee: newest orders always on top
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }, [orders, filter]);

    const stats = {
        total: orders.length,
        paid: orders.filter((o) => o.isPaid).length,
        revenue: orders.filter((o) => o.isPaid).reduce((s, o) => s + (o.totalPrice || 0), 0),
    };

    return (
        <AdminLayout
            title="Order Management"
            subtitle="Monitor incoming store orders (newest on top), track fulfillment, and update delivery statuses"
        >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
                {[
                    { label: "Total Orders", value: stats.total, icon: FaBox, color: "bg-blue-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/30" },
                    { label: "Paid Orders", value: stats.paid, icon: FaCheckCircle, color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" },
                    { label: "Settled Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: FaRupeeSign, color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="qk-card p-5 flex items-center gap-4 border-gray-200 dark:border-gray-800/90 shadow-xl">
                        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-sm`}>
                            <Icon size={19} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5 gold-gradient-text">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { key: "all", label: `All Orders (${orders.length})` },
                    { key: "paid", label: "Paid via Razorpay" },
                    { key: "unpaid", label: "Unpaid / Pending" },
                    { key: "pending", label: "Awaiting Fulfillment" },
                    { key: "delivered", label: "Delivered" },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                            filter === key
                                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 shadow-md shadow-amber-500/20"
                                : "bg-white dark:bg-[#111827]/90 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-white shadow-sm"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="qk-card p-12 text-center text-gray-500 dark:text-gray-400 animate-pulse border-gray-200 dark:border-gray-800">
                    Loading order registry...
                </div>
            ) : filtered.length === 0 ? (
                <div className="qk-card p-16 text-center border-gray-200 dark:border-amber-500/20">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No customer orders matching this filter.</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {filtered.map((order, index) => {
                        const isLatest = index === 0;
                        const isRecent = isNewOrder(order.createdAt);

                        return (
                            <div
                                key={order._id}
                                className={`qk-card overflow-hidden border transition-all duration-200 shadow-xl animate-fade-in ${
                                    isLatest
                                        ? "border-amber-500/40 dark:border-amber-500/40 ring-1 ring-amber-500/20"
                                        : "border-gray-200 dark:border-gray-800/90"
                                }`}
                            >
                                {/* Order Header */}
                                <div className="bg-gradient-to-r from-amber-500/10 via-gray-50 to-gray-50 dark:via-[#111827] dark:to-[#111827] px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                                            Order ID
                                        </span>
                                        <p className="font-mono text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                                            {order._id}
                                        </p>
                                        {isLatest && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-gray-950 animate-pulse">
                                                Newest Order
                                            </span>
                                        )}
                                        {!isLatest && isRecent && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                                Recent
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 font-mono">
                                            <FaClock size={11} className="text-amber-500" />
                                            {formatDate(order.createdAt)}
                                        </span>
                                        <span className={`qk-badge ${statusColors[order.status] || statusColors.Pending}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 pb-5 border-b border-gray-200 dark:border-gray-800">
                                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800">
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                                                <FaUser size={11} className="text-amber-600 dark:text-amber-400" /> Customer Account
                                            </p>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm mt-1">
                                                {order.user?.name || "Anonymous Customer"}
                                            </p>
                                            <p className="text-xs text-amber-600 dark:text-amber-400/80 font-mono mt-0.5">
                                                {order.user?.email || "No email provided"}
                                            </p>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Payment Status</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-xs mt-1">
                                                    {order.isPaid ? "✅ Verified Razorpay" : "⏳ Unpaid / Pending"}
                                                </p>
                                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                                                    Method: {order.paymentMethod || "Razorpay"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Order Total</p>
                                                <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white gold-gradient-text mt-0.5">
                                                    ₹{order.totalPrice?.toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Control Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/90 border border-gray-200 dark:border-amber-500/20">
                                        <label className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                            Update Fulfillment Status:
                                        </label>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            className="qk-input w-auto text-xs font-bold py-1.5 px-3"
                                        >
                                            <option>Pending</option>
                                            <option>Shipped</option>
                                            <option>Out for Delivery</option>
                                            <option>Delivered</option>
                                        </select>
                                    </div>

                                    {/* Order Item Breakdown */}
                                    <div className="space-y-2.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Purchased Products ({order.orderItems?.length || 0})
                                        </p>
                                        {order.orderItems.map((item) => (
                                            <div
                                                key={item._id}
                                                className="flex items-center gap-3.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/60 border border-gray-200 dark:border-gray-800/80 shadow-sm"
                                            >
                                                <img
                                                    src={item.image || item.product?.images?.[0]}
                                                    alt=""
                                                    className="w-12 h-12 object-contain rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-1"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 dark:text-white text-xs truncate">
                                                        {item.name || item.product?.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                        Qty: <span className="font-mono text-gray-900 dark:text-white">{item.qty}</span> · ₹{item.price?.toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-xs gold-gradient-text">
                                                    ₹{((item.price || 0) * item.qty).toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminOrders;
