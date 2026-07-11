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

    requestCount++;
    if (setLoadingGlobal) setLoadingGlobal(true);

    return req;
});

API.interceptors.response.use(
    (res) => {
        requestCount--;
        if (requestCount === 0 && setLoadingGlobal) {
            setLoadingGlobal(false);
        }
        return res;
    },
    (err) => {
        requestCount--;
        if (requestCount === 0 && setLoadingGlobal) {
            setLoadingGlobal(false);
        }

        if (err.response?.status === 401) {
            store.dispatch(logout());
            const isAuthPage = ["/login", "/register", "/forgot-password"].some(
                (path) => window.location.pathname.startsWith(path)
            );
            if (!isAuthPage) {
                window.location.href = "/login?session=expired";
            }
        }

        return Promise.reject(err);
    }
);

export default API;
