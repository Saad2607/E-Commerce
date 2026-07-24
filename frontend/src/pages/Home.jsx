import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import { FaTruck, FaShieldAlt, FaHeadset, FaUndo } from "react-icons/fa";

const TRUST_BADGES = [
    { icon: FaTruck, label: "Fast Delivery" },
    { icon: FaShieldAlt, label: "Secure Payment" },
    { icon: FaHeadset, label: "24/7 Support" },
    { icon: FaUndo, label: "Easy Returns" },
];

const Home = ({ search }) => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [category, setCategory] = useState("All");
    const [sortBy, setSortBy] = useState("default");

    const fetchProducts = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await API.get("/products");
            setProducts(data);
        } catch (err) {
            setError(err.response?.data?.msg || "Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const categories = useMemo(() => {
        const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
        return ["All", ...cats.sort()];
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = products.filter((p) =>
            (p.name ?? "").toLowerCase().includes(search.toLowerCase())
        );

        if (category !== "All") {
            result = result.filter((p) => p.category === category);
        }

        if (sortBy === "price-low") result = [...result].sort((a, b) => a.price - b.price);
        if (sortBy === "price-high") result = [...result].sort((a, b) => b.price - a.price);
        if (sortBy === "rating") result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));

        return result;
    }, [products, search, category, sortBy]);

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
            <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden hero-pattern">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-10 w-48 h-48 bg-yellow-400 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
                    <div className="max-w-2xl animate-slide-up">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium mb-4 border border-yellow-500/30">
                            Welcome to QuickKart
                        </span>
                        <h1 className="text-3xl text-black sm:text-5xl font-bold leading-tight dark:text-white">
                            Shop Smarter,
                            <span className="text-yellow-400"> Live Better</span>
                        </h1>
                        <p className="mt-4 text-gray-600 text-lg max-w-lg dark:text-gray-300">
                            Premium products at great prices — electronics, fashion, and more with secure Razorpay checkout.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-8">
                            <button
                                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                                className="qk-btn-primary px-6 py-3"
                            >
                                Shop Now
                            </button>
                            {!user && (
                                <button
                                    onClick={() => navigate("/register")}
                                    className="px-6 py-3 rounded-lg border text-yellow-400 border-gray-600 hover:border-yellow-400 hover:text-yellow-400 transition font-semibold"
                                >
                                    Create Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
            </section>

            <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {TRUST_BADGES.map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            className="qk-card p-4 flex items-center gap-3 animate-fade-in"
                        >
                            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shrink-0">
                                <Icon size={18} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section id="products" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24 md:pb-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="qk-section-title">
                            {search ? `Results for "${search}"` : "All Products"}
                        </h2>
                        {!loading && !error && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
                            </p>
                        )}
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="qk-input w-full sm:w-auto sm:min-w-[160px] text-sm py-2"
                    >
                        <option value="default">Sort by: Default</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>

                {categories.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                                    category === cat
                                        ? "bg-yellow-500 text-gray-900 shadow-md"
                                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-yellow-400"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="qk-card overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="qk-card p-12 text-center animate-fade-in">
                        <p className="text-4xl mb-4">😕</p>
                        <p className="text-red-500 mb-4">{error}</p>
                        <button onClick={fetchProducts} className="qk-btn-primary px-6 py-2">
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && filteredProducts.length === 0 && (
                    <div className="qk-card p-12 text-center animate-fade-in">
                        <p className="text-5xl mb-4">🔍</p>
                        <p className="text-gray-500 dark:text-gray-400">
                            {search || category !== "All"
                                ? "No products match your filters."
                                : "No products available yet."}
                        </p>
                    </div>
                )}

                {!loading && !error && filteredProducts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, i) => (
                            <div
                                key={product._id}
                                className="animate-slide-up"
                                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
