import axios from 'axios';

// Gunakan URL Laragon Anda jika ada, atau biarkan kosong agar memakai domain yang sama
const axiosInstance = axios.create({
    baseURL: '/api/v1', // Endpoint API sesuai rancangan
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor untuk menyisipkan Bearer Token otomatis
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;