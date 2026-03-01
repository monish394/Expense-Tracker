import axios from 'axios';

// Create an instance of axios
const api = axios.create({
    // Using a relative path ensures the browser uses the current domain (e.g., your Render URL)
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration or errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle specific errors like 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            // Clear local storage and redirect to login if necessary
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
