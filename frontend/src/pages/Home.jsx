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
        <div className="min-h-[calc(100vh-70px)] bg-gray-50 text-gray-900 dark:bg-[#0b0f17] dark:text-gray-100 transition-colors duration-300">
            {/* Luxury Hero Banner */}
            <section className="relative overflow-hidden hero-pattern border-b border-gray-200 dark:border-gray-800/80">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
                    <div className="max-w-3xl animate-slide-up">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold tracking-wider uppercase mb-5 border border-amber-500/30 shadow-sm backdrop-blur-md">
                            ✨ Luxury Shopping Redefined
                        </span>
                        <h1 className="text-4xl sm:text-6xl font-black leading-tight text-gray-900 dark:text-white tracking-tight">
                            Shop Smarter,
                            <span className="gold-gradient-text block sm:inline sm:ml-3">
                                Live Luxuriously
                            </span>
                        </h1>
                        <p className="mt-5 text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl leading-relaxed">
                            Discover premium collections across top electronics, designer fashion, and lifestyle essentials with verified security and instant Razorpay checkout.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <button
                                onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                                className="qk-btn-primary px-8 py-3.5 text-sm uppercase tracking-wider"
                            >
                                Explore Collection
                            </button>
                            {!user && (
                                <button
                                    onClick={() => navigate("/register")}
                                    className="qk-btn-secondary px-7 py-3.5 text-sm font-bold"
                                >
                                    Join QuickKart
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-7 relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {TRUST_BADGES.map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            className="qk-card p-4.5 flex items-center gap-3.5 border border-amber-500/20 hover:border-amber-500/50 hover:shadow-gold-sm transition-all duration-300"
                        >
                            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm">
                                <Icon size={18} />
                            </div>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Product Catalog Section */}
            <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-14 pb-24 md:pb-16">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                {search ? `Results for "${search}"` : "Featured Collections"}
                            </h2>
                        </div>
                        {!loading && !error && (
                            <p className="text-xs text-amber-600 dark:text-amber-400/80 font-mono mt-1.5 pl-4 uppercase tracking-wider">
                                Showing {filteredProducts.length} premium product{filteredProducts.length !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="qk-input w-full sm:w-auto sm:min-w-[180px] text-xs font-semibold py-2.5"
                        >
                            <option value="default">Sort: Recommended</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>
                </div>

                {/* Category Pills */}
                {categories.length > 1 && (
                    <div className="flex gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                                    category === cat
                                        ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 shadow-md shadow-amber-500/20 scale-105"
                                        : "bg-white dark:bg-[#111827]/90 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-white shadow-sm"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Skeletons Loading */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="qk-card overflow-hidden animate-pulse">
                                <div className="h-52 bg-gray-200 dark:bg-gray-800/60" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                                    <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="qk-card p-12 text-center border-red-500/30 animate-fade-in">
                        <p className="text-4xl mb-3">⚠️</p>
                        <p className="text-red-500 dark:text-red-400 font-medium mb-4">{error}</p>
                        <button onClick={fetchProducts} className="qk-btn-primary px-6 py-2.5 text-sm">
                            Retry
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredProducts.length === 0 && (
                    <div className="qk-card p-16 text-center border-amber-500/20 animate-fade-in">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-500 text-2xl">
                            🔍
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No products found</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                            {search || category !== "All"
                                ? "No items match your active filters. Try searching for something else."
                                : "We are preparing luxury products for this collection. Please check back soon."}
                        </p>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && filteredProducts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, i) => (
                            <div
                                key={product._id}
                                className="animate-slide-up"
                                style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}
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
