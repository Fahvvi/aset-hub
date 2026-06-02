import React, { useState, useEffect } from 'react';
import { User, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '../../api/axios';

export default function Settings() {
  const [profile, setProfile] = useState({ nama: '', email: '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ambil data profil saat komponen dimuat
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/profile');
        setProfile({ nama: res.data.nama, email: res.data.email });
      } catch (error) {
        console.error("Gagal mengambil profil", error);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const submitProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await axiosInstance.put('/profile', profile);
      setStatus({ type: 'success', message: 'Profil berhasil diperbarui!' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Gagal memperbarui profil.' });
    } finally {
      setIsLoading(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    
    if (passwords.new_password !== passwords.new_password_confirmation) {
      setStatus({ type: 'error', message: 'Konfirmasi password baru tidak cocok!' });
      setIsLoading(false);
      return;
    }

    try {
      await axiosInstance.put('/profile/password', passwords);
      setStatus({ type: 'success', message: 'Password berhasil diubah!' });
      setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Gagal mengubah password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">
      
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Pengaturan Akun</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola profil dan keamanan akun Anda.</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {status.type === 'success' ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Form Profil */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
            <User size={18} className="text-primary"/> Informasi Pribadi
          </h3>
          <form onSubmit={submitProfile} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
              <input type="text" name="nama" required value={profile.nama} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Email</label>
              <input type="email" name="email" required value={profile.email} onChange={handleProfileChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <button type="submit" disabled={isLoading} className="mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              <Save size={16} /> Simpan Profil
            </button>
          </form>
        </div>

        {/* Form Password */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h3 className="font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
            <Lock size={18} className="text-orange-500"/> Ubah Password
          </h3>
          <form onSubmit={submitPassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Saat Ini</label>
              <input type="password" name="current_password" required value={passwords.current_password} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
              <input type="password" name="new_password" required minLength="8" value={passwords.new_password} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ulangi Password Baru</label>
              <input type="password" name="new_password_confirmation" required minLength="8" value={passwords.new_password_confirmation} onChange={handlePasswordChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <button type="submit" disabled={isLoading} className="mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              <Save size={16} /> Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}