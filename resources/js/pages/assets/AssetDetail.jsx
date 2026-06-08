import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Edit, Box, MapPin, Calendar, Image as ImageIcon, 
  User, Mail, Shield, X, Briefcase, Hash, Barcode, Printer, QrCode, 
  Wrench, History, CheckCircle, Clock, ArrowRightLeft
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; 
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

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-4 md:p-8 text-center text-gray-500">Memuat data aset...</div>;
  if (!asset) return <div className="p-4 md:p-8 text-center text-red-500">Aset tidak ditemukan.</div>;

  const namaKategori = asset.kategori || asset.category?.nama_kategori || '-';
  const namaLokasi = asset.lokasi || asset.location?.nama_lokasi || '-';
  const namaDepartemen = asset.departemen || asset.department?.nama_departemen || 'Belum Dialokasikan';
  const namaVendor = asset.vendor || asset.vendor_detail?.nama_vendor || '-';

  const scanUrl = `${window.location.origin}/scan/${asset.kode_aset}`;

  // Helper Badge untuk Riwayat Maintenance
  const getMaintenanceBadge = (status) => {
    if (status === 'selesai') return <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Selesai</span>;
    if (status === 'dibatalkan') return <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Batal</span>;
    return <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Proses</span>;
  };

  return (
    <>
      {/* CSS SAKTI UNTUK MEMAKSA BROWSER HANYA MENYETAK ID "print-label" */}
      <style type="text/css" media="print">
        {`
          @page { size: auto; margin: 0; }
          body * { visibility: hidden; }
          #printable-label, #printable-label * { visibility: visible; }
          #printable-label { 
            position: absolute; 
            left: 50%; 
            top: 50%; 
            transform: translate(-50%, -50%); 
            width: 350px !important;
          }
        `}
      </style>

      {/* ===================================================================== */}
      {/* 1. TAMPILAN KHUSUS UNTUK PRINT */}
      {/* ===================================================================== */}
      <div id="printable-label" className="hidden print:flex flex-col items-center justify-center bg-white p-6 rounded-2xl border-4 border-black">
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

      {/* ===================================================================== */}
      {/* 2. TAMPILAN NORMAL */}
      {/* ===================================================================== */}
      <div className="print:hidden flex flex-col gap-4 md:gap-6 w-full max-w-5xl mx-auto pb-8 md:pb-10 px-2 md:px-0">
        
        {/* Header */}
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
            <button onClick={handlePrint} className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto">
              <Printer size={16} /> Print Label
            </button>

            {user?.role !== 'staff' && (
              <Link to={`/assets/${asset.id}/edit`} className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto">
                <Edit size={16} /> Edit Aset
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Kolom Kiri: Info Utama & Riwayat */}
          <div className="lg:col-span-2 flex flex-col gap-4 md:gap-6">
            
            {/* Informasi Dasar */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 border-b pb-3 mb-4 md:mb-5">Informasi Dasar & Identitas Aset</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 md:gap-y-5 gap-x-6">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Kategori</p>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 break-words"><Box size={16} className="text-gray-400 shrink-0"/> {namaKategori}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Departemen / Divisi</p>
                  <p className="text-sm font-semibold text-primary flex items-center gap-2 break-words"><Briefcase size={16} className="text-primary shrink-0"/> {namaDepartemen}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Lokasi Aset</p>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 break-words"><MapPin size={16} className="text-gray-400 shrink-0"/> {namaLokasi}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Nomor Seri (S/N)</p>
                  <p className="text-sm font-semibold text-gray-800 font-mono flex items-center gap-2 break-all"><Barcode size={16} className="text-gray-400 shrink-0"/> {asset.nomor_seri || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Vendor / Supplier</p>
                  <p className="text-sm font-semibold text-gray-800 break-words">{namaVendor}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Digunakan Oleh</p>
                  {asset.user_detail ? (
                    <button onClick={() => setShowUserModal(true)} className="text-sm font-semibold text-primary hover:text-indigo-700 hover:underline flex items-center gap-1.5 transition-colors text-left">
                      <User size={15} className="shrink-0" />
                      <span className="truncate">{asset.penanggung_jawab}</span>
                    </button>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <User size={15} className="text-gray-400 shrink-0" />
                      <span className="truncate">{asset.penanggung_jawab || 'Belum Ada Penanggung Jawab'}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SEKSI BARU: Riwayat Pengguna / Mutasi */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-indigo-600"/> Riwayat Pemindahan & Pengguna
              </h3>
              
              <div className="overflow-x-auto">
                {asset.transfers && asset.transfers.length > 0 ? (
                  <table className="w-full text-left text-sm text-gray-600 min-w-[500px]">
                    <thead className="text-xs text-gray-500 bg-gray-50 border-y border-gray-200 uppercase">
                      <tr>
                        <th className="py-3 px-3 font-semibold">Tgl Pindah</th>
                        <th className="py-3 px-3 font-semibold">Dari Lokasi</th>
                        <th className="py-3 px-3 font-semibold">Ke Lokasi</th>
                        <th className="py-3 px-3 font-semibold">Pengguna Baru</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {asset.transfers.map((trf) => (
                        <tr key={trf.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-3">{trf.tanggal_transfer}</td>
                          <td className="py-3 px-3 text-red-600 font-medium">{trf.dari_lokasi?.nama_lokasi || trf.dariLokasi?.nama_lokasi || '-'}</td>
                          <td className="py-3 px-3 text-green-600 font-medium">{trf.ke_lokasi?.nama_lokasi || trf.keLokasi?.nama_lokasi || '-'}</td>
                          <td className="py-3 px-3">{trf.ke_user?.nama || trf.keUser?.nama || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6 flex flex-col items-center gap-2">
                    <History size={24} className="text-gray-300"/> Belum ada riwayat mutasi.
                  </p>
                )}
              </div>
            </div>

            {/* SEKSI BARU: Riwayat Maintenance */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
                <Wrench size={18} className="text-orange-500"/> Riwayat Pemeliharaan
              </h3>
              
              <div className="flex flex-col gap-3">
                {asset.maintenances && asset.maintenances.length > 0 ? (
                  asset.maintenances.map((mtn) => (
                    <div key={mtn.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 hover:bg-white transition-colors flex flex-col sm:flex-row justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-800">{mtn.kode_maintenance}</span>
                          {getMaintenanceBadge(mtn.status)}
                        </div>
                        <p className="text-xs text-gray-600 font-medium">Masalah: {mtn.deskripsi_kerusakan}</p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Briefcase size={12}/> Vendor: {mtn.vendor?.nama_vendor || '-'}
                        </p>
                      </div>
                      <div className="text-left sm:text-right flex flex-col justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1 sm:justify-end">
                          <Calendar size={12}/> {mtn.tanggal_laporan}
                        </span>
                        {mtn.biaya_perbaikan > 0 && (
                          <span className="text-sm font-bold text-gray-800 mt-2">
                            Rp {new Intl.NumberFormat('id-ID').format(mtn.biaya_perbaikan)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6 flex flex-col items-center gap-2">
                    <CheckCircle size={24} className="text-gray-300"/> Aset belum pernah mengalami kerusakan/perbaikan.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Foto, QR & Finansial */}
          <div className="flex flex-col gap-4 md:gap-6">
            
            {/* BOX QR CODE */}
            <div className="bg-indigo-50 p-5 md:p-6 rounded-xl border border-indigo-100 shadow-sm flex flex-col items-center justify-center">
              <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><QrCode size={18}/> Label QR Code</h3>
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-200">
                <QRCodeSVG value={scanUrl} size={120} level="H" includeMargin={true} />
              </div>
            </div>

            {/* FOTO */}
            <div className="bg-white p-2 md:p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[180px] bg-gray-50/30">
              {asset.foto_url ? (
                <img src={asset.foto_url} alt={asset.nama_aset} className="w-full h-40 object-cover rounded-lg border border-gray-100" />
              ) : (
                <div className="flex flex-col items-center text-gray-300 py-6">
                  <ImageIcon size={40} className="mb-2" />
                  <span className="text-xs font-medium">Tidak ada foto</span>
                </div>
              )}
            </div>

            {/* DATA FINANSIAL */}
            <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-800 border-b pb-3 mb-4">Data Finansial</h3>
              <div className="flex flex-col gap-3 md:gap-4">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">Harga Perolehan</p>
                  <p className="text-base md:text-lg font-bold text-gray-800 break-words">Rp {new Intl.NumberFormat('id-ID').format(asset.harga_perolehan)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1"><Calendar size={12}/> Tgl Beli</p>
                    <p className="text-xs font-semibold text-gray-800">{asset.tanggal_pembelian}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1"><Calendar size={12}/> Tgl Aktif</p>
                    <p className="text-xs font-semibold text-gray-800">{asset.tanggal_aktif}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- MODAL PROFIL USER --- */}
      {showUserModal && asset.user_detail && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><User size={16} className="text-primary" /> Profil Pengguna</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="h-16 w-16 bg-blue-100 text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-3">
                {asset.user_detail.nama.charAt(0).toUpperCase()}
              </div>
              <h4 className="text-lg font-bold text-gray-800 text-center">{asset.user_detail.nama}</h4>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase mt-2 border flex items-center gap-1">
                <Shield size={12} /> {asset.user_detail.role}
              </span>
              <div className="w-full mt-5 flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                  <Mail size={16} className="text-gray-500" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Email Pribadi</span>
                    <span className="text-xs font-medium text-gray-800 truncate">{asset.user_detail.email}</span>
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