import { create } from 'zustand';
import axiosInstance from '../api/axios';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('auth_token') || null,
    isAuthenticated: !!localStorage.getItem('auth_token'),
    isLoading: false,

    login: async (username, password) => {
        set({ isLoading: true });
        try {
            const response = await axiosInstance.post('/auth/login', { username, password });
            const { user, access_token } = response.data;
            
            localStorage.setItem('auth_token', access_token);
            set({ user, token: access_token, isAuthenticated: true, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.response?.data?.message || 'Login gagal' };
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('auth_token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },

    fetchUser: async () => {
        try {
            const response = await axiosInstance.get('/auth/me');
            set({ user: response.data, isAuthenticated: true });
        } catch (error) {
            localStorage.removeItem('auth_token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    }
}));

export default useAuthStore;