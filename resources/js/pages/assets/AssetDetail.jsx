import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit, Box, MapPin, Calendar, Image as ImageIcon, 
  User, Mail, Shield, X 
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axios';

export default function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk mengontrol muncul/hilangnya Modal User
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await axiosInstance.get(`/assets/${id}`);
        setAsset(response.data.data || response.data);
      } catch (error) {
        console.error("Gagal mengambil detail aset", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Memuat data aset...</div>;
  if (!asset) return <div className="p-8 text-center text-red-500">Aset tidak ditemukan.</div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/assets" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">{asset.nama_aset}</h1>
            <p className="text-sm text-gray-500 mt-1 font-mono">{asset.kode_aset}</p>
          </div>
        </div>
        <Link 
          to={`/assets/${asset.id}/edit`} 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Edit size={16} /> Edit Aset
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Info Utama */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Kategori</p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Box size={16} className="text-gray-400"/> {asset.kategori || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Lokasi</p>
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> {asset.lokasi || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Vendor / Supplier</p>
                <p className="text-sm font-semibold text-gray-800">{asset.vendor || '-'}</p>
              </div>
              
              {/* TOMBOL DIGUNAKAN OLEH */}
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Digunakan Oleh</p>
                {asset.user_detail ? (
                  <button 
                    onClick={() => setShowUserModal(true)}
                    className="text-sm font-semibold text-primary hover:text-indigo-700 hover:underline flex items-center gap-1.5 transition-colors text-left"
                  >
                    <User size={15} />
                    {asset.penanggung_jawab}
                  </button>
                ) : (
                  <p className="text-sm font-semibold text-gray-800">Belum Ada Penanggung Jawab</p>
                )}
              </div>

            </div>
            
            <h3 className="font-bold text-gray-800 border-b pb-3 mb-4 mt-8">Catatan / Keterangan</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-line">
              {asset.keterangan || 'Tidak ada catatan tambahan untuk aset ini.'}
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Foto & Status */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[220px] overflow-hidden bg-gray-50/30">
            {asset.foto_url ? (
              <img 
                src={asset.foto_url} 
                alt={asset.nama_aset} 
                className="w-full h-48 object-cover rounded-lg border border-gray-100 shadow-sm bg-white"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.className = "hidden";
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-300 py-6">
                <ImageIcon size={44} className="mb-2 text-gray-300" />
                <span className="text-xs text-gray-400 font-medium">Tidak ada foto aset</span>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Status Aset</h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border uppercase ${
                  asset.status === 'aktif' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {asset.status?.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Kondisi</span>
                <span className="text-sm font-semibold text-gray-800 uppercase">{asset.kondisi?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Data Finansial</h3>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Harga Perolehan</p>
                <p className="text-lg font-bold text-gray-800">Rp {new Intl.NumberFormat('id-ID').format(asset.harga_perolehan)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1"><Calendar size={12}/> Tgl Beli</p>
                  <p className="text-sm font-semibold text-gray-800">{asset.tanggal_pembelian}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1 flex items-center gap-1"><Calendar size={12}/> Tgl Aktif</p>
                  <p className="text-sm font-semibold text-gray-800">{asset.tanggal_aktif}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- MODAL PROFIL USER --- */}
      {showUserModal && asset.user_detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">
            
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <User size={16} className="text-primary" /> Profil Pengguna
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              {/* Avatar Initial */}
              <div className="h-20 w-20 bg-blue-100 text-primary rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-inner">
                {asset.user_detail.nama.charAt(0).toUpperCase()}
              </div>
              
              <h4 className="text-xl font-bold text-gray-800 text-center">{asset.user_detail.nama}</h4>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold uppercase mt-2 tracking-wider border border-gray-200 flex items-center gap-1">
                <Shield size={12} /> {asset.user_detail.role}
              </span>
              
              <div className="w-full mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Mail size={16} className="text-gray-500" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Pribadi</span>
                    <span className="text-sm font-medium text-gray-800 truncate">{asset.user_detail.email}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}