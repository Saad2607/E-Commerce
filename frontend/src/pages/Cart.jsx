import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
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
            toast.error(err.response?.data?.msg || "Failed to load cart");
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
            toast.success("Item removed");
            fetchCart();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to remove item");
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
            subtitle={cart.length > 0 ? `${cart.length} item${cart.length !== 1 ? "s" : ""} in your cart` : undefined}
        >
            {cart.length === 0 ? (
                <div className="qk-card p-12 text-center">
                    <p className="text-5xl mb-4">🛒</p>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Your cart is empty
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Add some products to get started.
                    </p>
                    <button onClick={() => navigate("/")} className="qk-btn-primary px-6 py-2.5">
                        Go Shopping
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.product?._id}
                                className="qk-card p-4 flex gap-4 items-center"
                            >
                                <img
                                    src={item.product?.images?.[0]}
                                    alt=""
                                    className="w-24 h-24 object-cover rounded-xl shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                        {item.product?.name}
                                    </p>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        ₹{item.product?.price} × {item.qty}
                                    </p>
                                    <button
                                        onClick={() => removeItem(item.product?._id)}
                                        className="text-red-500 text-sm mt-2 flex items-center gap-1 hover:underline"
                                    >
                                        <FaTrash size={12} /> Remove
                                    </button>
                                </div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white shrink-0">
                                    ₹{(item.product?.price ?? 0) * item.qty}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="qk-card p-6 h-fit sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Order Summary
                        </h2>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Items</span>
                                <span>{cart.length}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-3">
                                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    ₹{totalPrice}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/checkout")}
                            className="qk-btn-primary w-full py-3"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};

export default Cart;
