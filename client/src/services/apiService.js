// Step 6: Send Token to Backend - API Service
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('firebaseToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, clear it and redirect to login
      localStorage.removeItem('firebaseToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  // Login with Firebase token
  login: async (email, password) => {
    try {
      // First login with Firebase
      const { loginUser } = require('./authService');
      const { user, token } = await loginUser(email, password);
      
      // Store token in localStorage
      localStorage.setItem('firebaseToken', token);
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }));
      
      // Send token to backend for verification
      const response = await api.post('/auth/firebase-login', { token });
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register with Firebase token
  register: async (email, password, userData) => {
    try {
      // First register with Firebase
      const { registerUser } = require('./authService');
      const { user, token } = await registerUser(email, password, userData);
      
      // Store token in localStorage
      localStorage.setItem('firebaseToken', token);
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userData
      }));
      
      // Send token to backend for verification and user creation
      const response = await api.post('/auth/firebase-register', { 
        token, 
        userData 
      });
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      // Clear local storage
      localStorage.removeItem('firebaseToken');
      localStorage.removeItem('user');
      
      // Notify backend
      await api.post('/auth/logout');
      
      // Logout from Firebase
      const { logoutUser } = require('./authService');
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if backend call fails
      localStorage.removeItem('firebaseToken');
      localStorage.removeItem('user');
    }
  }
};

// Protected API calls
export const protectedAPI = {
  // Get user data
  getUserData: async () => {
    const response = await api.get('/user/data');
    return response.data;
  },

  // Get marks
  getMarks: async () => {
    const response = await api.get('/marks');
    return response.data;
  },

  // Get attendance
  getAttendance: async () => {
    const response = await api.get('/attendance');
    return response.data;
  },

  // Get stats
  getStats: async () => {
    const response = await api.get('/stats/student');
    return response.data;
  }
};

// Generic API call with token (Step 6 example)
export const callProtectedAPI = async (endpoint, method = 'GET', data = null) => {
  try {
    const token = localStorage.getItem('firebaseToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const config = {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`http://localhost:5000/api${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

export default api;
