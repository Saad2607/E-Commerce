import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
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
                toast.error(err.response?.data?.msg || "Failed to load cart");
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
        if (!address) return toast.error("Please enter shipping address ❌");
        if (cart.length === 0) return toast.error("Your cart is empty ❌");
        if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
            return toast.error("Razorpay Key ID missing in frontend .env ❌");
        }
        if (!window.Razorpay) {
            return toast.error("Razorpay script failed to load. Refresh the page ❌");
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
                        await API.post("/payment/verify", {
                            orderId: order._id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        toast.success("Payment Successful ✅");
                        navigate("/order-success", { state: { paid: true, orderId: order._id } });
                    } catch (err) {
                        toast.error(
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
                toast.error("Payment Failed ❌");
                setLoading(false);
                submittingRef.current = false;
            });
            rzp.on("modal.closed", () => {
                setLoading(false);
                submittingRef.current = false;
            });
            rzp.open();
        } catch (err) {
            toast.error(
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
        <PageLayout title="Checkout" subtitle="Review your order and complete payment">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="qk-card p-6">
                        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <FaMapMarkerAlt className="text-yellow-500" />
                            Shipping Address
                        </h2>
                        <textarea
                            placeholder="Enter your full delivery address..."
                            className="qk-input min-h-[100px] resize-none"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="qk-card p-6">
                        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Items</h2>
                        <div className="space-y-3">
                            {cart.map((item) => (
                                <div
                                    key={item.product?._id}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                                >
                                    <img
                                        src={item.product?.images?.[0]}
                                        alt=""
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {item.product?.name}
                                        </p>
                                        <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                    </div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        ₹{(item.product?.price ?? 0) * item.qty}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="qk-card p-6 h-fit sticky top-24">
                    <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Items</span>
                            <span>{cart.length}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Subtotal</span>
                            <span>₹{totalPrice}</span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between">
                            <span className="font-bold text-gray-900 dark:text-white">Total</span>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                ₹{totalPrice}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={placeOrder}
                        disabled={loading || cart.length === 0}
                        className="qk-btn-primary w-full py-3 mt-6 flex items-center justify-center gap-2"
                    >
                        <FaCreditCard />
                        {loading ? "Processing..." : "Pay with Razorpay"}
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-3">Secured by Razorpay</p>
                </div>
            </div>
        </PageLayout>
    );
};

export default Checkout;
