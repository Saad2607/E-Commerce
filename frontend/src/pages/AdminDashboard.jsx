import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const AdminDashboard = () => {
    const [data, setData] = useState({});
    const [product, setProduct] = useState({ name: "", price: "", images: [], description: "" });
    const [products, setProducts] = useState([]);
    const [editId, setEditId] = useState(null);

    const addProduct = async () => {
        try {
            let imageUrls = [];

            for (let i = 0; i < product.images.length; i++) {
                const formData = new FormData();
                formData.append("images", product.images[i]);

                const { data } = await API.post("/upload", formData);
                console.log("UPLOAD RESPONSE: ", data);

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
            setProduct({
                name: "",
                price: "",
                images: [],
                description: "",
                category: "",
                brand: "",
                stock: "",
            });
            fetchProducts();
        } catch (err) {
            console.log(err);
            toast.error("Error adding product ❌");
        }
    };

    const fetchProducts = async () => {
        const { data } = await API.get("/products");
        setProducts(data);
    };

    const deleteProduct = async (id) => {
        await API.delete(`/products/${id}`);
        toast.success("Deleted ❌");
        fetchProducts();
    };

    const updateProduct = async () => {
        try {
            await API.put(`/products/${editId}`, product);

            toast.success("Updated ✅");
            setEditId(null);
            fetchProducts();
        } catch {
            toast.error("Update failed ❌");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const res = await API.get("/admin");
            setData(res.data);
        };
        fetchData();
        fetchProducts();
    }, []);

    const chartData = [
        { name: "Users", value: data.totalUsers || 0 },
        { name: "Orders", value: data.totalOrders || 0 },
        { name: "Revenue", value: data.totalRevenue || 0 },
    ];

    return (
        <div className="p-6">
            {/* STATS */}
            <div className="p-6 grid grid-cols-3 gap-3">

                <div className="bg-blue-500 text-white p-4 rounded">
                    Users: {data.totalUsers}
                </div>

                <div className="bg-green-500 text-white p-4 rounded">
                    Orders: {data.totalOrders}
                </div>

                <div className="bg-yellow-500 text-white p-4 rounded">
                    Revenue: ₹{data.totalRevenue}
                </div>
            </div>

            {/* ✅ CHART SECTION */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mt-6">
                <h2 className="text-xl font-bold mb-4">Analytics</h2>

                <div className="grid grid-cols-2 gap-6 mt-6">

                    {/* Users & Orders */}
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="mb-2 font-bold">Users & Orders</h3>

                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={[
                                    { name: "Users", value: data.totalUsers || 0 },
                                    { name: "Orders", value: data.totalOrders || 0 },
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3B82F6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Revenue */}
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="mb-2 font-bold">Revenue</h3>

                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={[
                                    { name: "Revenue", value: data.totalRevenue || 0 },
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#22C55E" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md mt-10">
                <h1 className="text-xl font-bold mb-4">Add Product</h1>

                <input
                    placeholder="Name"
                    className="border p-2 w-full mb-2 text-black rounded-xl"
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                />
                <input
                    placeholder="Price"
                    type="number"
                    className="border p-2 w-full mb-2 text-black rounded-xl"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: e.target.value })}
                />

                <input
                    type="file"
                    multiple
                    onChange={(e) =>
                        setProduct({ ...product, images: e.target.files })
                    }
                />

                <input
                    placeholder="Description"
                    className="border p-2 w-full mb-2 text-black rounded-xl mt-2"
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                />

                <input
                    placeholder="Category"
                    className="border p-2 w-full mb-2 text-black rounded-xl"
                    value={product.category}
                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                />

                <input
                    placeholder="Brand"
                    className="border p-2 w-full mb-2 text-black rounded-xl"
                    value={product.brand}
                    onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                />

                <input
                    placeholder="Stock"
                    className="border p-2 w-full mb-2 text-black rounded-xl"
                    value={product.stock}
                    onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                />

                <button
                    onClick={editId ? updateProduct : addProduct}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 w-full rounded-xl"
                >
                    {editId ? "Update Product" : "Add Product"}
                </button>
            </div>

            <h2 className="text-xl mt-6 mb-3">Products</h2>

            {products.map((p) => (
                <div key={p._id} className="border p-3 mb-2 flex justify-between rounded-2xl shadow-lg">
                    <div>
                        <p>{p.name}</p>
                        <p>₹{p.price}</p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
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
                            }}
                            className="bg-blue-500 text-white px-2 rounded"
                        >
                            Edit
                        </button>

                        <button
                            onClick={() => deleteProduct(p._id)}
                            className="bg-red-500 text-white px-2 rounded"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminDashboard;