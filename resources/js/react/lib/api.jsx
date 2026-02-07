import axios from "axios";

const api = axios.create({
    baseURL: "/api/admin",
    withCredentials: true,
    headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
    },
});

const token = document.querySelector('meta[name="csrf-token"]');
if (token) {
    api.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
}

export default api;
