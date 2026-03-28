import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const Wishlist = () => {
    const [items, setItems] = useState([]);

    const fetchWishlist = async () => {
        const { data } = await API.get("/wishlist");
        setItems(data);
    };

    const removeFromWishlist = async (id) => {
        await API.delete(`/wishlist/${id}`);
        toast.success("Removed ❌");
        fetchWishlist();
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    return (
        <div className="p-6 grid grid-cols-4 gap-6">
            {items.map((item) => (
                <div key={item._id}>
                    <img src={item.images[0]} />
                    <p>{item.name}</p>
                    <button
                        onClick={() => removeFromWishlist(item._id)}
                        className="bg-red-500 text-white px-2 py-1 mt-2"
                    >
                        Remove
                    </button>
                </div>
            ))}


        </div>
    );
};

export default Wishlist;