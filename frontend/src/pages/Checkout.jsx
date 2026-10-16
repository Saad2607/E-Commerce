import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { showSuccess, showError } from "../utils/toast";
import { useNavigate } from "react-router-dom";
import { getStoredUser } from "../utils/getStoredUser";
import PageLayout from "../components/PageLayout";
import { FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";

const Checkout = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const submittingRef = useRef(false);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const { data } = await API.get("/cart");
                setCart(data);
            } catch (err) {
                showError(err.response?.data?.msg || "Failed to load cart");
            }
        };
        fetchCart();
    }, []);

    const totalPrice = cart.reduce(
        (acc, item) => acc + (item.product?.price ?? 0) * item.qty,
        0
    );

    const placeOrder = async () => {
        if (submittingRef.current) return;
        if (!address) return showError("Please enter shipping address ❌");
        if (cart.length === 0) return showError("Your cart is empty ❌");
        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
            return showError("Razorpay Key ID missing in frontend .env ❌");
        }
        if (!window.Razorpay) {
            return showError("Razorpay script failed to load. Refresh the page ❌");
        }

        submittingRef.current = true;
        setLoading(true);

        try {
            const orderItems = cart.map((item) => ({
                product: item.product._id,
                name: item.product.name,
                qty: item.qty,
                price: item.product.price,
                image: item.product.images?.[0],
            }));

            const { data: order } = await API.post("/orders", {
                orderItems,
                shippingAddress: { address, city: "", postalCode: "", country: "India" },
                paymentMethod: "Razorpay",
            });

            const { data: paymentData } = await API.post("/payment/create-order", {
                orderId: order._id,
            });

            const user = getStoredUser();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: paymentData.amount,
                currency: paymentData.currency,
                name: "QuickKart",
                description: "Order Payment",
                order_id: paymentData.razorpayOrderId,
                handler: async (response) => {
                    try {
                        const { data } = await API.post("/payment/verify", {
                            orderId: order._id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        showSuccess("Payment Successful ✅");
                        if (data.emailSent === false) {
                            showError(
                                "Payment done, but confirmation email could not be sent. Check spam or contact support."
                            );
                        }
                        navigate("/order-success", { state: { paid: true, orderId: order._id } });
                    } catch (err) {
                        showError(
                            err.response?.data?.msg ||
                                "Payment verification failed. Check My Orders or contact support."
                        );
                    } finally {
                        setLoading(false);
                        submittingRef.current = false;
                    }
                },
                prefill: { name: user?.name || "", email: user?.email || "" },
                theme: { color: "#EAB308" },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", () => {
                showError("Payment Failed ❌");
                setLoading(false);
                submittingRef.current = false;
            });
            rzp.on("modal.closed", () => {
                setLoading(false);
                submittingRef.current = false;
            });
            rzp.open();
        } catch (err) {
            showError(
                err.response?.data?.msg ||
                    err.response?.data?.message ||
                    err.message ||
                    "Order Failed ❌"
            );
            setLoading(false);
            submittingRef.current = false;
        }
    };

    return (
        <PageLayout title="Secure Checkout" subtitle="Review your luxury order and complete payment with Razorpay">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {/* Shipping Address */}
                    <div className="qk-card p-6 sm:p-7 border-gray-200 dark:border-gray-800/90 shadow-xl">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <FaMapMarkerAlt size={14} />
                            </div>
                            <h2 className="font-extrabold text-gray-900 dark:text-white text-base tracking-tight">
                                Delivery Address
                            </h2>
                        </div>
                        <textarea
                            placeholder="Enter your street address, apartment, city, state and PIN code..."
                            className="qk-input min-h-[110px] resize-none leading-relaxed"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                        <p className="text-[11px] text-gray-500 mt-2">
                            Please ensure your address is accurate to receive timely delivery notifications.
                        </p>
                    </div>

                    {/* Order Items Preview */}
                    <div className="qk-card p-6 sm:p-7 border-gray-200 dark:border-gray-800/90 shadow-xl">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="font-extrabold text-gray-900 dark:text-white text-base tracking-tight">
                                Order Items ({cart.length})
                            </h2>
                            <span className="text-xs text-amber-600 dark:text-amber-400 font-mono">
                                Standard Insured Delivery
                            </span>
                        </div>
                        <div className="space-y-3">
                            {cart.map((item) => (
                                <div
                                    key={item.product?._id}
                                    className="flex items-center gap-4 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800/80"
                                >
                                    <div className="w-16 h-16 rounded-lg bg-gradient-to-b from-gray-100 to-gray-200 dark:from-[#161f30]/60 dark:to-[#0b0f17] p-1.5 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-800">
                                        <img
                                            src={item.product?.images?.[0]}
                                            alt=""
                                            className="max-h-full max-w-full object-contain filter drop-shadow"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">
                                            {item.product?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Qty: <span className="font-mono text-gray-900 dark:text-white">{item.qty}</span> · ₹{item.product?.price?.toLocaleString("en-IN")} each
                                        </p>
                                    </div>
                                    <p className="font-extrabold text-gray-900 dark:text-white text-base gold-gradient-text shrink-0">
                                        ₹{((item.product?.price ?? 0) * item.qty).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Checkout Summary Card */}
                <div className="qk-card p-6 sm:p-7 sticky top-24 border-gray-200 dark:border-amber-500/30 shadow-2xl">
                    <div className="flex items-center gap-2 mb-5">
                        <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                        <h2 className="font-extrabold text-gray-900 dark:text-white text-base tracking-tight">
                            Payment Breakdown
                        </h2>
                    </div>

                    <div className="space-y-3 text-sm pb-5 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Item Subtotal</span>
                            <span className="font-mono text-gray-900 dark:text-white">₹{totalPrice.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Shipping & Handling</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs">Free</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>GST / Taxes</span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs">Inclusive</span>
                        </div>
                    </div>

                    <div className="pt-4 pb-6 flex items-baseline justify-between">
                        <span className="font-bold text-gray-900 dark:text-white text-base">Total Due</span>
                        <span className="text-2xl font-black gold-gradient-text">
                            ₹{totalPrice.toLocaleString("en-IN")}
                        </span>
                    </div>

                    <button
                        onClick={placeOrder}
                        disabled={loading || cart.length === 0}
                        className="qk-btn-primary w-full py-3.5 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                    >
                        <FaCreditCard size={14} />
                        {loading ? "Initializing Razorpay..." : "Pay with Razorpay"}
                    </button>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800/80 text-center space-y-1">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                            🔒 100% Secure Transaction via Razorpay
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                            Cards · UPI · Net Banking · Wallets
                        </p>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default Checkout;
