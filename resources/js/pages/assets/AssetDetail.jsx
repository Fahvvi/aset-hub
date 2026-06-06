import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit, Box, MapPin, Calendar, Image as ImageIcon, 
  User, Mail, Shield, X, Briefcase, Hash, Barcode, Printer, QrCode
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; // <-- LIBRARY QR CODE
import axiosInstance from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function AssetDetail() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuthStore();
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

  // Fungsi untuk memicu dialog print browser
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-4 md:p-8 text-center text-gray-500">Memuat data aset...</div>;
  if (!asset) return <div className="p-4 md:p-8 text-center text-red-500">Aset tidak ditemukan.</div>;

  // Keamanan ganda untuk menarik data relasi
  const namaKategori = asset.kategori || asset.category?.nama_kategori || '-';
  const namaLokasi = asset.lokasi || asset.location?.nama_lokasi || '-';
  const namaDepartemen = asset.departemen || asset.department?.nama_departemen || 'Belum Dialokasikan';
  const namaVendor = asset.vendor || asset.vendor_detail?.nama_vendor || '-';

  // URL Target saat QR di-scan
  const scanUrl = `${window.location.origin}/scan/${asset.kode_aset}`;

  return (
    <>
      {/* ===================================================================== */}
      {/* 1. TAMPILAN KHUSUS UNTUK PRINT (TIDAK TERLIHAT DI LAYAR NORMAL) */}
      {/* ===================================================================== */}
      <div className="hidden print:flex flex-col items-center justify-center w-full bg-white h-screen">
        <div className="border-4 border-black p-6 rounded-2xl flex flex-col items-center w-[350px] bg-white">
          <div className="text-center border-b-2 border-black w-full pb-3 mb-4">
            <h2 className="font-extrabold text-2xl tracking-widest uppercase">PT SDI</h2>
            <p className="font-semibold text-sm">ASSET MANAGEMENT</p>
          </div>
          
          <QRCodeSVG value={scanUrl} size={160} level="H" includeMargin={true} />
          
          <div className="mt-4 text-center w-full">
            <p className="font-bold text-xl mb-1">{asset.kode_aset}</p>
            <p className="font-semibold text-sm truncate uppercase">{asset.nama_aset}</p>
            <p className="text-xs mt-1 border-t border-dashed border-gray-400 pt-2 uppercase">
              {namaDepartemen}
            </p>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. TAMPILAN NORMAL (TIDAK IKUT TERCETAK SAAT DI-PRINT) */}
      {/* ===================================================================== */}
      <div className="print:hidden flex flex-col gap-4 md:gap-6 w-full max-w-5xl mx-auto pb-8 md:pb-10 px-2 md:px-0">
        
        {/* Header - Responsif untuk HP */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sm:bg-transparent sm:p-0 sm:border-none sm:shadow-none">
          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/assets" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shrink-0">
              <ArrowLeft size={20} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{asset.nama_aset}</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5 font-mono">{asset.kode_aset}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Tombol Print */}
            <button 
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              <Printer size={16} /> Print Label
            </button>

            {user?.role !== 'staff' && (
              <Link 
                to={`/assets/${asset.id}/edit`} 
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto"
              >
                <Edit size={16} /> Edit Aset
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Kolom Kiri: Info Utama */}
          <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 border-b pb-3 mb-4 md:mb-5">Informasi Dasar & Identitas Aset</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 md:gap-y-5 gap-x-6">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Kategori</p>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 break-words"><Box size={16} className="text-gray-400 shrink-0"/> {namaKategori}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Departemen / Divisi</p>
                  <p className="text-sm font-semibold text-primary flex items-center gap-2 break-words">
                    <Briefcase size={16} className="text-primary shrink-0"/> {namaDepartemen}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Lokasi Aset</p>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 break-words"><MapPin size={16} className="text-gray-400 shrink-0"/> {namaLokasi}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Nomor Seri (S/N)</p>
                  <p className="text-sm font-semibold text-gray-800 font-mono flex items-center gap-2 break-all">
                    <Barcode size={16} className="text-gray-400 shrink-0"/> {asset.nomor_seri || '-'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Nomor Rangka / Mesin</p>
                  <p className="text-sm font-semibold text-gray-800 font-mono flex items-center gap-2 break-all">
                    <Hash size={16} className="text-gray-400 shrink-0"/> {asset.nomor_rangka_mesin || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Nomor Unik Lainnya</p>
                  <p className="text-sm font-semibold text-gray-800 font-mono flex items-center gap-2 break-all">
                    <Hash size={16} className="text-gray-400 shrink-0"/> {asset.nomor_unique_lain || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Vendor / Supplier</p>
                  <p className="text-sm font-semibold text-gray-800 break-words">{namaVendor}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Digunakan Oleh</p>
                  {asset.user_detail ? (
                    <button 
                      onClick={() => setShowUserModal(true)}
                      className="text-sm font-semibold text-primary hover:text-indigo-700 hover:underline flex items-center gap-1.5 transition-colors text-left"
                    >
                      <User size={15} className="shrink-0" />
                      <span className="truncate">{asset.penanggung_jawab}</span>
                    </button>
                  ) : asset.penanggung_jawab ? (
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <User size={15} className="text-gray-400 shrink-0" />
                      <span className="truncate">{asset.penanggung_jawab}</span>
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">Belum Ada Penanggung Jawab</p>
                  )}
                </div>

              </div>
              
              <h3 className="font-bold text-gray-800 border-b pb-3 mb-3 mt-6 md:mt-8">Catatan / Keterangan</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-100 whitespace-pre-line break-words">
                {asset.keterangan || 'Tidak ada catatan tambahan untuk aset ini.'}
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Foto, QR & Status */}
          <div className="flex flex-col gap-4 md:gap-6">
            
            {/* BOX QR CODE */}
            <div className="bg-indigo-50 p-5 md:p-6 rounded-xl border border-indigo-100 shadow-sm flex flex-col items-center justify-center">
              <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><QrCode size={18}/> Label QR Code</h3>
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200">
                <QRCodeSVG value={scanUrl} size={120} level="H" includeMargin={true} />
              </div>
              <p className="text-[11px] text-center text-indigo-600 mt-3 px-2">
                Scan kode ini untuk melihat detail aset secara cepat via Smartphone.
              </p>
            </div>

            <div className="bg-white p-2 md:p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[180px] md:min-h-[220px] overflow-hidden bg-gray-50/30">
              {asset.foto_url ? (
                <img 
                  src={asset.foto_url} 
                  alt={asset.nama_aset} 
                  className="w-full h-40 md:h-48 object-cover rounded-lg border border-gray-100 shadow-sm bg-white"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.className = "hidden";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300 py-6">
                  <ImageIcon size={40} className="mb-2 text-gray-300" />
                  <span className="text-xs text-gray-400 font-medium">Tidak ada foto aset</span>
                </div>
              )}
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Status Aset</h3>
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`px-2.5 py-1 text-[10px] md:text-xs font-bold rounded-full border uppercase ${
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

            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Data Finansial</h3>
              <div className="flex flex-col gap-3 md:gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Harga Perolehan</p>
                  <p className="text-base md:text-lg font-bold text-gray-800 break-words">Rp {new Intl.NumberFormat('id-ID').format(asset.harga_perolehan)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 mt-1 md:mt-2">
                  <div>
                    <p className="text-[10px] md:text-xs text-gray-400 font-medium mb-1 flex items-center gap-1"><Calendar size={12}/> Tgl Beli</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-800">{asset.tanggal_pembelian}</p>
                  </div>
                  <div>
                    <p className="text-[10px] md:text-xs text-gray-400 font-medium mb-1 flex items-center gap-1"><Calendar size={12}/> Tgl Aktif</p>
                    <p className="text-xs md:text-sm font-semibold text-gray-800">{asset.tanggal_aktif}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- MODAL PROFIL USER --- */}
      {showUserModal && asset.user_detail && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity print:hidden">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all animate-slide-up sm:animate-none">
            
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <User size={16} className="text-primary" /> Profil Pengguna
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              <div className="h-16 w-16 md:h-20 md:w-20 bg-blue-100 text-primary rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold mb-3 md:mb-4 shadow-inner">
                {asset.user_detail.nama.charAt(0).toUpperCase()}
              </div>
              
              <h4 className="text-lg md:text-xl font-bold text-gray-800 text-center">{asset.user_detail.nama}</h4>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] md:text-[11px] font-bold uppercase mt-2 tracking-wider border border-gray-200 flex items-center gap-1">
                <Shield size={12} /> {asset.user_detail.role}
              </span>
              
              <div className="w-full mt-5 md:mt-6 flex flex-col gap-3 pb-4 sm:pb-0">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                    <Mail size={16} className="text-gray-500" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Email Pribadi</span>
                    <span className="text-xs md:text-sm font-medium text-gray-800 truncate">{asset.user_detail.email}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </>
  );
}