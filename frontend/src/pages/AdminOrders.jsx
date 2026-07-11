import { useEffect, useState } from "react";
import API from "../services/api";
import { showSuccess, showError } from "../utils/toast";
import AdminLayout from "../components/AdminLayout";
import { FaBox, FaUser, FaRupeeSign } from "react-icons/fa";

const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    Shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "Out for Delivery": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    Delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    const fetchOrders = async () => {
        try {
            const { data } = await API.get("/orders");
            setOrders(data);
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

    const filtered = orders.filter((o) => {
        if (filter === "paid") return o.isPaid;
        if (filter === "unpaid") return !o.isPaid;
        if (filter === "pending") return o.status === "Pending";
        return true;
    });

    const stats = {
        total: orders.length,
        paid: orders.filter((o) => o.isPaid).length,
        revenue: orders.filter((o) => o.isPaid).reduce((s, o) => s + o.totalPrice, 0),
    };

    return (
        <AdminLayout title="Manage Orders" subtitle="View and update customer order status">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                    { label: "Total Orders", value: stats.total, icon: FaBox, color: "bg-blue-500" },
                    { label: "Paid Orders", value: stats.paid, icon: FaUser, color: "bg-green-500" },
                    { label: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: FaRupeeSign, color: "bg-yellow-500" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="qk-card p-4 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-white`}>
                            <Icon size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {[
                    { key: "all", label: "All" },
                    { key: "paid", label: "Paid" },
                    { key: "unpaid", label: "Unpaid" },
                    { key: "pending", label: "Pending" },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                            filter === key
                                ? "bg-yellow-500 text-gray-900"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="qk-card p-12 text-center text-gray-500 animate-pulse">Loading orders...</div>
            ) : filtered.length === 0 ? (
                <div className="qk-card p-12 text-center">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((order) => (
                        <div key={order._id} className="qk-card overflow-hidden animate-fade-in">
                            <div className="bg-yellow-400 px-6 py-3 flex flex-wrap items-center justify-between gap-2">
                                <p className="font-mono text-sm text-gray-900 truncate max-w-[200px] sm:max-w-none">
                                    {order._id}
                                </p>
                                <span className={`qk-badge ${statusColors[order.status] || statusColors.Pending}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <FaUser size={12} /> Customer
                                        </p>
                                        <p className="font-semibold text-gray-900 dark:text-white mt-1">
                                            {order.user?.name}
                                        </p>
                                        <p className="text-sm text-gray-500">{order.user?.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            ₹{order.totalPrice?.toLocaleString("en-IN")}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {order.isPaid ? "✅ Paid" : "⏳ Unpaid"} · {order.paymentMethod || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Update Status:
                                    </label>
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                        className="qk-input w-auto text-sm py-2"
                                    >
                                        <option>Pending</option>
                                        <option>Shipped</option>
                                        <option>Out for Delivery</option>
                                        <option>Delivered</option>
                                    </select>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
                                    {order.orderItems.map((item) => (
                                        <div
                                            key={item._id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                        >
                                            <img
                                                src={item.image || item.product?.images?.[0]}
                                                alt=""
                                                className="w-12 h-12 object-cover rounded-lg"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {item.name || item.product?.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Qty: {item.qty} · ₹{item.price}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminOrders;
