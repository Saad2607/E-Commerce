import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import PageLayout from "../components/PageLayout";

const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    Shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "Out for Delivery": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    Delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const statusSteps = ["Pending", "Shipped", "Out for Delivery", "Delivered"];

const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const { data } = await API.get("/orders/my");
            setOrders(data);
        } catch {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const downloadInvoice = async (orderId) => {
        try {
            setDownloadingId(orderId);
            const response = await API.get(`/orders/${orderId}/invoice`, {
                responseType: "blob",
            });

            const blob = response.data;
            const contentType = response.headers["content-type"] || "";

            if (!contentType.includes("application/pdf")) {
                const text = await blob.text();
                let message = "Could not download invoice";
                try {
                    const json = JSON.parse(text);
                    message = json.msg || json.message || message;
                } catch {
                    if (text) message = text;
                }
                throw new Error(message);
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `QuickKart-Invoice-${orderId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Invoice downloaded");
        } catch (err) {
            let message = "Could not download invoice";
            const data = err.response?.data;
            if (data instanceof Blob) {
                try {
                    const text = await data.text();
                    const json = JSON.parse(text);
                    message = json.msg || json.message || message;
                } catch {
                    /* keep default message */
                }
            } else if (err.response?.data?.msg || err.response?.data?.message) {
                message = err.response.data.msg || err.response.data.message;
            } else if (err.message) {
                message = err.message;
            }
            toast.error(message);
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <PageLayout title="My Orders" subtitle="Track your orders and download invoices" maxWidth="max-w-5xl">
                {loading ? (
                    <div className="qk-card p-12 text-center">
                        <p className="text-gray-500 dark:text-gray-400">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="qk-card p-12 text-center">
                        <p className="text-5xl mb-4">📦</p>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No orders yet
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            When you place an order, it will show up here.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="qk-btn-primary px-6 py-2.5"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const currentStep = statusSteps.indexOf(order.status);

                            return (
                                <div
                                    key={order._id}
                                    className="qk-card overflow-hidden"
                                >
                                    <div className="bg-yellow-400 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-700">
                                                QuickKart Order
                                            </p>
                                            <p className="font-mono text-sm text-gray-900 mt-0.5">
                                                {order._id}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₹{order.totalPrice}
                                            </p>
                                            <span
                                                className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    statusColors[order.status] || statusColors.Pending
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                                                    Order Date
                                                </p>
                                                <p className="font-medium text-gray-900 dark:text-white mt-1">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                                                    Payment
                                                </p>
                                                <p className="font-medium text-gray-900 dark:text-white mt-1">
                                                    {order.isPaid ? "✅ Paid" : "⏳ Unpaid"} ·{" "}
                                                    {order.paymentMethod || "Razorpay"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase">
                                                    Shipping To
                                                </p>
                                                <p className="font-medium text-gray-900 dark:text-white mt-1">
                                                    {order.shippingAddress?.address
                                                        ? `${order.shippingAddress.address}, ${order.shippingAddress.city}`
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <div className="flex items-center justify-between">
                                                {statusSteps.map((step, index) => (
                                                    <div
                                                        key={step}
                                                        className="flex flex-col items-center flex-1 relative"
                                                    >
                                                        {index > 0 && (
                                                            <div
                                                                className={`absolute top-3 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                                                                    index <= currentStep
                                                                        ? "bg-yellow-400"
                                                                        : "bg-gray-200 dark:bg-gray-600"
                                                                }`}
                                                                style={{ width: "calc(100% - 24px)", right: "50%" }}
                                                            />
                                                        )}
                                                        <div
                                                            className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                                index <= currentStep
                                                                    ? "bg-yellow-400 text-gray-900"
                                                                    : "bg-gray-200 dark:bg-gray-600 text-gray-500"
                                                            }`}
                                                        >
                                                            {index < currentStep ? "✓" : index + 1}
                                                        </div>
                                                        <p
                                                            className={`mt-2 text-[10px] sm:text-xs text-center ${
                                                                index <= currentStep
                                                                    ? "text-gray-900 dark:text-white font-medium"
                                                                    : "text-gray-400"
                                                            }`}
                                                        >
                                                            {step}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-5 space-y-3">
                                        {order.orderItems.map((item) => (
                                            <div
                                                key={item._id}
                                                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                                            >
                                                <img
                                                    src={item.image || item.product?.images?.[0]}
                                                    alt={item.name || item.product?.name}
                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                                        {item.name || item.product?.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Qty: {item.qty} · ₹{item.price || item.product?.price} each
                                                    </p>
                                                </div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    ₹{(item.price || item.product?.price) * item.qty}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {order.orderItems.length} item
                                            {order.orderItems.length !== 1 ? "s" : ""} · Grand total{" "}
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                ₹{order.totalPrice}
                                            </span>
                                        </p>

                                        {order.isPaid && (
                                            <button
                                                onClick={() => downloadInvoice(order._id)}
                                                disabled={downloadingId === order._id}
                                                className="inline-flex items-center gap-2 bg-gray-900 dark:bg-yellow-400 dark:text-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                            >
                                                📎{" "}
                                                {downloadingId === order._id
                                                    ? "Downloading..."
                                                    : "Download Invoice PDF"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
        </PageLayout>
    );
};

export default MyOrders;
