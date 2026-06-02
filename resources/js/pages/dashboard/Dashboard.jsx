import React, { useState, useEffect } from 'react';
import { 
  Box, Activity, Wrench, AlertTriangle, TrendingDown, 
  ArrowRight, Clock, PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axiosInstance.get('/dashboard/summary');
        setSummary(response.data);
      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const formatRupiah = (angka) => `Rp ${new Intl.NumberFormat('id-ID').format(angka || 0)}`;

  if (isLoading) {
    return <div className="flex items-center justify-center h-[70vh] text-gray-400">Memuat data analitik...</div>;
  }

  if (!summary) return null;

  const { metrics, chart_kategori, alerts_maintenance, aset_terbaru } = summary;

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden relative pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Ringkasan Sistem</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Pantau seluruh aktivitas dan status aset perusahaan hari ini.</p>
      </div>

      {/* 4 Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Card 1: Total Aset */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500">Total Aset Aktif</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Box size={20} /></div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{metrics.total_aset} <span className="text-sm font-medium text-gray-400">Unit</span></h2>
            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">Digunakan dalam operasional</p>
          </div>
        </div>

        {/* Card 2: Aset Rusak */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500">Dalam Perbaikan</h3>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Wrench size={20} /></div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{metrics.aset_rusak} <span className="text-sm font-medium text-gray-400">Unit</span></h2>
            <p className="text-xs text-red-500 font-medium mt-1">Membutuhkan perhatian teknisi</p>
          </div>
        </div>

        {/* Card 3: Total Nilai Aset */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500">Nilai Awal (Perolehan)</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Activity size={20} /></div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">{formatRupiah(metrics.total_nilai_aset)}</h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Total harga beli seluruh aset</p>
          </div>
        </div>

        {/* Card 4: Nilai Buku */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500">Estimasi Nilai Buku</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TrendingDown size={20} /></div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">{formatRupiah(metrics.total_nilai_buku)}</h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Setelah dikurangi penyusutan</p>
          </div>
        </div>

      </div>

      {/* Bagian Bawah: Grafik Sederhana & Tabel Ringkasan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Aset per Kategori (Simulasi Bar Chart UI) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">Sebaran Aset Berdasarkan Kategori</h3>
          <div className="flex flex-col gap-4 mt-2 flex-1">
            {chart_kategori.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada data.</p>
            ) : (
              chart_kategori.map((item, idx) => {
                const percentage = Math.round((item.total / metrics.total_aset) * 100) || 0;
                return (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700">{item.name}</span>
                      <span className="text-gray-500">{item.total} Unit ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <Link to="/reports" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline mt-4">
            Lihat Laporan Lengkap <ArrowRight size={16} />
          </Link>
        </div>

        {/* Kolom Tengah: Alert Maintenance */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 lg:col-span-1">
          <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500"/> Menunggu Perbaikan
          </h3>
          <div className="flex flex-col gap-3 mt-2">
            {alerts_maintenance.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Semua aset dalam kondisi baik.</p>
            ) : (
              alerts_maintenance.map((mnt) => (
                <div key={mnt.id} className="p-3 bg-orange-50/50 border border-orange-100 rounded-lg flex flex-col gap-1.5">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold text-gray-800">{mnt.asset?.nama_aset}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full uppercase">{mnt.status}</span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12}/> Dilaporkan: {mnt.requester?.nama || 'Sistem'}
                  </p>
                </div>
              ))
            )}
          </div>
          <Link to="/maintenances" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline mt-auto pt-4">
            Kelola Pemeliharaan <ArrowRight size={16} />
          </Link>
        </div>

        {/* Kolom Kanan: Aset Terbaru */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 lg:col-span-1">
          <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
            <PlusCircle size={18} className="text-green-500"/> Aset Baru Ditambahkan
          </h3>
          <div className="flex flex-col gap-3 mt-2">
            {aset_terbaru.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Belum ada aset baru.</p>
            ) : (
              aset_terbaru.map((aset) => (
                <div key={aset.id} className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex flex-col gap-1">
                  <span className="text-sm font-bold text-gray-800">{aset.nama_aset}</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[11px] font-medium text-gray-500">{aset.category?.nama_kategori}</span>
                    <span className="text-xs font-bold text-green-700">{formatRupiah(aset.harga_perolehan)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link to="/assets" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline mt-auto pt-4">
            Lihat Semua Aset <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
}