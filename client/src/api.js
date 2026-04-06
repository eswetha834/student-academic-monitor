import axios from "axios";

// Try multiple environment variable names
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                   process.env.VITE_API_URL || 
                   process.env.API_URL || 
                   'https://student-academic-monitor.onrender.com/api';

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
