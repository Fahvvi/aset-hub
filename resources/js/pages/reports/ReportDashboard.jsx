import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, TrendingDown, Download, Search, FileSpreadsheet 
} from 'lucide-react';
import axiosInstance from '../../api/axios';

export default function ReportDashboard() {
  const [activeTab, setActiveTab] = useState('usage');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'usage', label: 'Penggunaan Aset', icon: BarChart3, endpoint: '/reports/usage' },
    { id: 'history', label: 'Histori Pemegang', icon: Users, endpoint: '/reports/holders-history' },
    { id: 'depreciation', label: 'Nilai & Penyusutan', icon: TrendingDown, endpoint: '/reports/depreciation' },
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const currentTab = tabs.find(t => t.id === activeTab);
      const response = await axiosInstance.get(currentTab.endpoint);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSearchTerm('');
  }, [activeTab]);

  const filteredData = data.filter(item => 
    item.nama_aset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kode_aset?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi Export ke CSV
  const handleExport = () => {
    if (data.length === 0) return alert("Tidak ada data untuk di-export.");
    
    const headers = Object.keys(data[0]);
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.map(h => h.toUpperCase().replace(/_/g, ' ')).join(",") + "\n";
    
    data.forEach(row => {
      const csvRow = headers.map(header => `"${row[header] || ''}"`).join(",");
      csvContent += csvRow + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    const formatRupiah = (angka) => {
        const validNumber = Number(angka) || 0;
        return `Rp ${new Intl.NumberFormat('id-ID').format(validNumber)}`;
    };

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-full overflow-hidden relative pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Pusat Laporan</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Pantau analitik, histori, dan depresiasi aset perusahaan.</p>
        </div>
        <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap">
          <FileSpreadsheet size={18} />
          Export ke Excel / CSV
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col w-full overflow-hidden">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide bg-gray-50/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar Search */}
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Cari nama atau kode aset di laporan ini..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="w-full overflow-x-auto pb-2 min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 min-w-[900px]">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
              <tr>
                {activeTab === 'usage' && (
                  <>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Aset</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Penanggung Jawab</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Lokasi</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Status & Kondisi</th>
                  </>
                )}
                {activeTab === 'history' && (
                  <>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Aset</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Tanggal Mutasi</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Dari (Lama)</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Ke (Baru)</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Alasan</th>
                  </>
                )}
                {activeTab === 'depreciation' && (
                  <>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Aset</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Harga Awal</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Akumulasi Susut</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Nilai Buku Saat Ini</th>
                    <th className="px-5 py-4 font-semibold whitespace-nowrap">Update Terakhir</th>
                  </>
                )}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-gray-400">Menyusun laporan...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-gray-400">Data laporan kosong.</td></tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50/20 transition-colors group">
                    
                    {/* Render Baris untuk Tab Penggunaan */}
                    {activeTab === 'usage' && (
                      <>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-semibold text-gray-800">{item.nama_aset}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.kode_aset}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap font-medium text-primary">{item.penanggung_jawab}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-700">{item.lokasi}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="uppercase text-xs font-bold text-gray-600 mr-2 border-r pr-2">{item.status?.replace('_', ' ')}</span>
                          <span className="uppercase text-xs font-semibold text-gray-500">{item.kondisi?.replace('_', ' ')}</span>
                        </td>
                      </>
                    )}

                    {/* Render Baris untuk Tab Histori */}
                    {activeTab === 'history' && (
                      <>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-semibold text-gray-800">{item.nama_aset}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.kode_aset}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">{item.tanggal_pindah}</td>
                        <td className="px-5 py-4 whitespace-nowrap bg-red-50/30">
                          <p className="text-sm font-semibold text-red-800">{item.pemegang_lama}</p>
                          <p className="text-[10px] text-red-600 uppercase mt-0.5">{item.dari_lokasi}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap bg-green-50/30">
                          <p className="text-sm font-semibold text-green-800">{item.pemegang_baru}</p>
                          <p className="text-[10px] text-green-600 uppercase mt-0.5">{item.ke_lokasi}</p>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-600 truncate max-w-[200px]" title={item.alasan}>{item.alasan}</td>
                      </>
                    )}

                    {/* Render Baris untuk Tab Penyusutan */}
                    {activeTab === 'depreciation' && (
                      <>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="font-semibold text-gray-800">{item.nama_aset}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.kode_aset}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-600">{formatRupiah(item.harga_perolehan)}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-red-600 font-medium">- {formatRupiah(item.akumulasi_penyusutan)}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-green-700 font-bold text-base">{formatRupiah(item.nilai_buku_sekarang)}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-gray-500">{item.periode_terakhir}</td>
                      </>
                    )}

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