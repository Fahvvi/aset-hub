import React, { useState, useEffect } from 'react';
import { 
  Box, Plus, Search, Filter, Edit, Trash2, Eye, Download, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data dari API backend
  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/assets');
      setAssets(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleExport = () => {
    if (assets.length === 0) return alert("Tidak ada data untuk di-export.");
    
    // Header CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Kode Aset,Nama Aset,Kategori,Lokasi,Vendor,Harga,Tanggal Beli,Kondisi,Status\n";
    
    // Looping data
    assets.forEach(row => {
      const harga = row.harga_perolehan || 0;
      const csvRow = `"${row.kode_aset}","${row.nama_aset}","${row.kategori}","${row.lokasi}","${row.vendor || '-'}","${harga}","${row.tanggal_pembelian}","${row.kondisi}","${row.status}"`;
      csvContent += csvRow + "\n";
    });

    // Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Asset_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Fungsi Import (Frontend Placeholder) ---
  const handleImportClick = () => {
    document.getElementById('import-file').click();
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Di sini nantinya Anda memanggil endpoint backend POST /api/v1/assets/import
    alert(`File "${file.name}" siap diunggah! \nPastikan format kolom sesuai dengan template standar sistem SDI.`);
    e.target.value = null; // Reset input
  };


  // Fungsi Hapus Aset
  const handleDelete = async (id, nama_aset) => {
    if (!window.confirm(`Yakin ingin menghapus aset "${nama_aset}"? Aset akan dipindahkan ke keranjang sampah (Soft Delete).`)) return;

    try {
      await axiosInstance.delete(`/assets/${id}`);
      fetchAssets(); // Refresh data setelah berhasil
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.');
    }
  };

  // Filter pencarian
  const filteredAssets = assets.filter(asset => 
    asset.nama_aset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.kode_aset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.kategori?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper untuk warna badge status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'aktif': return 'bg-green-50 text-green-700 border-green-200';
      case 'tidak_aktif': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'dalam_perbaikan': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'disposal': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Helper untuk warna kondisi
  const getKondisiBadge = (kondisi) => {
    switch(kondisi) {
      case 'baik': return 'text-green-600 bg-green-50';
      case 'rusak_ringan': return 'text-orange-600 bg-orange-50';
      case 'rusak_berat': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-full overflow-hidden relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Daftar Aset</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Kelola dan pantau seluruh inventaris perusahaan.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Hidden input file untuk import */}
          <input type="file" id="import-file" className="hidden" accept=".csv, .xlsx, .xls" onChange={handleFileImport} />
          
          <button onClick={handleImportClick} className="hidden sm:flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
            Import
          </button>

          <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
            <Download size={18} />
            Export CSV
          </button>

          <Link to="/assets/create" className="flex items-center justify-center gap-2 bg-primary hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
            <Plus size={18} />
            Tambah Aset
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col w-full overflow-hidden">
        
        {/* Toolbar (Search & Filter) */}
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-3 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama, kode, atau kategori aset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
            <Filter size={16} />
            Filter Lanjutan
          </button>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto pb-2 min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 min-w-[1000px]">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Info Aset</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Kategori & Lokasi</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Harga & Tgl Beli</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Kondisi</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-5 py-4 font-semibold text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-gray-400">Memuat data aset...</td></tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center flex flex-col items-center justify-center text-gray-400">
                    <Box size={48} className="mb-3 text-gray-300" />
                    <p>Tidak ada aset yang ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-blue-50/30 transition-colors group">
                    
                    {/* Kolom Info Aset */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          {/* Jika ada relasi foto, bisa ditampilkan img src di sini nanti */}
                          <Box className="text-gray-400 w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{asset.nama_aset}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{asset.kode_aset}</p>
                        </div>
                      </div>
                    </td>

                    {/* Kolom Kategori & Lokasi */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800">{asset.kategori}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} /> {asset.lokasi}
                      </p>
                    </td>

                    {/* Kolom Harga & Tanggal */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800">
                        Rp {new Intl.NumberFormat('id-ID').format(asset.harga_perolehan)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{asset.tanggal_pembelian}</p>
                    </td>

                    {/* Kolom Kondisi */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider ${getKondisiBadge(asset.kondisi)}`}>
                        {asset.kondisi?.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Kolom Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider ${getStatusBadge(asset.status)}`}>
                        {asset.status?.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Kolom Aksi */}
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Link to={`/assets/${asset.id}`} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Detail">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/assets/${asset.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                          <Edit size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(asset.id, asset.nama_aset)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}