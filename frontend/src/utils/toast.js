import toast from "react-hot-toast";

const toastStyle = {
    borderRadius: "12px",
    padding: "14px 18px",
    fontSize: "14px",
    fontWeight: 500,
    maxWidth: "380px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
};

export const showSuccess = (message) =>
    toast.success(message, {
        duration: 3500,
        style: {
            ...toastStyle,
            background: "#111827",
            color: "#f9fafb",
            border: "1px solid #eab308",
        },
        iconTheme: {
            primary: "#eab308",
            secondary: "#111827",
        },
    });

export const showError = (message) =>
    toast.error(message, {
        duration: 4000,
        style: {
            ...toastStyle,
            background: "#111827",
            color: "#f9fafb",
            border: "1px solid #ef4444",
        },
        iconTheme: {
            primary: "#ef4444",
            secondary: "#111827",
        },
    });

export const showInfo = (message) =>
    toast(message, {
        duration: 3500,
        icon: "ℹ️",
        style: {
            ...toastStyle,
            background: "#111827",
            color: "#f9fafb",
            border: "1px solid #6b7280",
        },
    });

export default toast;
