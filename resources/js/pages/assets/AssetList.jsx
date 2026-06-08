import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Plus, Search, Filter, Edit, Trash2, Eye, Download, MapPin, Briefcase, Hash, Upload, ChevronDown, FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function AssetList() {
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk mengontrol Dropdown Import
  const [isImportDropdownOpen, setIsImportDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user } = useAuthStore();

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
    
    // Fungsi untuk menutup dropdown jika user klik di luar area dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsImportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = () => {
    if (assets.length === 0) return alert("Tidak ada data untuk di-export.");
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Kode Aset,Nama Aset,S/N,No Rangka,No Unik Lain,Kategori,Departemen,Lokasi,Vendor,Harga,Tanggal Beli,Kondisi,Status\n";
    
    assets.forEach(row => {
      const harga = row.harga_perolehan || 0;
      const kategori = row.kategori || '-';
      const departemen = row.departemen || '-';
      const lokasi = row.lokasi || '-';
      const vendor = row.vendor || '-';

      const csvRow = `"${row.kode_aset}","${row.nama_aset}","${row.nomor_seri || '-'}","${row.nomor_rangka_mesin || '-'}","${row.nomor_unique_lain || '-'}","${kategori}","${departemen}","${lokasi}","${vendor}","${harga}","${row.tanggal_pembelian}","${row.kondisi}","${row.status}"`;
      csvContent += csvRow + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Asset_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fungsi untuk mendownload template langsung dari API Laravel
  const handleDownloadTemplate = async () => {
    setIsImportDropdownOpen(false);
    
    try {
      // Panggil API dengan config 'blob' karena kita menerima file, bukan JSON
      const response = await axiosInstance.get('/assets/template/download', {
        responseType: 'blob', 
      });

      // Ubah data blob menjadi URL objek sementara di browser
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Nama file saat disimpan di laptop/HP
      link.setAttribute('download', 'template_import_aset.csv'); 
      document.body.appendChild(link);
      link.click();
      
      // Bersihkan URL sementara dari memori
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error mendownload template:', error);
      alert('Gagal mengunduh template. Pastikan Anda memiliki akses akses (Admin).');
    }
  };

  const handleImportClick = () => {
    setIsImportDropdownOpen(false);
    document.getElementById('import-file').click();
  };

  // Fungsi SEBENARNYA untuk mengirim file CSV ke Laravel
  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/assets/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(response.data.message || "Data berhasil di-import!");
      fetchAssets(); // Refresh daftar aset setelah import sukses
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan saat meng-import data.');
      console.error(error.response?.data?.error);
    } finally {
      setIsLoading(false);
      e.target.value = null; // Reset input file
    }
  };

  const handleDelete = async (id, nama_aset) => {
    if (!window.confirm(`Yakin ingin menghapus aset "${nama_aset}"? Aset akan dipindahkan ke keranjang sampah (Soft Delete).`)) return;

    try {
      await axiosInstance.delete(`/assets/${id}`);
      fetchAssets(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.');
    }
  };

  const filteredAssets = assets.filter(asset => {
    const term = searchTerm.toLowerCase();
    const deptName = (asset.departemen || '').toLowerCase();
    const catName = (asset.kategori || '').toLowerCase();

    return asset.nama_aset?.toLowerCase().includes(term) ||
           asset.kode_aset?.toLowerCase().includes(term) ||
           catName.includes(term) ||
           asset.nomor_seri?.toLowerCase().includes(term) ||
           deptName.includes(term);
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'aktif': return 'bg-green-50 text-green-700 border-green-200';
      case 'tidak_aktif': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'dalam_perbaikan': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'disposal': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

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
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Daftar Aset</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Kelola dan pantau seluruh inventaris perusahaan.</p>
        </div>
        
        {user?.role !== 'staff' && (
          <div className="flex items-center gap-3">
            <input type="file" id="import-file" className="hidden" accept=".csv, .txt" onChange={handleFileImport} />
            
            {/* DROPDOWN IMPORT & TEMPLATE */}
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button 
                onClick={() => setIsImportDropdownOpen(!isImportDropdownOpen)} 
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
              >
                <Upload size={18} /> Import <ChevronDown size={16} />
              </button>

              {isImportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden">
                  <button 
                    onClick={handleDownloadTemplate} 
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary flex items-center gap-2 transition-colors border-b border-gray-50"
                  >
                    <FileSpreadsheet size={16} /> Unduh Template CSV
                  </button>
                  <button 
                    onClick={handleImportClick} 
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary flex items-center gap-2 transition-colors"
                  >
                    <Upload size={16} /> Unggah File CSV
                  </button>
                </div>
              )}
            </div>

            <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
              <Download size={18} /> Export CSV
            </button>

            <Link to="/assets/create" className="flex items-center justify-center gap-2 bg-primary hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
              <Plus size={18} /> Tambah Aset
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col w-full overflow-hidden">
        
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-3 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama, kode, S/N, atau departemen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
            <Filter size={16} /> Filter Lanjutan
          </button>
        </div>

        <div className="w-full overflow-x-auto pb-2 min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 min-w-[1000px]">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Info Aset & S/N</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Dept & Lokasi</th>
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
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <Box className="text-gray-400 w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{asset.nama_aset}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{asset.kode_aset}</p>
                          {asset.nomor_seri && (
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                              <Hash size={10}/> SN: {asset.nomor_seri}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800 flex items-center gap-1.5 mb-1">
                        <Briefcase size={14} className="text-primary"/> {asset.departemen || '-'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin size={14} /> {asset.lokasi || '-'}
                      </p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800">
                        Rp {new Intl.NumberFormat('id-ID').format(asset.harga_perolehan)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{asset.tanggal_pembelian}</p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider ${getKondisiBadge(asset.kondisi)}`}>
                        {asset.kondisi?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider ${getStatusBadge(asset.status)}`}>
                        {asset.status?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <Link to={`/assets/${asset.id}`} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Detail">
                          <Eye size={18} />
                        </Link>
                        
                        {user?.role !== 'staff' && (
                          <>
                            <Link to={`/assets/${asset.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                              <Edit size={18} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(asset.id, asset.nama_aset)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
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