import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { setLoader } from "./services/api";
import { useLoader } from "./context/LoaderContext";

import Navbar from "./components/Navbar";
import Loader from "./components/Loader";

import Home from "./pages/Home";
import Wishlist from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/AdminOrders";
import OrderSuccess from "./pages/OrderSuccess";

function App() {
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const { user } = useSelector((state) => state.auth);
  const { setLoading } = useLoader();

  useEffect(() => {
    setLoader(setLoading);
  }, [setLoading]);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);


  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition duration-300">
      <BrowserRouter>
        <Loader />
        <Navbar dark={dark} setDark={setDark} search={search} setSearch={setSearch} />
        <Routes>
          <Route path="/" element={<Home search={search} />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin"
            element={user?.isAdmin ? <AdminDashboard /> : <Navigate to="/" />}
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/order-success" element={<OrderSuccess />} />
        </Routes>

      </BrowserRouter >
    </div>
  );
}

export default App;