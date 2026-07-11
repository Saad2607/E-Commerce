import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../services/api";
import toast from "react-hot-toast";
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
            toast.success("Added to cart 🛒");
        } catch (err) {
            toast.error(err.response?.status === 401 ? "Login required" : err.response?.data?.msg || "Could not add to cart");
        }
    };

    const submitReview = async () => {
        if (rating === 0) return toast.error("Please select rating ⭐");
        try {
            await API.post(`/products/${id}/reviews`, { comment, rating });
            toast.success("Review added ⭐");
            setComment("");
            setRating(0);
            fetchProduct();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Error adding review");
        }
    };

    const deleteReview = async () => {
        try {
            await API.delete(`/products/${id}/reviews`);
            toast.success("Review removed");
            fetchProduct();
        } catch (error) {
            toast.error(error.response?.data?.msg || "Error deleting review");
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
        <PageLayout maxWidth="max-w-5xl">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition"
            >
                <FaArrowLeft size={12} /> Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="qk-card p-6">
                    <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                        <img src={mainImage} alt={product.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    {(product.images ?? []).length > 1 && (
                        <div className="flex gap-3 mt-4 flex-wrap">
                            {(product.images ?? []).map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    onClick={() => setMainImage(img)}
                                    className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition ${
                                        mainImage === img
                                            ? "border-yellow-500"
                                            : "border-transparent hover:border-gray-300"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium uppercase tracking-wide">
                        {product.category || "General"} · {product.brand || "QuickKart"}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-3 mt-3">
                        {product.rating > 0 && (
                            <span className="flex items-center gap-1 text-yellow-500">
                                <FaStar /> {product.rating.toFixed(1)} ({product.numReviews} reviews)
                            </span>
                        )}
                        <span className="text-sm text-gray-500">
                            {product.stock ?? 0} in stock
                        </span>
                    </div>

                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
                        ₹{product.price}
                    </p>

                    <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                        {product.description}
                    </p>

                    <button
                        onClick={addToCart}
                        className="qk-btn-primary w-full sm:w-auto px-8 py-3 mt-6 flex items-center justify-center gap-2"
                    >
                        <FaShoppingCart /> Add to Cart
                    </button>
                </div>
            </div>

            <div className="qk-card p-6 mt-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Customer Reviews
                </h2>

                {product.reviews.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No reviews yet. Be the first!</p>
                )}

                <div className="space-y-3 mb-6">
                    {product.reviews.map((review) => (
                        <div
                            key={review._id}
                            className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                        >
                            <div className="flex items-start justify-between">
                                <p className="font-semibold text-gray-900 dark:text-white">{review.name}</p>
                                {review.user?.toString() === user?._id && (
                                    <button
                                        onClick={deleteReview}
                                        className="text-red-500 text-xs hover:underline"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <div className="flex my-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        size={14}
                                        className={star <= review.rating ? "text-yellow-500" : "text-gray-300"}
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
                        </div>
                    ))}
                </div>

                {user && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                        <p className="font-medium text-gray-900 dark:text-white mb-3">Write a review</p>
                        <textarea
                            placeholder="Share your experience..."
                            className="qk-input min-h-[80px] resize-none mb-3"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    size={24}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className={`cursor-pointer transition ${
                                        star <= (hover || rating) ? "text-yellow-500" : "text-gray-300"
                                    }`}
                                />
                            ))}
                        </div>
                        <button onClick={submitReview} className="qk-btn-primary px-6 py-2">
                            Submit Review
                        </button>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default ProductDetails;
