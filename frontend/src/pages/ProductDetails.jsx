import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../services/api";
import { showSuccess, showError } from "../utils/toast";
import { FaStar, FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import PageLayout from "../components/PageLayout";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState("");
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProduct = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await API.get(`/products/${id}`);
            setProduct(data);
            setMainImage(data.images?.[0] || "");
        } catch (err) {
            setProduct(null);
            setError(err.response?.data?.msg || "Product not found");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const addToCart = async () => {
        try {
            await API.post("/cart", { productId: product._id, qty: 1 });
            showSuccess("Added to cart 🛒");
        } catch (err) {
            showError(err.response?.status === 401 ? "Login required" : err.response?.data?.msg || "Could not add to cart");
        }
    };

    const submitReview = async () => {
        if (rating === 0) return showError("Please select rating ⭐");
        try {
            await API.post(`/products/${id}/reviews`, { comment, rating });
            showSuccess("Review added ⭐");
            setComment("");
            setRating(0);
            fetchProduct();
        } catch (err) {
            showError(err.response?.data?.msg || "Error adding review");
        }
    };

    const deleteReview = async () => {
        try {
            await API.delete(`/products/${id}/reviews`);
            showSuccess("Review removed");
            fetchProduct();
        } catch (error) {
            showError(error.response?.data?.msg || "Error deleting review");
        }
    };

    if (loading) {
        return (
            <PageLayout>
                <div className="qk-card p-12 text-center text-gray-500">Loading product...</div>
            </PageLayout>
        );
    }

    if (error || !product) {
        return (
            <PageLayout>
                <div className="qk-card p-12 text-center">
                    <p className="text-red-500 mb-4">{error || "Product not found"}</p>
                    <button onClick={() => navigate("/")} className="qk-btn-primary px-6 py-2">
                        Back to Shop
                    </button>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout maxWidth="max-w-6xl">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-amber-600 dark:text-gray-400 dark:hover:text-amber-400 mb-6 transition-colors group"
            >
                <FaArrowLeft size={11} className="group-hover:-translate-x-1 transition-transform" /> Back to Catalog
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Image Gallery */}
                <div className="qk-card p-6 border-gray-200 dark:border-gray-800/90 shadow-2xl">
                    <div className="h-96 flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200/60 dark:from-[#161f30]/40 dark:to-[#0b0f17]/80 rounded-2xl p-6 relative overflow-hidden border border-gray-200 dark:border-gray-800/60">
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain filter drop-shadow-2xl transition-all duration-300 hover:scale-105"
                        />
                    </div>
                    {(product.images ?? []).length > 1 && (
                        <div className="flex gap-3 mt-4 flex-wrap">
                            {(product.images ?? []).map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setMainImage(img)}
                                    className={`w-18 h-18 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white dark:bg-[#0b0f17] ${
                                        mainImage === img
                                            ? "border-amber-500 dark:border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-105"
                                            : "border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    <img src={img} className="w-full h-full object-contain" alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info & Actions */}
                <div className="qk-card p-8 border-gray-200 dark:border-gray-800/90 shadow-2xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                {product.category || "Luxury Item"}
                            </span>
                            {product.brand && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium font-mono">
                                    by {product.brand}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-2 tracking-tight leading-snug">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mt-4 pb-5 border-b border-gray-200 dark:border-gray-800">
                            {product.rating > 0 ? (
                                <span className="flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                    <FaStar size={13} /> {product.rating.toFixed(1)}{" "}
                                    <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">
                                        ({product.numReviews} review{product.numReviews !== 1 ? "s" : ""})
                                    </span>
                                </span>
                            ) : (
                                <span className="text-xs text-gray-500 italic">No ratings yet</span>
                            )}

                            <span
                                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                    (product.stock ?? 0) > 0
                                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30"
                                        : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-500/30"
                                }`}
                            >
                                {(product.stock ?? 0) > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                            </span>
                        </div>

                        <div className="mt-5">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Price</p>
                            <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mt-1 gold-gradient-text">
                                ₹{product.price?.toLocaleString("en-IN")}
                            </p>
                        </div>

                        <div className="mt-6">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                Description
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed bg-gray-50 dark:bg-[#0b0f17]/60 p-4 rounded-xl border border-gray-200 dark:border-gray-800/80">
                                {product.description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={addToCart}
                            disabled={(product.stock ?? 0) <= 0}
                            className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg ${
                                (product.stock ?? 0) > 0
                                    ? "qk-btn-primary"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-800"
                            }`}
                        >
                            <FaShoppingCart size={15} /> {(product.stock ?? 0) > 0 ? "Add to Cart" : "Unavailable"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="qk-card p-6 sm:p-8 mt-10 border-gray-200 dark:border-gray-800/90 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        Customer Reviews & Feedback
                    </h2>
                </div>

                {product.reviews.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 dark:bg-[#0b0f17]/60 rounded-xl border border-gray-200 dark:border-gray-800/60 mb-6">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet for this product. Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {product.reviews.map((review) => (
                            <div
                                key={review._id}
                                className="p-4 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/70 border border-gray-200 dark:border-gray-800/80 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                                                {review.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{review.name}</p>
                                        </div>
                                        {review.user?.toString() === user?._id && (
                                            <button
                                                onClick={deleteReview}
                                                className="text-red-500 dark:text-red-400 text-xs hover:underline"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 my-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar
                                                key={star}
                                                size={13}
                                                className={star <= review.rating ? "text-amber-500 dark:text-amber-400" : "text-gray-300 dark:text-gray-700"}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Write a review */}
                {user ? (
                    <div className="border-t border-gray-200 dark:border-gray-800/80 pt-6">
                        <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400 mb-3 uppercase tracking-wider">
                            Leave a Verified Rating
                        </h3>
                        <textarea
                            placeholder="Share your detailed feedback about this product..."
                            className="qk-input min-h-[90px] resize-none mb-3"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Your Rating:</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <FaStar
                                            key={star}
                                            size={22}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            className={`cursor-pointer transition-colors duration-150 ${
                                                star <= (hover || rating) ? "text-amber-500 dark:text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" : "text-gray-300 dark:text-gray-700 hover:text-gray-400"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button onClick={submitReview} className="qk-btn-primary px-6 py-2.5 text-xs uppercase tracking-wider">
                                Post Review
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="border-t border-gray-200 dark:border-gray-800/80 pt-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            <button
                                onClick={() => navigate("/login")}
                                className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                            >
                                Sign in
                            </button>{" "}
                            to post a customer review.
                        </p>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default ProductDetails;
