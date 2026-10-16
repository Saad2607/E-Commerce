import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { showSuccess, showError } from "../utils/toast";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const inStock = (product.stock ?? product.countInStock ?? 0) > 0;

    const addToCart = async (e) => {
        e.stopPropagation();
        if (!user) return showError("Login required");
        if (!inStock) return showError("Out of stock");
        try {
            await API.post("/cart", { productId: product._id, qty: 1 });
            showSuccess("Added to cart 🛒");
        } catch (error) {
            showError(error.response?.data?.msg || "Could not add to cart");
        }
    };

    const addToWishlist = async (e) => {
        e.stopPropagation();
        if (!user) return showError("Login required");
        try {
            await API.post("/wishlist", { productId: product._id });
            showSuccess("Added to wishlist ❤️");
        } catch (error) {
            showError(error.response?.data?.msg || "Could not add to wishlist");
        }
    };

    return (
        <div
            onClick={() => navigate(`/product/${product._id}`)}
            className="qk-card qk-card-hover group cursor-pointer overflow-hidden flex flex-col justify-between"
        >
            <div className="relative h-52 bg-gradient-to-b from-gray-100 to-gray-200/60 dark:from-[#161f30]/40 dark:to-[#0b0f17]/60 p-5 flex items-center justify-center overflow-hidden transition-colors">
                {!inStock && (
                    <span className="absolute top-3 left-3 qk-badge bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border border-red-300 dark:border-red-500/30 backdrop-blur-md z-10 shadow-sm">
                        Out of Stock
                    </span>
                )}
                {product.rating >= 4 && inStock && (
                    <span className="absolute top-3 left-3 qk-badge bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 backdrop-blur-md z-10 shadow-sm flex items-center gap-1 font-bold">
                        ⭐ Top Rated
                    </span>
                )}
                <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 filter drop-shadow-md"
                />
                <button
                    onClick={addToWishlist}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-[#111827]/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-400 dark:text-gray-400 dark:hover:text-red-400 dark:hover:border-red-500/40 transition-all opacity-80 sm:opacity-0 group-hover:opacity-100"
                    title="Add to Wishlist"
                >
                    <FaHeart size={13} />
                </button>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400/90">
                            {product.category || "Luxury"}
                        </p>
                        {product.brand && (
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                {product.brand}
                            </span>
                        )}
                    </div>

                    <h2 className="font-bold text-gray-900 dark:text-white text-base mt-1 line-clamp-2 min-h-[2.5rem] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {product.name}
                    </h2>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                    <div className="flex items-baseline justify-between mb-3">
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Price</span>
                            <p className="text-xl font-black text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                                ₹{product.price?.toLocaleString("en-IN")}
                            </p>
                        </div>
                        {product.rating > 0 && (
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400/90 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                ⭐ {product.rating.toFixed(1)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={addToCart}
                        disabled={!inStock}
                        className={`w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl transition-all duration-200 ${
                            inStock
                                ? "qk-btn-primary"
                                : "bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-800"
                        }`}
                    >
                        <FaShoppingCart size={13} />
                        {inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
