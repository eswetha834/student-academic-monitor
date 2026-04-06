import axios from "axios";

// Hardcoded production URL to avoid environment variable issues
const API_BASE_URL = 'https://student-academic-monitor.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export default api;
