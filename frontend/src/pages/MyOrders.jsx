import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { showSuccess, showError } from "../utils/toast";
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
            showError("Failed to load orders");
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

            showSuccess("Invoice downloaded");
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
            showError(message);
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
                                    className="qk-card overflow-hidden border-gray-200 dark:border-gray-800/90 shadow-xl"
                                >
                                    {/* Order Header */}
                                    <div className="bg-gradient-to-r from-amber-500/10 via-gray-50 to-gray-50 dark:via-[#111827] dark:to-[#111827] px-4 sm:px-6 py-3.5 sm:py-4.5 flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 dark:border-gray-800">
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                                Verified Purchase
                                            </span>
                                            <p className="font-mono text-xs sm:text-sm text-gray-900 dark:text-white font-bold mt-0.5 truncate max-w-[200px] sm:max-w-none">
                                                ID: {order._id}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white gold-gradient-text">
                                                ₹{order.totalPrice?.toLocaleString("en-IN")}
                                            </p>
                                            <span
                                                className={`inline-block mt-1 px-2.5 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                                                    statusColors[order.status] || statusColors.Pending
                                                }`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Details & Stepper */}
                                    <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-800">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm mb-6">
                                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800/80">
                                                <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                                                    Order Timestamp
                                                </p>
                                                <p className="font-bold text-gray-900 dark:text-white text-xs mt-1">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800/80">
                                                <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                                                    Payment Status
                                                </p>
                                                <p className="font-bold text-gray-900 dark:text-white text-xs mt-1">
                                                    {order.isPaid ? "✅ Paid with Razorpay" : "⏳ Payment Pending"}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800/80">
                                                <p className="text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider font-semibold">
                                                    Destination
                                                </p>
                                                <p className="font-bold text-gray-900 dark:text-white text-xs truncate mt-1">
                                                    {order.shippingAddress?.address || "Standard Address"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Stepper */}
                                        <div className="pt-2 pb-1">
                                            <div className="flex items-center justify-between">
                                                {statusSteps.map((step, index) => (
                                                    <div
                                                        key={step}
                                                        className="flex flex-col items-center flex-1 relative"
                                                    >
                                                        {index > 0 && (
                                                            <div
                                                                className={`absolute top-3.5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                                                                    index <= currentStep
                                                                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                                                        : "bg-gray-200 dark:bg-gray-800"
                                                                }`}
                                                                style={{ width: "calc(100% - 28px)", right: "50%" }}
                                                            />
                                                        )}
                                                        <div
                                                            className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                                index <= currentStep
                                                                    ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-gray-950 shadow-gold-sm"
                                                                    : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700"
                                                            }`}
                                                        >
                                                            {index < currentStep ? "✓" : index + 1}
                                                        </div>
                                                        <p
                                                            className={`mt-2 text-[10px] sm:text-xs text-center font-medium ${
                                                                index <= currentStep
                                                                    ? "text-amber-600 dark:text-amber-400 font-bold"
                                                                    : "text-gray-500"
                                                            }`}
                                                        >
                                                            {step}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-3 bg-gray-50/50 dark:bg-[#0b0f17]/40">
                                        {order.orderItems.map((item) => (
                                            <div
                                                key={item._id}
                                                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#0b0f17]/90 border border-gray-200 dark:border-gray-800/80 shadow-sm"
                                            >
                                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-b from-gray-100 to-gray-200 dark:from-[#161f30]/60 dark:to-[#0b0f17] p-1.5 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-800">
                                                    <img
                                                        src={item.image || item.product?.images?.[0]}
                                                        alt={item.name || item.product?.name}
                                                        className="max-h-full max-w-full object-contain filter drop-shadow"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                                                        {item.name || item.product?.name}
                                                    </p>
                                                    <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        Qty: <span className="font-mono text-gray-900 dark:text-white">{item.qty}</span> · ₹{(item.price || item.product?.price)?.toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                                <p className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm gold-gradient-text shrink-0">
                                                    ₹{((item.price || item.product?.price) * item.qty).toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Footer & Actions */}
                                    <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-50 dark:bg-[#111827] flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-t border-gray-200 dark:border-gray-800">
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Includes {order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""} · Total:{" "}
                                            <span className="font-black text-gray-900 dark:text-white text-sm">
                                                ₹{order.totalPrice?.toLocaleString("en-IN")}
                                            </span>
                                        </p>

                                        {order.isPaid && (
                                            <button
                                                onClick={() => downloadInvoice(order._id)}
                                                disabled={downloadingId === order._id}
                                                className="qk-btn-primary px-5 py-2.5 text-xs uppercase tracking-wider font-extrabold inline-flex items-center gap-2 shadow-md disabled:opacity-50"
                                            >
                                                📄 {downloadingId === order._id ? "Generating PDF..." : "Download Tax Invoice"}
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
