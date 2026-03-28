import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

let setLoadingGlobal;
let requestCount = 0;

export const setLoader = (loaderSetter) => {
    setLoadingGlobal = loaderSetter;
};

// 🔥 AUTO ADD TOKEN
API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem("user"));

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
        if(requestCount === 0 && setLoadingGlobal) {
            setLoadingGlobal(false);
        }
        return Promise.reject(err);
    }
);

export default API;