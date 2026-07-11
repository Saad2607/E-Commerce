import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { setLoader } from "./services/api";
import { useLoader } from "./context/LoaderContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import ScrollToTop from "./components/ScrollToTop";
import MobileNav from "./components/MobileNav";

import Home from "./pages/Home";
import Wishlist from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/AdminOrders";
import OrderSuccess from "./pages/OrderSuccess";

function App() {
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const { setLoading } = useLoader();

  useEffect(() => {
    setLoader(setLoading);
  }, [setLoading]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition duration-300">
      <BrowserRouter>
        <Loader />
        <ScrollToTop />
        <Navbar dark={dark} setDark={setDark} search={search} setSearch={setSearch} />

        <main className="flex-1 pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Home search={search} />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
            <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          </Routes>
        </main>

        <MobileNav />

        <footer className="hidden md:block bg-gray-900 text-gray-400">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
          <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <p className="text-white font-bold text-lg mb-2">
                Quick<span className="text-yellow-400">Kart</span>
              </p>
              <p className="text-sm leading-relaxed">
                Fast & smart shopping with secure payments and quick delivery.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Quick Links</p>
              <div className="space-y-2 text-sm">
                <Link to="/" className="block hover:text-yellow-400 transition">Shop</Link>
                <Link to="/cart" className="block hover:text-yellow-400 transition">Cart</Link>
                <Link to="/my-orders" className="block hover:text-yellow-400 transition">My Orders</Link>
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Support</p>
              <div className="space-y-2 text-sm">
                <Link to="/profile" className="block hover:text-yellow-400 transition">My Account</Link>
                <Link to="/login" className="block hover:text-yellow-400 transition">Login</Link>
                <Link to="/register" className="block hover:text-yellow-400 transition">Register</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 text-center py-4 text-xs">
            © {new Date().getFullYear()} QuickKart — Fast & Smart Shopping
          </div>
        </footer>
      </BrowserRouter>
    </div>
  );
}

export default App;
