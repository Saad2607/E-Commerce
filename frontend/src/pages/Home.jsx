import { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";

const Home = ({ search }) => {
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        const { data } = await API.get("/products");
        setProducts(data);
    };

    const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        console.log("PRODUCTS: ", products);
    }, [products]);

    return (
        <div className="p-6 grid grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
};

export default Home;