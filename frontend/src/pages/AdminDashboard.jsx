import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { FaBox, FaClipboardList, FaRupeeSign, FaUsers } from "react-icons/fa";
import AdminLayout from "../components/AdminLayout";

const inputClass =
    "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400";

const AdminDashboard = () => {
    const [data, setData] = useState({});
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

    const fetchProducts = async () => {
        try {
            const { data } = await API.get("/products");
            setProducts(data);
        } catch {
            toast.error("Failed to load products");
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
                price: product.price,
                description: product.description,
                images: imageUrls,
                category: product.category,
                brand: product.brand,
                stock: product.stock,
            });

            toast.success("Product Added ✅");
            resetForm();
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Error adding product ❌");
        }
    };

    const deleteProduct = async (id) => {
        try {
            await API.delete(`/products/${id}`);
            toast.success("Product Deleted ✅");
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Delete failed ❌");
        }
    };

    const updateProduct = async () => {
        try {
            await API.put(`/products/${editId}`, product);
            toast.success("Product Updated ✅");
            resetForm();
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Update failed ❌");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await API.get("/admin");
                setData(res.data);
            } catch {
                toast.error("Failed to load dashboard stats");
            }
        };
        fetchData();
        fetchProducts();
    }, []);

    const stats = [
        { label: "Total Users", value: data.totalUsers || 0, icon: FaUsers, color: "bg-blue-500" },
        { label: "Total Orders", value: data.totalOrders || 0, icon: FaClipboardList, color: "bg-green-500" },
        { label: "Total Products", value: data.totalProducts || 0, icon: FaBox, color: "bg-purple-500" },
        { label: "Revenue", value: `₹${data.totalRevenue || 0}`, icon: FaRupeeSign, color: "bg-yellow-500" },
    ];

    return (
        <AdminLayout
            title="Dashboard"
            subtitle="Manage products, view stats, and monitor your store"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div
                        key={label}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white`}>
                                <Icon size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Analytics Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Users & Orders</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={[
                                    { name: "Users", value: data.totalUsers || 0 },
                                    { name: "Orders", value: data.totalOrders || 0 },
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Revenue (₹)</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={[{ name: "Revenue", value: data.totalRevenue || 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#22C55E" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 h-fit">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        {editId ? "Edit Product" : "Add Product"}
                    </h2>

                    <div className="space-y-3">
                        <input placeholder="Product Name" className={inputClass} value={product.name}
                            onChange={(e) => setProduct({ ...product, name: e.target.value })} />
                        <input placeholder="Price (₹)" type="number" className={inputClass} value={product.price}
                            onChange={(e) => setProduct({ ...product, price: e.target.value })} />
                        <input type="file" multiple className="text-sm"
                            onChange={(e) => setProduct({ ...product, images: e.target.files })} />
                        <textarea placeholder="Description" rows={3} className={inputClass} value={product.description}
                            onChange={(e) => setProduct({ ...product, description: e.target.value })} />
                        <input placeholder="Category" className={inputClass} value={product.category}
                            onChange={(e) => setProduct({ ...product, category: e.target.value })} />
                        <input placeholder="Brand" className={inputClass} value={product.brand}
                            onChange={(e) => setProduct({ ...product, brand: e.target.value })} />
                        <input placeholder="Stock" type="number" className={inputClass} value={product.stock}
                            onChange={(e) => setProduct({ ...product, stock: e.target.value })} />

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={editId ? updateProduct : addProduct}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2.5 rounded-lg transition"
                            >
                                {editId ? "Update Product" : "Add Product"}
                            </button>
                            {editId && (
                                <button onClick={resetForm}
                                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        Products ({products.length})
                    </h2>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {products.map((p) => (
                            <div key={p._id}
                                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <div className="flex items-center gap-4 min-w-0">
                                    <img src={p.images?.[0]} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">{p.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">₹{p.price} · {p.category || "Uncategorized"}</p>
                                        <p className="text-xs text-gray-400">Stock: {p.stock ?? "N/A"}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => {
                                        setProduct({
                                            name: p.name,
                                            price: p.price,
                                            description: p.description,
                                            category: p.category || "",
                                            brand: p.brand || "",
                                            stock: p.stock || "",
                                            images: [],
                                        });
                                        setEditId(p._id);
                                    }} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm">
                                        Edit
                                    </button>
                                    <button onClick={() => deleteProduct(p._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
