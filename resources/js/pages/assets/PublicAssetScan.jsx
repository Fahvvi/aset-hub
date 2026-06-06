import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, MapPin, Calendar, Image as ImageIcon, User, ShieldCheck, AlertTriangle, Briefcase, Barcode } from 'lucide-react';
import axiosInstance from '../../api/axios'; // Pastikan axiosInstance tidak memaksa redirect ke login jika 401/tanpa token

export default function PublicAssetScan() {
  const { kode } = useParams();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await axiosInstance.get(`/scan/${kode}`);
        setAsset(response.data.data || response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Aset tidak ditemukan.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAsset();
  }, [kode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500 font-medium">Memindai data aset...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle size={60} className="text-red-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-800 mb-2">Aset Tidak Valid</h1>
        <p className="text-gray-500">{error || 'Data aset tidak ditemukan dalam sistem.'}</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (status === 'aktif') return 'bg-green-500 text-white';
    if (status === 'dalam_perbaikan') return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header Branding */}
        <div className="bg-primary px-6 py-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] opacity-10">
            <ShieldCheck size={120} />
          </div>
          <h1 className="text-2xl font-black tracking-widest relative z-10">PT SDI</h1>
          <p className="text-indigo-100 text-sm font-medium tracking-widest uppercase mt-1 relative z-10">Asset Verification</p>
        </div>

        {/* Info Aset Utama */}
        <div className="px-6 py-6 text-center border-b border-gray-100 relative">
          <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
            {asset.foto_url ? (
              <img src={asset.foto_url} alt="Aset" className="w-20 h-20 object-cover rounded-xl" />
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                <ImageIcon size={30} className="text-gray-300" />
              </div>
            )}
          </div>
          
          <div className="mt-12">
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 ${getStatusColor(asset.status)}`}>
              Status: {asset.status?.replace('_', ' ')}
            </span>
            <h2 className="text-xl font-bold text-gray-800 leading-tight">{asset.nama_aset}</h2>
            <p className="text-gray-500 font-mono mt-1 text-sm bg-gray-100 inline-block px-3 py-1 rounded-lg border border-gray-200">{asset.kode_aset}</p>
          </div>
        </div>

        {/* Detail Aset */}
        <div className="p-6 bg-gray-50/50 flex flex-col gap-4">
          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><Briefcase size={20} /></div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Departemen</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{asset.departemen || 'Belum Dialokasikan'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg shrink-0"><MapPin size={20} /></div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lokasi Saat Ini</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{asset.lokasi || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0"><User size={20} /></div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Penanggung Jawab</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{asset.penanggung_jawab || 'Tidak ada'}</p>
            </div>
          </div>

          {asset.nomor_seri && (
             <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
             <div className="p-2 bg-green-50 text-green-600 rounded-lg shrink-0"><Barcode size={20} /></div>
             <div className="min-w-0">
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nomor Seri (S/N)</p>
               <p className="text-sm font-semibold text-gray-800 font-mono truncate">{asset.nomor_seri}</p>
             </div>
           </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400">Terverifikasi oleh Sistem EAM PT Selaras Donlim Indonesia</p>
        </div>

      </div>
    </div>
  );
}