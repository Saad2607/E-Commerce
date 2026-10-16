import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../features/authSlice";
import { getStoredUser } from "../utils/getStoredUser";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

let setLoadingGlobal;
let requestCount = 0;

export const setLoader = (loaderSetter) => {
    setLoadingGlobal = loaderSetter;
};

API.interceptors.request.use((req) => {
    const user = getStoredUser();

    if (user?.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    }

    // Do not trigger full-screen blocking loader for silent background requests
    if (!req.silent) {
        requestCount++;
        if (setLoadingGlobal) setLoadingGlobal(true);
    }

    return req;
});

API.interceptors.response.use(
    (res) => {
        if (!res.config?.silent) {
            requestCount = Math.max(0, requestCount - 1);
            if (requestCount === 0 && setLoadingGlobal) {
                setLoadingGlobal(false);
            }
        }
        return res;
    },
    (err) => {
        if (!err.config?.silent) {
            requestCount = Math.max(0, requestCount - 1);
            if (requestCount === 0 && setLoadingGlobal) {
                setLoadingGlobal(false);
            }
        }

        const isAuthPage = [
            "/login",
            "/register",
            "/forgot-password",
            "/verify-email",
            "/verify-reset-otp",
            "/reset-password",
        ].some((path) => window.location.pathname.startsWith(path));

        // Handle unverified account response (403 requiresVerification)
        if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
            const emailParam = err.response.data.email
                ? `?email=${encodeURIComponent(err.response.data.email)}`
                : "";
            if (!window.location.pathname.startsWith("/verify-email") && !err.config?.silent) {
                window.location.href = `/verify-email${emailParam}`;
            }
            return Promise.reject(err);
        }

        // Handle expired/invalid session (401)
        if (err.response?.status === 401) {
            store.dispatch(logout());
            // Only redirect if it's an explicit user action and not a silent background poll
            if (!isAuthPage && !err.config?.silent && !window.location.search.includes("session=expired")) {
                window.location.href = "/login?session=expired";
            }
        }

        return Promise.reject(err);
    }
);

export default API;
