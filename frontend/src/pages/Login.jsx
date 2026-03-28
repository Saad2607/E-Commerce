import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/authSlice";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async () => {
        try {
            const { data } = await API.post("/auth/login", form);

            console.log(data); // debug

            dispatch(loginSuccess(data));

            toast.success("Login Successful ✅");

            if (data.isAdmin) {
                navigate("/admin");
            } else {
                navigate("/");
            }

        } catch {
            toast.error("Invalid credentials ❌");
        }
    };

    return (
        <div className="flex flex-col items-center mt-20">
            <h1 className="text-2xl font-bold mb-4">Login</h1>

            <input
                placeholder="Email"
                className="border p-2 mb-2 w-64 rounded"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
                type="password"
                placeholder="Password"
                className="border p-2 mb-2 w-64 rounded"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button
                onClick={handleLogin}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Login
            </button>

            <p className="mt-3">
                Don't have an account?
                <span
                    className="text-blue-500 cursor-pointer ml-1"
                    onClick={() => navigate("/register")}
                >
                    Register
                </span>
            </p>
        </div>
    );
};

export default Login;