import axios from 'axios';

const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    if (!url.endsWith('/api')) {
        url = `${url}/api`;
        url = url.replace('//api', '/api');
    }
    return url;
};

const apiClient = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;
