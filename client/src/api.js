import axios from "axios";

// Use environment variable or fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://student-academic-monitor.onrender.com/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// Add error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error - backend may be down');
        }
        return Promise.reject(error);
    }
);

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

export default api;
