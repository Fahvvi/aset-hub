import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import useAuthStore from '../store/authStore';
import Header from './Header';

export default function DashboardLayout() {
    const { isAuthenticated } = useAuthStore();

    // Proteksi rute: Jika belum login, tendang kembali ke /login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar di sisi kiri (fixed) */}
      <Sidebar />
      
      {/* Container utama yang bergeser ke kanan sebesar lebar Sidebar saat dilipat (ml-16 = 4rem = 64px) */}
      <div className="flex flex-col flex-1 ml-16 transition-all duration-300">
        
        {/* Header di atas */}
        <Header />
        
        {/* Area Konten Utama */}
        <main className="p-4 md:p-8 w-full overflow-x-hidden">
          <div className="mx-auto max-w-7xl w-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
    );
}