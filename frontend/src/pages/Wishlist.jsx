import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { showSuccess, showError } from "../utils/toast";
import PageLayout from "../components/PageLayout";
import { FaHeart, FaTrash } from "react-icons/fa";

const Wishlist = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            const { data } = await API.get("/wishlist");
            setItems(data);
        } catch (err) {
            showError(err.response?.data?.msg || "Failed to load wishlist");
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (id) => {
        try {
            await API.delete(`/wishlist/${id}`);
            showSuccess("Removed from wishlist");
            fetchWishlist();
        } catch (err) {
            showError(err.response?.data?.msg || "Failed to remove item");
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    if (loading) {
        return (
            <PageLayout title="Wishlist">
                <div className="qk-card p-12 text-center text-gray-500">Loading wishlist...</div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Wishlist"
            subtitle={items.length > 0 ? `You have saved ${items.length} luxury item${items.length !== 1 ? "s" : ""}` : "Your saved items"}
        >
            {items.length === 0 ? (
                <div className="qk-card p-16 text-center border-amber-500/20 max-w-lg mx-auto">
                    <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5 text-amber-500 text-3xl shadow-sm">
                        ❤️
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                        Your Wishlist is Empty
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                        Save exceptional products you love by selecting the heart icon on any product card.
                    </p>
                    <button onClick={() => navigate("/")} className="qk-btn-primary px-8 py-3 text-xs uppercase tracking-wider">
                        Discover Products
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item._id} className="qk-card qk-card-hover overflow-hidden group flex flex-col justify-between">
                            <div
                                className="h-52 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-[#161f30]/40 dark:to-[#0b0f17]/70 p-5 flex items-center justify-center cursor-pointer relative overflow-hidden transition-colors"
                                onClick={() => navigate(`/product/${item._id}`)}
                            >
                                <img
                                    src={item.images?.[0]}
                                    alt={item.name}
                                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 filter drop-shadow-md"
                                />
                            </div>
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                        {item.category || "Luxury Item"}
                                    </p>
                                    <p
                                        className="font-bold text-gray-900 dark:text-white text-base mt-1 line-clamp-2 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                        onClick={() => navigate(`/product/${item._id}`)}
                                    >
                                        {item.name}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-baseline justify-between mb-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Price</span>
                                        <p className="text-xl font-black text-gray-900 dark:text-white gold-gradient-text">
                                            ₹{item.price?.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/product/${item._id}`)}
                                            className="qk-btn-primary flex-1 py-2 text-xs uppercase tracking-wider"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => removeFromWishlist(item._id)}
                                            className="px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl transition-all"
                                            title="Remove from wishlist"
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageLayout>
    );
};

export default Wishlist;
