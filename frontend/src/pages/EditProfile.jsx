import { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { updateUser } from "../features/authSlice";

const EditProfile = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });
    const dispatch = useDispatch();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setForm({ ...form, name: user.name, email: user.email });
        }
    }, []);

    const updateProfile = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            
            const { data } = await API.put("/auth/profile", form, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            dispatch(updateUser(data));

            toast.success("Profile updated ✅");
        } catch (error) {
            console.log(error.response?.data);
            toast.error(error.response?.data?.msg || "Error updating profile ❌");
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-4 p-6 bg-white dark:bg-gray-800 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

            <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border p-2 mb-3 text-black rounded"
                placeholder="Name"
            />

            <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border p-2 mb-3 text-black rounded"
                placeholder="Email"
            />

            <input
                type="password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border p-2 mb-3 text-black rounded"
                placeholder="New Password"
            />

            <button
                onClick={updateProfile}
                className="bg-yellow-500 w-full py-3 rounded"
            >
                Update Profile
            </button>
        </div>
    );
};

export default EditProfile;