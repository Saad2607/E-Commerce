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
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOtp from "./pages/VerifyResetOtp";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import MyOrders from "./pages/MyOrders";
import AdminOrders from "./pages/AdminOrders";
import OrderSuccess from "./pages/OrderSuccess";
import { FaShieldAlt, FaTruck, FaLock, FaCreditCard } from "react-icons/fa";

function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("qk_theme");
    return saved !== null ? saved === "dark" : true; // Default to luxury dark
  });
  const [search, setSearch] = useState("");
  const { setLoading } = useLoader();

  useEffect(() => {
    setLoader(setLoading);
  }, [setLoading]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    localStorage.setItem("qk_theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-[#0b0f17] dark:text-gray-100">
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
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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

        {/* Luxury Obsidian & Gold Footer */}
        <footer className="hidden md:block bg-slate-900 dark:bg-[#080c14] border-t border-gray-200 dark:border-amber-500/15 text-gray-400 relative overflow-hidden transition-colors duration-300">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
          
          <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-black text-black text-lg shadow-gold-sm">
                  Q
                </span>
                <span className="text-xl font-black tracking-tight text-white">
                  Quick<span className="text-amber-400">Kart</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed text-gray-400">
                Premium e-commerce platform curated for elite quality, lightning-fast delivery, and encrypted payments.
              </p>
              {/* <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Systems Operational
              </div> */}
            </div>

            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2">
                Explore Store
              </p>
              <div className="space-y-2.5 text-xs">
                <Link to="/" className="block hover:text-amber-400 transition-colors">Catalog & Electronics</Link>
                <Link to="/cart" className="block hover:text-amber-400 transition-colors">Shopping Cart</Link>
                <Link to="/wishlist" className="block hover:text-amber-400 transition-colors">Saved Wishlist</Link>
                <Link to="/my-orders" className="block hover:text-amber-400 transition-colors">Order Tracking</Link>
              </div>
            </div>

            <div>
              <p className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2">
                Account & Security
              </p>
              <div className="space-y-2.5 text-xs">
                <Link to="/profile" className="block hover:text-amber-400 transition-colors">My Profile</Link>
                <Link to="/edit-profile" className="block hover:text-amber-400 transition-colors">Security & Password</Link>
                <Link to="/login" className="block hover:text-amber-400 transition-colors">Customer Sign In</Link>
                <Link to="/register" className="block hover:text-amber-400 transition-colors">Create Account</Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-amber-400 pl-2">
                Trust & Security
              </p>
              <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-300">
                  <FaShieldAlt className="text-amber-400 shrink-0" />
                  <span>256-bit SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FaCreditCard className="text-amber-400 shrink-0" />
                  <span>Razorpay Verified Gateway</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FaTruck className="text-amber-400 shrink-0" />
                  <span>Insured Express Shipping</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-900/80 bg-[#060910] text-center py-4 text-xs text-gray-500">
            © {new Date().getFullYear()} QuickKart Inc. All rights reserved. Built with luxury dark precision.
          </div>
        </footer>
      </BrowserRouter>
    </div>
  );
}

export default App;
