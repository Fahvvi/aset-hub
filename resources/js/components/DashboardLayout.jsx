import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import useAuthStore from '../store/authStore';

export default function DashboardLayout() {
    const { isAuthenticated } = useAuthStore();

    // Proteksi rute: Jika belum login, tendang kembali ke /login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-background font-sans">
            <Sidebar />
            
            {/* Konten Utama (Bergeser sedikit memberi ruang untuk sidebar yang collapsed) */}
            <main className="flex-1 ml-16 p-4 md:p-8 transition-all duration-300 w-full overflow-x-hidden">
                <div className="mx-auto max-w-7xl w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}