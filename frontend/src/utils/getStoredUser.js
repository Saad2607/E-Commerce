export const getStoredUser = () => {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        localStorage.removeItem("user");
        return null;
    }
};
