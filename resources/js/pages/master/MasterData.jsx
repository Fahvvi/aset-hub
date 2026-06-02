import React, { useState, useEffect } from 'react';
import { 
  FolderTree, MapPin, Building2, Plus, 
  Search, Edit, Trash2, X, AlertCircle
} from 'lucide-react';
import axiosInstance from '../../api/axios';

export default function MasterData() {
  const [activeTab, setActiveTab] = useState('kategori');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' atau 'edit'
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Konfigurasi Tabs
  const tabs = [
    { id: 'kategori', label: 'Kategori Aset', icon: FolderTree, endpoint: '/categories' },
    { id: 'lokasi', label: 'Lokasi & Ruangan', icon: MapPin, endpoint: '/locations' },
    { id: 'vendor', label: 'Vendor / Supplier', icon: Building2, endpoint: '/vendors' },
  ];

  // --- FUNGSI FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const currentTab = tabs.find(t => t.id === activeTab);
      const response = await axiosInstance.get(currentTab.endpoint);
      setData(response.data.data || response.data); 
    } catch (error) {
      console.error('Error fetching master data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setSearchTerm('');
  }, [activeTab]);

  // --- KONFIGURASI FORM DINAMIS BERSARKAN TAB ---
  const getFormFields = () => {
    if (activeTab === 'kategori') {
      return [
        { name: 'kode_kategori', label: 'Kode Kategori', type: 'text', required: true, placeholder: 'Contoh: ELK' },
        { name: 'nama_kategori', label: 'Nama Kategori', type: 'text', required: true, placeholder: 'Contoh: Elektronik' },
        { name: 'metode_penyusutan', label: 'Metode Penyusutan', type: 'select', required: true, options: [
            { value: 'straight_line', label: 'Garis Lurus (Straight Line)' },
            { value: 'declining_balance', label: 'Saldo Menurun (Declining Balance)' }
        ]},
        { name: 'umur_ekonomis_tahun', label: 'Umur Ekonomis (Tahun)', type: 'number', required: true },
        { name: 'nilai_sisa_persen', label: 'Nilai Sisa (%)', type: 'number', required: true, step: '0.01' },
        { name: 'deskripsi', label: 'Deskripsi', type: 'textarea' },
      ];
    }
    if (activeTab === 'lokasi') {
      return [
        { name: 'kode_lokasi', label: 'Kode Lokasi', type: 'text', required: true, placeholder: 'Contoh: GD-A-101' },
        { name: 'nama_lokasi', label: 'Nama Ruangan/Lokasi', type: 'text', required: true },
        { name: 'gedung', label: 'Nama Gedung', type: 'text' },
        { name: 'lantai', label: 'Lantai', type: 'text' },
        { name: 'deskripsi', label: 'Deskripsi', type: 'textarea' },
      ];
    }
    if (activeTab === 'vendor') {
      return [
        { name: 'kode_vendor', label: 'Kode Vendor', type: 'text', required: true },
        { name: 'nama_vendor', label: 'Nama Vendor/Perusahaan', type: 'text', required: true },
        { name: 'kontak_person', label: 'Kontak Person', type: 'text' },
        { name: 'telepon', label: 'Telepon', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'alamat', label: 'Alamat Lengkap', type: 'textarea' },
      ];
    }
    return [];
  };

  // --- FUNGSI HANDLE MODAL & INPUT ---
  const openModal = (mode, item = null) => {
    setFormError('');
    setModalMode(mode);
    setIsModalOpen(true);
    if (mode === 'edit' && item) {
      setSelectedId(item.id);
      setFormData({ ...item }); 
    } else {
      setSelectedId(null);
      if(activeTab === 'kategori') setFormData({ metode_penyusutan: 'straight_line', umur_ekonomis_tahun: 4, nilai_sisa_persen: 0 });
      else setFormData({});
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- FUNGSI CRUD KE API ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');
    
    const currentTab = tabs.find(t => t.id === activeTab);
    
    try {
      if (modalMode === 'add') {
        await axiosInstance.post(currentTab.endpoint, formData);
      } else {
        await axiosInstance.put(`${currentTab.endpoint}/${selectedId}`, formData);
      }
      closeModal();
      fetchData(); 
    } catch (error) {
      setFormError(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, nama_item) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${nama_item}"? Data yang sudah dihapus tidak bisa dikembalikan.`)) return;

    const currentTab = tabs.find(t => t.id === activeTab);
    try {
      await axiosInstance.delete(`${currentTab.endpoint}/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus data. Pastikan data ini tidak sedang digunakan di tabel aset.');
    }
  };

  // --- FILTER SEARCH ---
  const filteredData = data.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    if (activeTab === 'kategori') return item.nama_kategori?.toLowerCase().includes(searchStr) || item.kode_kategori?.toLowerCase().includes(searchStr);
    if (activeTab === 'lokasi') return item.nama_lokasi?.toLowerCase().includes(searchStr) || item.kode_lokasi?.toLowerCase().includes(searchStr);
    if (activeTab === 'vendor') return item.nama_vendor?.toLowerCase().includes(searchStr) || item.kode_vendor?.toLowerCase().includes(searchStr);
    return true;
  });

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-full overflow-hidden relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Data Master</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Kelola data referensi untuk kategori, lokasi, dan vendor.</p>
        </div>
        <button 
          onClick={() => openModal('add')}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          Tambah Data
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col w-full overflow-hidden">
        
        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-blue-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar (Search) */}
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={`Cari ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto pb-2">
          <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
            <thead className="text-xs text-gray-500 bg-gray-50/80 uppercase tracking-wider">
              <tr>
                {activeTab === 'kategori' && (
                  <>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Kode</th>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Nama Kategori</th>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Penyusutan</th>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Umur (Thn)</th>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Nilai Sisa</th>
                  </>
                )}
                {activeTab === 'lokasi' && (
                  <>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Kode</th>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Nama Lokasi</th>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Gedung</th>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Lantai</th>
                    <th className="px-5 py-3.5 font-semibold min-w-[200px]">Deskripsi</th>
                  </>
                )}
                {activeTab === 'vendor' && (
                  <>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Kode</th>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Nama Vendor</th>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Kontak</th>
                    <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Telepon</th>
                    <th className="px-5 py-3.5 font-semibold min-w-[200px]">Alamat</th>
                  </>
                )}
                <th className="px-5 py-3.5 font-semibold text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-8 text-center text-gray-400">Tidak ada data ditemukan.</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    {activeTab === 'kategori' && (
                      <>
                        <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">{item.kode_kategori}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{item.nama_kategori}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`px-2.5 py-1 text-[11px] font-medium rounded-md ${
                            item.metode_penyusutan === 'straight_line' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                          }`}>
                            {item.metode_penyusutan === 'straight_line' ? 'Garis Lurus' : 'Saldo Menurun'}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">{item.umur_ekonomis_tahun} Tahun</td>
                        <td className="px-5 py-3 whitespace-nowrap">{item.nilai_sisa_persen}%</td>
                      </>
                    )}
                    {activeTab === 'lokasi' && (
                      <>
                        <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">{item.kode_lokasi}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{item.nama_lokasi}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{item.gedung || '-'}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{item.lantai || '-'}</td>
                        <td className="px-5 py-3 max-w-[200px] truncate" title={item.deskripsi}>{item.deskripsi || '-'}</td>
                      </>
                    )}
                    {activeTab === 'vendor' && (
                      <>
                        <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">{item.kode_vendor}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{item.nama_vendor}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{item.kontak_person || '-'}</td>
                        <td className="px-5 py-3 whitespace-nowrap">{item.telepon || '-'}</td>
                        <td className="px-5 py-3 max-w-[200px] truncate" title={item.alamat}>{item.alamat || '-'}</td>
                      </>
                    )}

                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openModal('edit', item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id, item.nama_kategori || item.nama_lokasi || item.nama_vendor)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
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

      {/* --- MODAL FORM (POPUP) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">
                {modalMode === 'add' ? 'Tambah' : 'Edit'} {tabs.find(t => t.id === activeTab).label}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Form) */}
            <div className="p-6 overflow-y-auto">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              
              <form id="masterForm" onSubmit={handleSubmit} className="space-y-4">
                {getFormFields().map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        required={field.required}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    ) : field.type === 'select' ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                      >
                        <option value="" disabled>Pilih {field.label}</option>
                        {field.options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        step={field.step}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    )}
                  </div>
                ))}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="masterForm"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}