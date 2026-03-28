import { FaHeart } from "react-icons/fa";
import API from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const addToCart = async () => {
        try {
            await API.post("/cart", {
                productId: product._id,
                qty: 1,
            });

            toast.success("Added to cart 🛒");
        } catch (error) {
            console.log(error.response?.data);
            toast.error(
                error.response?.data?.message || "Something went Wrong ❌"
            );
        }
    };

    const addToWishlist = async () => {
        try {
            await API.post("/wishlist", {
                productId: product._id,
            });

            toast.success("Added to wishlist ❤️");
        } catch (error) {
            toast.error("Login required ❌");
        }
    };

    return (
        <div className="border rounded-lg shadow hover:shadow-lg p-4 transition">
            <img
                src={product.images?.[0]}
                alt={product.name}
                onClick={() => navigate(`/product/${product._id}`)}
                className="h-48 w-full object-contain bg-white cursor-pointer"
            />

            <h2 className="font-semibold mt-2">{product.name}</h2>
            <p className="text-gray-600">₹{product.price}</p>

            <div className="flex justify-between mt-3">
                <button
                    onClick={addToCart}
                    disabled={!user}
                    className="bg-yellow-400 px-3 py-1 rounded disabled:opacity-50"
                >
                    Add to Cart
                </button>

                <FaHeart
                    onClick={addToWishlist}
                    className="cursor-pointer text-gray-500"
                />
            </div>
        </div>
    );
};

export default ProductCard;