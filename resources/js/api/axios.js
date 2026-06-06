import axios from 'axios';

// Gunakan URL Laragon Anda jika ada, atau biarkan kosong agar memakai domain yang sama
const axiosInstance = axios.create({
  baseURL: '/api/v1',   
    // baseURL: 'http://backend-aset.test:8000/api/v1', // <-- Sesuaikan dengan URL backend Anda
  headers: {
    'Accept': 'application/json', // <-- INI SANGAT PENTING
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
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