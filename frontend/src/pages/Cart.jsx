import { useEffect, useState } from "react";
import API from "../services/api";
import { showSuccess, showError } from "../utils/toast";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import { FaTrash } from "react-icons/fa";

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            const { data } = await API.get("/cart");
            setCart(data);
        } catch (err) {
            showError(err.response?.data?.msg || "Failed to load cart");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const removeItem = async (id) => {
        try {
            await API.delete(`/cart/${id}`);
            showSuccess("Item removed");
            fetchCart();
        } catch (err) {
            showError(err.response?.data?.msg || "Failed to remove item");
        }
    };

    const totalPrice = cart.reduce(
        (acc, item) => acc + (item.product?.price ?? 0) * item.qty,
        0
    );

    if (loading) {
        return (
            <PageLayout title="Shopping Cart">
                <div className="qk-card p-12 text-center text-gray-500">Loading cart...</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Shopping Cart"
            subtitle={cart.length > 0 ? `You have ${cart.length} item${cart.length !== 1 ? "s" : ""} selected for checkout` : "Your luxury bag"}
        >
            {cart.length === 0 ? (
                <div className="qk-card p-16 text-center border-amber-500/20 max-w-lg mx-auto">
                    <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5 text-amber-500 text-3xl shadow-sm">
                        🛒
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                        Your Cart is Empty
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                        Explore our curated luxury collections to find premium items.
                    </p>
                    <button onClick={() => navigate("/")} className="qk-btn-primary px-8 py-3 text-xs uppercase tracking-wider">
                        Explore Collection
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.product?._id}
                                className="qk-card p-5 flex flex-col sm:flex-row gap-5 items-center border-gray-200 dark:border-gray-800/90 hover:border-amber-500/30 transition-all shadow-lg"
                            >
                                <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-gray-100 to-gray-200 dark:from-[#161f30]/60 dark:to-[#0b0f17] p-2 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-800">
                                    <img
                                        src={item.product?.images?.[0]}
                                        alt={item.product?.name}
                                        className="max-h-full max-w-full object-contain filter drop-shadow"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                    <p className="font-bold text-gray-900 dark:text-white text-base truncate">
                                        {item.product?.name}
                                    </p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-1">
                                        ₹{item.product?.price?.toLocaleString("en-IN")} × {item.qty} unit{item.qty > 1 ? "s" : ""}
                                    </p>
                                    <button
                                        onClick={() => removeItem(item.product?._id)}
                                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-xs mt-3 inline-flex items-center gap-1.5 transition-colors"
                                    >
                                        <FaTrash size={11} /> Remove from bag
                                    </button>
                                </div>
                                <div className="text-center sm:text-right shrink-0">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Subtotal</span>
                                    <p className="text-xl font-black text-gray-900 dark:text-white gold-gradient-text">
                                        ₹{((item.product?.price ?? 0) * item.qty).toLocaleString("en-IN")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Card */}
                    <div className="qk-card p-6 lg:p-7 sticky top-24 border-gray-200 dark:border-amber-500/20 shadow-2xl">
                        <div className="flex items-center gap-2 mb-5">
                            <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                                Order Summary
                            </h2>
                        </div>

                        <div className="space-y-3 text-sm pb-5 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Total Items</span>
                                <span className="font-mono text-gray-900 dark:text-white">{cart.reduce((s, i) => s + i.qty, 0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Delivery</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs">Complimentary</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Taxes</span>
                                <span className="text-gray-500 dark:text-gray-400 text-xs">Calculated at checkout</span>
                            </div>
                        </div>

                        <div className="pt-4 pb-6 flex items-baseline justify-between">
                            <span className="font-bold text-gray-900 dark:text-white text-base">Grand Total</span>
                            <span className="text-2xl font-black gold-gradient-text">
                                ₹{totalPrice.toLocaleString("en-IN")}
                            </span>
                        </div>

                        <button
                            onClick={() => navigate("/checkout")}
                            className="qk-btn-primary w-full py-3.5 text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-2 shadow-lg"
                        >
                            Proceed to Checkout
                        </button>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800/80 text-center">
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5 font-medium">
                                🔒 Secure 256-Bit Razorpay Payment
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default Cart;
