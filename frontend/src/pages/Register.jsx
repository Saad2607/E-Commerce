import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Register = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await API.post("/auth/register", form);
            toast.success("Registered Successfully 🎉");
            navigate("/login");
        } catch {
            toast.error("Error registering ❌");
        }
    };

    return (
        <div className="flex flex-col items-center mt-20">
            <h1 className="text-2xl font-bold mb-4">Register</h1>

            <input
                placeholder="Name"
                className="border p-2 mb-2 w-64 rounded"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

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
                onClick={handleRegister}
                className="bg-green-500 text-white px-4 py-2 rounded"
            >
                Register
            </button>
        </div>
    );
};

export default Register;