import './bootstrap';
import '../css/app.css';

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import DashboardLayout from './components/DashboardLayout';
import useAuthStore from './store/authStore';



import Dashboard from './pages/dashboard/Dashboard';
import MasterData from './pages/master/MasterData';

import AssetList from './pages/assets/AssetList';
import AssetForm from './pages/assets/AssetForm';
import AssetDetail from './pages/assets/AssetDetail';
import AssetEdit from './pages/assets/AssetEdit';
import MaintenanceList from './pages/maintenance/MaintenanceList';

import TransferList from './pages/transfers/TransferList';
import DisposalList from './pages/disposals/DisposalList';
import ReportDashboard from './pages/reports/ReportDashboard';
import Settings from './pages/settings/Setting';

const App = () => {
    // Memastikan status login bertahan saat halaman di-refresh
    const { fetchUser, token } = useAuthStore();
    useEffect(() => {
        if (token) fetchUser();
    }, [token, fetchUser]);

    return (
        <BrowserRouter>
            <Routes>
                {/* Rute Publik */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                
                {/* Rute Terproteksi (Dibungkus oleh DashboardLayout) */}
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/master-data" element={<MasterData />} />
                    {/* Nanti rute /assets, /reports, dll ditambahkan di sini */}

                    <Route path="/assets" element={<AssetList />} />
                    <Route path="/assets/create" element={<AssetForm />} />
                    <Route path="/assets/:id" element={<AssetDetail />} />
                    <Route path="/assets/:id/edit" element={<AssetEdit />} />

                    <Route path="/maintenances" element={<MaintenanceList />} />
                    
                    <Route path="/transfers" element={<TransferList />} />
                    <Route path="/disposals" element={<DisposalList />} />
                    <Route path="/reports" element={<ReportDashboard />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

const container = document.getElementById('app');
if (!container._reactRoot) {
    container._reactRoot = createRoot(container);
}
container._reactRoot.render(<App />);