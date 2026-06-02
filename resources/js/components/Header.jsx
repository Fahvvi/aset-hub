import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import axiosInstance from '../api/axios';

export default function Header() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const dropdownRef = useRef(null);

  // Ambil data notifikasi
  const fetchNotif = async () => {
    try {
      const res = await axiosInstance.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (e) {
      console.error("Gagal mengambil notifikasi", e);
    }
  };

  useEffect(() => {
    fetchNotif();
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tandai satu notifikasi sudah dibaca
  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      ));
    } catch (e) {
      console.error(e);
    }
  };

  // Tandai semua sudah dibaca
  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-end px-4 md:px-8 sticky top-0 z-30 shadow-sm">
      <div className="relative" ref={dropdownRef}>
        
        {/* Tombol Lonceng */}
        <button 
          onClick={() => setShowNotif(!showNotif)}
          className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Notifikasi */}
        {showNotif && (
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col transform origin-top-right transition-all">
            
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
              <h3 className="text-sm font-bold text-gray-800">Notifikasi</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-primary hover:text-indigo-700 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck size={14} /> Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto flex flex-col">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center text-gray-400">
                  <Bell size={32} className="mb-2 opacity-20" />
                  <p className="text-sm font-medium">Belum ada notifikasi.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`px-4 py-3 border-b border-gray-50 flex gap-3 hover:bg-gray-50 transition-colors ${!notif.read_at ? 'bg-blue-50/20' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.read_at ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                        {notif.data?.message || 'Pemberitahuan Sistem'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!notif.read_at && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="p-1.5 text-blue-400 hover:text-primary hover:bg-blue-50 rounded-md h-fit transition-colors"
                        title="Tandai sudah dibaca"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
              <span className="text-xs text-gray-400 font-medium">Sistem Manajemen Aset</span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}