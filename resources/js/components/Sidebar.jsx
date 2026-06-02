import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Box,
  Wrench,
  ArrowRightLeft,
  Trash2,
  FileText,
  Settings,
  LogOut,
  ChevronsUpDown,
  Database,
  Users
} from "lucide-react";
import useAuthStore from "../store/authStore";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const sidebarVariants = {
  open: { width: "16rem" },
  closed: { width: "4rem" },
};

const variants = {
  open: { x: 0, opacity: 1, transition: { x: { stiffness: 1000, velocity: -100 } } },
  closed: { x: -20, opacity: 0, transition: { x: { stiffness: 100 } } },
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  
  // Ambil data user dari Zustand
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Daftar Aset", icon: Box, path: "/assets" },
    { name: "Data Master", icon: Database, path: "/master-data" },
    { name: "Pemeliharaan", icon: Wrench, path: "/maintenances" },
    { name: "Mutasi Aset", icon: ArrowRightLeft, path: "/transfers" },
    { name: "Penghapusan", icon: Trash2, path: "/disposals" },
    { name: "Laporan", icon: FileText, path: "/reports" },
  ];

  return (
    <motion.div
      className="fixed left-0 top-0 z-40 h-screen shrink-0 border-r bg-white shadow-sm"
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => {
        setIsCollapsed(true);
        setIsProfileOpen(false);
      }}
    >
      <div className="flex h-full flex-col relative">
        {/* Header / Logo Area */}
        <div className="flex h-[60px] w-full items-center border-b px-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
            <Box size={24} />
          </div>
          {!isCollapsed && (
            <motion.div variants={variants} className="ml-3 flex flex-col overflow-hidden">
              <span className="font-bold text-gray-800 leading-tight tracking-wide">AssetHub</span>
              <span className="text-xs text-gray-500 font-medium">{user?.role?.toUpperCase() || 'STAFF'}</span>
            </motion.div>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1.5 scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname.includes(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex h-10 w-full items-center rounded-md px-3 transition-colors",
                  isActive 
                    ? "bg-blue-50 text-primary font-medium" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "")} />
                {!isCollapsed && (
                  <motion.span variants={variants} className="ml-3 text-sm whitespace-nowrap">
                    {item.name}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer / User Profile */}
        <div className="border-t p-3 relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex w-full items-center rounded-md p-2 hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-primary font-bold">
              {user?.nama?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <motion.div variants={variants} className="ml-3 flex w-full items-center justify-between overflow-hidden">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-gray-800 truncate w-32">{user?.nama || 'User'}</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
              </motion.div>
            )}
          </button>

          {/* Simple Dropdown Menu */}
          {!isCollapsed && isProfileOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-16 left-3 right-3 rounded-md border bg-white p-1 shadow-lg"
            >
              <div className="px-2 py-2 border-b mb-1">
                <p className="text-sm font-medium text-gray-800">{user?.nama}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Link to="/settings" className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-gray-600 hover:bg-gray-100">
                <Settings className="h-4 w-4" /> Pengaturan
              </Link>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}