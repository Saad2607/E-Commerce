import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const inStock = (product.stock ?? product.countInStock ?? 0) > 0;

    const addToCart = async (e) => {
        e.stopPropagation();
        if (!user) return toast.error("Login required");
        if (!inStock) return toast.error("Out of stock");
        try {
            await API.post("/cart", { productId: product._id, qty: 1 });
            toast.success("Added to cart 🛒");
        } catch (error) {
            toast.error(error.response?.data?.msg || "Could not add to cart");
        }
    };

    const addToWishlist = async (e) => {
        e.stopPropagation();
        if (!user) return toast.error("Login required");
        try {
            await API.post("/wishlist", { productId: product._id });
            toast.success("Added to wishlist ❤️");
        } catch (error) {
            toast.error(error.response?.data?.msg || "Could not add to wishlist");
        }
    };

    return (
        <div
            onClick={() => navigate(`/product/${product._id}`)}
            className="qk-card group cursor-pointer overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
            <div className="relative h-48 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/50 p-4 flex items-center justify-center overflow-hidden">
                {!inStock && (
                    <span className="absolute top-3 left-3 qk-badge bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 z-10">
                        Out of Stock
                    </span>
                )}
                {product.rating >= 4 && inStock && (
                    <span className="absolute top-3 left-3 qk-badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 z-10">
                        ⭐ Top Rated
                    </span>
                )}
                <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-500"
                />
                <button
                    onClick={addToWishlist}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur shadow flex items-center justify-center text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                >
                    <FaHeart size={14} />
                </button>
            </div>

            <div className="p-4">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium uppercase tracking-wide">
                    {product.category || "General"}
                </p>
                <h2 className="font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2 min-h-[2.5rem] group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition">
                    {product.name}
                </h2>

                <div className="flex items-center justify-between mt-3">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ₹{product.price?.toLocaleString("en-IN")}
                    </p>
                    {product.rating > 0 && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            ⭐ {product.rating.toFixed(1)}
                        </span>
                    )}
                </div>

                <button
                    onClick={addToCart}
                    disabled={!inStock}
                    className={`w-full mt-3 py-2.5 text-sm flex items-center justify-center gap-2 rounded-lg font-semibold transition ${
                        inStock
                            ? "qk-btn-primary"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    <FaShoppingCart size={14} />
                    {inStock ? "Add to Cart" : "Unavailable"}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
