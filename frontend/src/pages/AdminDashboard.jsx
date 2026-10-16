import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { showSuccess, showError } from "../utils/toast";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import {
    FaBox,
    FaClipboardList,
    FaRupeeSign,
    FaUsers,
    FaChartLine,
    FaSearch,
    FaArrowRight,
    FaClock,
    FaCheckCircle,
    FaTruck,
    FaHourglassHalf,
    FaTags,
} from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-950/95 text-white p-3 rounded-xl border border-amber-500/40 shadow-2xl backdrop-blur-md text-xs">
                <p className="font-bold text-amber-400 mb-1.5 pb-1 border-b border-gray-800">{label}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
                        <span className="text-gray-400 capitalize">{entry.name}:</span>
                        <span className="font-mono font-bold text-amber-300">
                            {entry.name?.toLowerCase().includes("revenue") || entry.name?.toLowerCase().includes("sales")
                                ? `₹${Number(entry.value || 0).toLocaleString("en-IN")}`
                                : entry.value}
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const formatDate = (date) => {
    if (!date) return "Recent";
    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const statusBadges = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-300 dark:border-yellow-500/30",
    Shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-500/30",
    "Out for Delivery": "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300 dark:border-purple-500/30",
    Delivered: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-300 dark:border-green-500/30",
};

const AdminDashboard = () => {
    const [data, setData] = useState({});
    const [analyticsTab, setAnalyticsTab] = useState("revenue"); // "revenue" | "pipeline" | "categories"
    const [productSearch, setProductSearch] = useState("");
    const [uploading, setUploading] = useState(false);

    const [product, setProduct] = useState({
        name: "",
        price: "",
        images: [],
        description: "",
        category: "",
        brand: "",
        stock: "",
    });
    const [products, setProducts] = useState([]);
    const [editId, setEditId] = useState(null);

    const fetchDashboard = async () => {
        try {
            const res = await API.get("/admin");
            setData(res.data || {});
        } catch {
            showError("Failed to load dashboard metrics");
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await API.get("/products");
            setProducts(data || []);
        } catch {
            showError("Failed to load products");
        }
    };

    const resetForm = () => {
        setProduct({
            name: "",
            price: "",
            images: [],
            description: "",
            category: "",
            brand: "",
            stock: "",
        });
        setEditId(null);
    };

    const addProduct = async () => {
        if (!product.name || !product.price) {
            return showError("Please enter title and price ❌");
        }

        setUploading(true);
        try {
            const imageUrls = [];
            for (let i = 0; i < product.images.length; i++) {
                const formData = new FormData();
                formData.append("images", product.images[i]);
                const { data } = await API.post("/upload", formData);
                imageUrls.push(data.imageUrl);
            }

            await API.post("/products", {
                name: product.name,
                price: Number(product.price),
                description: product.description,
                images: imageUrls,
                category: product.category,
                brand: product.brand,
                stock: Number(product.stock) || 0,
            });

            showSuccess("Product Published Successfully ✅");
            resetForm();
            fetchProducts();
            fetchDashboard();
        } catch (err) {
            showError(err.response?.data?.msg || "Error publishing product ❌");
        } finally {
            setUploading(false);
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await API.delete(`/products/${id}`);
            showSuccess("Product Deleted ✅");
            fetchProducts();
            fetchDashboard();
        } catch (err) {
            showError(err.response?.data?.msg || "Delete failed ❌");
        }
    };

    const updateProduct = async () => {
        if (!product.name || !product.price) {
            return showError("Please enter title and price ❌");
        }

        try {
            await API.put(`/products/${editId}`, {
                name: product.name,
                price: Number(product.price),
                description: product.description,
                category: product.category,
                brand: product.brand,
                stock: Number(product.stock) || 0,
            });

            showSuccess("Product Updated ✅");
            resetForm();
            fetchProducts();
            fetchDashboard();
        } catch (err) {
            showError(err.response?.data?.msg || "Update failed ❌");
        }
    };

    useEffect(() => {
        fetchDashboard();
        fetchProducts();
    }, []);

    // Filter products by search query
    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) return products;
        const q = productSearch.toLowerCase();
        return products.filter(
            (p) =>
                p.name?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q)
        );
    }, [products, productSearch]);

    // Top Executive KPIs
    const kpis = [
        {
            label: "Gross Store Revenue",
            value: `₹${(data.totalRevenue || 0).toLocaleString("en-IN")}`,
            subtext: `${data.paidOrdersCount || 0} Paid Settlements`,
            icon: FaRupeeSign,
            color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
        },
        {
            label: "Total Orders",
            value: data.totalOrders || 0,
            subtext: `${data.pendingOrdersCount || 0} Awaiting Fulfillment`,
            icon: FaClipboardList,
            color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
        },
        {
            label: "Average Order Value",
            value: `₹${(data.averageOrderValue || 0).toLocaleString("en-IN")}`,
            subtext: "Per Settled Order",
            icon: FaChartLine,
            color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
        },
        {
            label: "Registered Customers",
            value: data.totalUsers || 0,
            subtext: "Verified Accounts",
            icon: FaUsers,
            color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30",
        },
    ];

    // Trends data fallback if brand new database
    const trendsData = useMemo(() => {
        if (data.salesTrends && data.salesTrends.length > 0) {
            return data.salesTrends;
        }
        return [
            { date: "Day 1", revenue: 0, orders: 0 },
            { date: "Day 2", revenue: 0, orders: 0 },
            { date: "Day 3", revenue: 0, orders: 0 },
            { date: "Day 4", revenue: 0, orders: 0 },
            { date: "Day 5", revenue: 0, orders: 0 },
            { date: "Day 6", revenue: 0, orders: 0 },
            { date: "Today", revenue: data.totalRevenue || 0, orders: data.totalOrders || 0 },
        ];
    }, [data.salesTrends, data.totalRevenue, data.totalOrders]);

    const statusData = useMemo(() => {
        if (data.statusBreakdown && data.statusBreakdown.length > 0) {
            return data.statusBreakdown;
        }
        return [
            { name: "Pending", count: 0, color: "#f59e0b" },
            { name: "Shipped", count: 0, color: "#3b82f6" },
            { name: "Out for Delivery", count: 0, color: "#a855f7" },
            { name: "Delivered", count: 0, color: "#10b981" },
        ];
    }, [data.statusBreakdown]);

    const categoryData = useMemo(() => {
        if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
            return data.categoryBreakdown;
        }
        return [{ category: "Catalog", count: products.length, avgPrice: 0 }];
    }, [data.categoryBreakdown, products.length]);

    return (
        <AdminLayout
            title="Executive Dashboard"
            subtitle="Store analytics, live telemetry, inventory management, and fulfillment control"
        >
            {/* 1. Top Executive KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {kpis.map(({ label, value, subtext, icon: Icon, color }) => (
                    <div
                        key={label}
                        className="qk-card p-5 border-gray-200 dark:border-gray-800/90 shadow-xl transition-all duration-300 hover:border-amber-500/40"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                                    {label}
                                </p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1 gold-gradient-text">
                                    {value}
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-1">
                                    {subtext}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0 shadow-sm`}>
                                <Icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. Interactive Analytics & Storefront Trends Center */}
            <div className="qk-card p-6 sm:p-7 border-gray-200 dark:border-gray-800/90 shadow-xl mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                                Analytics & Trends
                            </h2>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-4">
                            Live telemetry tracking revenue trajectories, fulfillment velocity, and product categories
                        </p>
                    </div>

                    {/* View Switcher Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-[#0b0f17] border border-gray-200 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => setAnalyticsTab("revenue")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                analyticsTab === "revenue"
                                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            }`}
                        >
                            <FaChartLine size={12} /> Revenue Trend
                        </button>
                        <button
                            type="button"
                            onClick={() => setAnalyticsTab("pipeline")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                analyticsTab === "pipeline"
                                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            }`}
                        >
                            <FaTruck size={12} /> Fulfillment
                        </button>
                        <button
                            type="button"
                            onClick={() => setAnalyticsTab("categories")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                analyticsTab === "categories"
                                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 shadow-sm"
                                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            }`}
                        >
                            <FaTags size={12} /> Categories
                        </button>
                    </div>
                </div>

                {/* View 1: Revenue & Order Volume Area Trend */}
                {analyticsTab === "revenue" && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                            <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                Chronological Sales Trajectory (₹)
                            </span>
                            <div className="flex items-center gap-4 text-xs font-mono">
                                <span className="flex items-center gap-1.5 text-amber-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Daily Revenue
                                </span>
                                <span className="flex items-center gap-1.5 text-blue-500">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Order Volume
                                </span>
                            </div>
                        </div>

                        <div className="h-[280px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="goldRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="blueOrderGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.15} />
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Daily Revenue"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#goldRevenueGrad)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="orders"
                                        name="Orders Count"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#blueOrderGrad)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Summary Metrics Strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-200 dark:border-gray-800 text-center">
                            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800">
                                <p className="text-[10px] uppercase font-bold text-gray-500">Total Settled</p>
                                <p className="text-sm font-black text-amber-500 mt-0.5">₹{(data.totalRevenue || 0).toLocaleString("en-IN")}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800">
                                <p className="text-[10px] uppercase font-bold text-gray-500">Settled Orders</p>
                                <p className="text-sm font-black text-emerald-500 mt-0.5">{data.paidOrdersCount || 0} Units</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800">
                                <p className="text-[10px] uppercase font-bold text-gray-500">Pending Orders</p>
                                <p className="text-sm font-black text-yellow-500 mt-0.5">{data.pendingOrdersCount || 0} Units</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800">
                                <p className="text-[10px] uppercase font-bold text-gray-500">AOV Ticket</p>
                                <p className="text-sm font-black text-purple-500 mt-0.5">₹{(data.averageOrderValue || 0).toLocaleString("en-IN")}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* View 2: Fulfillment Pipeline Bar Chart */}
                {analyticsTab === "pipeline" && (
                    <div className="space-y-5 animate-fade-in">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {statusData.map((s) => (
                                <div
                                    key={s.name}
                                    className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] uppercase font-bold text-gray-500">{s.name}</span>
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                                    </div>
                                    <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{s.count}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                        {data.totalOrders ? `${Math.round((s.count / data.totalOrders) * 100)}% of total` : "0%"}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="h-[240px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statusData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.15} />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Orders Count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* View 3: Category Distribution */}
                {analyticsTab === "categories" && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryData.map((c) => (
                                <div
                                    key={c.category}
                                    className="p-4 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800 flex items-center justify-between"
                                >
                                    <div>
                                        <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                            {c.category}
                                        </span>
                                        <p className="text-xs text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                                            Avg: ₹{c.avgPrice?.toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                        {c.count} item{c.count !== 1 ? "s" : ""}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="h-[220px] w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.15} />
                                    <XAxis type="number" stroke="#6b7280" fontSize={11} />
                                    <YAxis type="category" dataKey="category" stroke="#6b7280" fontSize={11} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Product Count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Recent Customer Orders Live Stream (Newest Orders on Top) */}
            <div className="qk-card p-6 sm:p-7 border-gray-200 dark:border-gray-800/90 shadow-xl mb-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                        <div>
                            <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                                Recent Store Orders Stream
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Real-time customer activity (newest orders appearing on top)
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/admin/orders"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                        View All Orders in Registry <FaArrowRight size={10} />
                    </Link>
                </div>

                {(!data.recentOrders || data.recentOrders.length === 0) ? (
                    <div className="text-center py-8 text-gray-500 text-xs">No recent orders recorded yet.</div>
                ) : (
                    <div className="space-y-3">
                        {data.recentOrders.map((ord, idx) => (
                            <div
                                key={ord._id}
                                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border transition-all ${
                                    idx === 0
                                        ? "border-amber-500/40 dark:border-amber-500/40 ring-1 ring-amber-500/20"
                                        : "border-gray-200 dark:border-gray-800/80"
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                        <FaClock size={13} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-mono text-xs font-bold text-gray-900 dark:text-white truncate">
                                                ID: {ord._id}
                                            </p>
                                            {idx === 0 && (
                                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-amber-500 text-gray-950">
                                                    Newest
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                            {ord.user?.name || "Customer"} · {formatDate(ord.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                    <span className="text-sm font-black text-gray-900 dark:text-white gold-gradient-text">
                                        ₹{ord.totalPrice?.toLocaleString("en-IN")}
                                    </span>
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                            statusBadges[ord.status] || statusBadges.Pending
                                        }`}
                                    >
                                        {ord.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 4. Product Catalog Management Studio */}
            <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">
                {/* Product Publishing / Editing Form */}
                <div className="qk-card p-6 border-gray-200 dark:border-gray-800/90 shadow-xl h-fit">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                                {editId ? "Edit Product Details" : "Publish New Product"}
                            </h2>
                        </div>
                        {editId && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40">
                                Editing
                            </span>
                        )}
                    </div>

                    <div className="space-y-3.5">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                                Product Title
                            </label>
                            <input
                                placeholder="e.g. Signature Chronograph Watch"
                                className="qk-input text-xs"
                                value={product.name}
                                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                                    Price (₹)
                                </label>
                                <input
                                    placeholder="1999"
                                    type="number"
                                    className="qk-input text-xs"
                                    value={product.price}
                                    onChange={(e) => setProduct({ ...product, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                                    Units in Stock
                                </label>
                                <input
                                    placeholder="15"
                                    type="number"
                                    className="qk-input text-xs"
                                    value={product.stock}
                                    onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                                />
                            </div>
                        </div>

                        {!editId && (
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                                    Product Images
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    className="text-xs text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-100 dark:file:bg-gray-800 file:text-amber-800 dark:file:text-amber-400 hover:file:bg-amber-200 dark:hover:file:bg-gray-700 w-full"
                                    onChange={(e) => setProduct({ ...product, images: e.target.files })}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                                Description
                            </label>
                            <textarea
                                placeholder="Describe features, materials, warranty, and specifications..."
                                rows={3}
                                className="qk-input text-xs resize-none"
                                value={product.description}
                                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                                    Category
                                </label>
                                <input
                                    placeholder="Electronics, Fashion..."
                                    className="qk-input text-xs"
                                    value={product.category}
                                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                                    Brand Name
                                </label>
                                <input
                                    placeholder="QuickKart Luxe"
                                    className="qk-input text-xs"
                                    value={product.brand}
                                    onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2.5 pt-3">
                            <button
                                onClick={editId ? updateProduct : addProduct}
                                disabled={uploading}
                                className="qk-btn-primary flex-1 py-3 text-xs uppercase tracking-wider font-extrabold shadow-md disabled:opacity-50"
                            >
                                {uploading ? "Uploading..." : editId ? "Save Changes" : "Publish to Storefront"}
                            </button>
                            {editId && (
                                <button
                                    onClick={resetForm}
                                    className="qk-btn-secondary px-4 py-3 text-xs uppercase tracking-wider font-bold"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Live Storefront Inventory & Search */}
                <div className="qk-card p-6 border-gray-200 dark:border-gray-800/90 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                            <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight">
                                Live Storefront Inventory
                            </h2>
                        </div>
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">
                            {filteredProducts.length} of {products.length} Products
                        </span>
                    </div>

                    {/* Quick Search */}
                    <div className="relative mb-4">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Quick search by product name, category, or brand..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="qk-input pl-9 text-xs"
                        />
                    </div>

                    <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 text-xs">
                                No products found matching &ldquo;{productSearch}&rdquo;
                            </div>
                        ) : (
                            filteredProducts.map((p) => (
                                <div
                                    key={p._id}
                                    className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-gray-50 dark:bg-[#0b0f17]/80 border border-gray-200 dark:border-gray-800/80 hover:border-amber-500/30 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-14 h-14 rounded-lg bg-gradient-to-b from-gray-100 to-gray-200 dark:from-[#161f30]/60 dark:to-[#0b0f17] p-1 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-800">
                                            <img
                                                src={p.images?.[0]}
                                                alt=""
                                                className="max-h-full max-w-full object-contain filter drop-shadow"
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{p.name}</p>
                                            <p className="text-xs text-amber-600 dark:text-amber-400 font-mono">
                                                ₹{p.price?.toLocaleString("en-IN")} · {p.category || "General"}
                                            </p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                                Stock:{" "}
                                                <span
                                                    className={`font-bold ${
                                                        (p.stock ?? 0) > 0 ? "text-emerald-500" : "text-red-500"
                                                    }`}
                                                >
                                                    {p.stock ?? 0} units
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => {
                                                setProduct({
                                                    name: p.name,
                                                    price: p.price,
                                                    description: p.description || "",
                                                    category: p.category || "",
                                                    brand: p.brand || "",
                                                    stock: p.stock || "",
                                                    images: [],
                                                });
                                                setEditId(p._id);
                                                window.scrollTo({ top: 400, behavior: "smooth" });
                                            }}
                                            className="qk-btn-secondary px-3 py-1.5 text-xs uppercase tracking-wider font-bold"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteProduct(p._id)}
                                            className="bg-red-50 hover:bg-red-100 dark:bg-red-500/15 dark:hover:bg-red-500/25 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-bold transition-all"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
