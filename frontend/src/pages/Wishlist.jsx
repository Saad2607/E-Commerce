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
            subtitle={items.length > 0 ? `${items.length} saved item${items.length !== 1 ? "s" : ""}` : undefined}
        >
            {items.length === 0 ? (
                <div className="qk-card p-12 text-center">
                    <FaHeart className="mx-auto text-4xl text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Your wishlist is empty
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Save products you love by clicking the heart icon.
                    </p>
                    <button onClick={() => navigate("/")} className="qk-btn-primary px-6 py-2.5">
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item._id} className="qk-card overflow-hidden group">
                            <div
                                className="h-44 bg-gray-50 dark:bg-gray-700/50 p-4 flex items-center justify-center cursor-pointer"
                                onClick={() => navigate(`/product/${item._id}`)}
                            >
                                <img
                                    src={item.images?.[0]}
                                    alt={item.name}
                                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition"
                                />
                            </div>
                            <div className="p-4">
                                <p
                                    className="font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-yellow-600"
                                    onClick={() => navigate(`/product/${item._id}`)}
                                >
                                    {item.name}
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                    ₹{item.price}
                                </p>
                                <button
                                    onClick={() => removeFromWishlist(item._id)}
                                    className="mt-3 w-full py-2 text-sm text-red-500 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 transition"
                                >
                                    <FaTrash size={12} /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </PageLayout>
    );
};

export default Wishlist;
