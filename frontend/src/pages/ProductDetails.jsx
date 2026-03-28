import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { FaStar } from "react-icons/fa";

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState("");
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    const fetchProduct = async () => {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
        setMainImage(data.images[0]);
    };

    useEffect(() => {
        fetchProduct();
    }, []);

    const addToCart = async () => {
        try {
            await API.post("/cart", {
                productId: product._id,
                qty: 1,
            });
            toast.success("Added to cart 🛒");
        } catch {
            toast.error("Login required ❌");
        }
    };

    const submitReview = async () => {
        if (rating === 0) {
            return toast.error("Please select rating ⭐")
        }

        try {
            await API.post(`/products/${id}/reviews`, {
                comment,
                rating,
            });

            toast.success("Review added ⭐");
            setComment("");
            setRating(0);
            fetchProduct();
        } catch (err) {
            console.log(err.response?.data || err.message);
            toast.error("Error adding review ❌");
        }
    };

    const deleteReview = async () => {
        try {
            await API.delete(`/products/${id}/reviews`);
            toast.success("Review removed ❌");
            fetchProduct();
        } catch (error) {
            console.log(error.response?.data?.message);
            toast.error(error.response?.data?.message || "Error deleting review");
        }
    };

    if (!product) return <p className="p-6">Loading...</p>

    return (
        <div className="p-6 grid grid-cols-2 gap-10">

            {/* LEFT: IMAGES */}
            <div>
                <div className="h-96 flex items-center justify-center bg-white rounded">
                    <img
                        src={mainImage}
                        className="max-h-full object-contain"
                    />
                </div>

                <div className="flex gap-3 mt-4">
                    {product.images.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            onClick={() => setMainImage(img)}
                            className="w-20 h-20 object-cover border cursor-pointer hover:scale-105 transition"
                        />
                    ))}
                </div>
            </div>

            {/* RIGHT: DETAILS */}
            <div>
                <h1 className="text-2xl font-bold">{product.name}</h1>

                <p className="text-xl text-green-600 mt-2">
                    ₹{product.price}
                </p>

                <p className="mt-4 text-gray-600">
                    {product.description}
                </p>

                <button
                    onClick={addToCart}
                    className="mt-6 bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded font-semibold"
                >
                    Add to Cart
                </button>

                {/* ⭐ REVIEWS */}
                <div className="mt-8">
                    <h2 className="text-lg font-bold mb-2">Reviews ⭐</h2>

                    {product.reviews.length === 0 && (
                        <p>No reviews yet</p>
                    )}

                    {product.reviews.map((review) => (
                        <div key={review._id} className="border p-3 mt-2 rounded-lg bg-white dark:bg-gray-800">
                            <p className="font-semibold">{review.name}</p>

                            {review.user === JSON.parse(localStorage.getItem("user"))?._id && (
                                <button
                                    onClick={(deleteReview)}
                                    className="text-red-500 text-sm"
                                >
                                    Delete
                                </button>
                            )}

                            {/* ⭐ Show rating stars */}
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar
                                        key={star}
                                        size={16}
                                        className={
                                            star <= review.rating
                                                ? "text-yellow-500"
                                                : "text-gray-300"
                                        }
                                    />
                                ))}
                            </div>

                            <p className="text-sm mt-1">{review.comment}</p>
                        </div>
                    ))}

                    {/* ADD REVIEW */}
                    <div className="mt-4">
                        <input
                            placeholder="Write review"
                            className="border p-2 w-full rounded text-black"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />

                        {/* ⭐ SELECT RATING */}
                        <div className="flex gap-1 my-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    size={24}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className={`cursor-pointer ${star <= (hover || rating)
                                        ? "text-yellow-500"
                                        : "text-gray-300"
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={submitReview}
                            className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded font-semibold"
                        >
                            Submit Review
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;