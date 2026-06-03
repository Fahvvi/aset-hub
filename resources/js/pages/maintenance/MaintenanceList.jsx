import React, { useState, useEffect } from 'react';
import { 
  Wrench, Plus, Search, Filter, Edit, Trash2, 
  X, AlertCircle, CheckCircle, Clock, XCircle
} from 'lucide-react';
import axiosInstance from '../../api/axios';
import useAuthStore from '../../store/authStore'; // <-- 1. Import Auth Store

export default function MaintenanceList() {
  const [maintenances, setMaintenances] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // <-- 2. Ambil data user saat ini untuk mengecek role-nya
  const { user } = useAuthStore();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [mntRes, astRes, usrRes] = await Promise.all([
        axiosInstance.get('/maintenances'),
        axiosInstance.get('/assets').catch(() => ({ data: [] })),
        axiosInstance.get('/users').catch(() => ({ data: [] }))
      ]);
      setMaintenances(mntRes.data.data || mntRes.data);
      setAssets(astRes.data.data || astRes.data);
      setUsers(usrRes.data.data || usrRes.data);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (mode, item = null) => {
    setFormError('');
    setModalMode(mode);
    setIsModalOpen(true);
    
    if (mode === 'edit' && item) {
      setSelectedId(item.id);
      setFormData({
        status: item.status || 'pending',
        handled_by: item.handled_by || '',
        tanggal_mulai: item.tanggal_mulai || '',
        tanggal_selesai: item.tanggal_selesai || '',
        tindakan_perbaikan: item.tindakan_perbaikan || '',
        biaya_perbaikan: item.biaya_perbaikan || '',
        asset_nama: item.asset?.nama_aset,
        kode_mnt: item.kode_maintenance
      });
    } else {
      setSelectedId(null);
      setFormData({
        asset_id: '',
        tipe: 'korektif',
        tanggal_laporan: new Date().toISOString().split('T')[0],
        deskripsi_kerusakan: '',
        keterangan: ''
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');
    
    try {
      if (modalMode === 'add') {
        await axiosInstance.post('/maintenances', formData);
      } else {
        await axiosInstance.put(`/maintenances/${selectedId}`, formData);
      }
      closeModal();
      fetchData(); 
    } catch (error) {
      setFormError(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, kode) => {
    if (!window.confirm(`Yakin ingin menghapus riwayat pemeliharaan ${kode}?`)) return;
    try {
      await axiosInstance.delete(`/maintenances/${id}`);
      fetchData();
    } catch (error) {
      alert('Gagal menghapus data.');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'selesai': return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-green-50 text-green-700 rounded-full border border-green-200 uppercase"><CheckCircle size={12}/> Selesai</span>;
      case 'diproses': return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200 uppercase"><Wrench size={12}/> Diproses</span>;
      case 'dibatalkan': return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-red-50 text-red-700 rounded-full border border-red-200 uppercase"><XCircle size={12}/> Dibatalkan</span>;
      default: return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-orange-50 text-orange-700 rounded-full border border-orange-200 uppercase"><Clock size={12}/> Pending</span>;
    }
  };

  const filteredData = maintenances.filter(m => 
    m.kode_maintenance?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.asset?.nama_aset?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-full overflow-hidden relative pb-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Pemeliharaan Aset</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Laporan kerusakan dan riwayat perbaikan aset.</p>
        </div>
        
        {/* Tombol Lapor Kerusakan (Semua role boleh melihat ini) */}
        <button 
          onClick={() => openModal('add')}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          Lapor Kerusakan
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col w-full overflow-hidden">
        
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-3 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari kode tiket atau nama aset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="w-full overflow-x-auto pb-2 min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 min-w-[900px]">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Kode Tiket</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Aset Terkait</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Tipe & Pelapor</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Biaya (Rp)</th>
                <th className="px-5 py-4 font-semibold text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-gray-400">Tidak ada riwayat pemeliharaan.</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-5 py-4 whitespace-nowrap font-mono font-medium text-gray-900">{item.kode_maintenance}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-800">{item.asset?.nama_aset || 'Aset Dihapus'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.asset?.kode_aset}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800 capitalize">{item.tipe}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Oleh: {item.requester?.nama || 'Sistem'}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-gray-800">
                      {item.biaya_perbaikan ? new Intl.NumberFormat('id-ID').format(item.biaya_perbaikan) : '-'}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      
                      {/* <-- 3. RBAC: Sembunyikan tombol Edit dan Hapus jika role-nya adalah staff --> */}
                      {user?.role !== 'staff' ? (
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openModal('edit', item)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Proses / Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id, item.kode_maintenance)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">View Only</span>
                      )}

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Wrench size={20} className="text-primary"/>
                {modalMode === 'add' ? 'Lapor Kerusakan / Pemeliharaan' : `Proses Tiket ${formData.kode_mnt}`}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2 border border-red-100">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              
              <form id="mntForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
                
                {modalMode === 'add' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Aset yang Bermasalah <span className="text-red-500">*</span></label>
                      <select name="asset_id" required value={formData.asset_id} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                        <option value="" disabled>-- Pilih Aset --</option>
                        {assets.map(a => <option key={a.id} value={a.id}>{a.kode_aset} - {a.nama_aset}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Pemeliharaan</label>
                      <select name="tipe" value={formData.tipe} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                        <option value="korektif">Korektif (Perbaikan Kerusakan)</option>
                        <option value="preventif">Preventif (Perawatan Rutin)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Laporan <span className="text-red-500">*</span></label>
                      <input type="date" name="tanggal_laporan" required value={formData.tanggal_laporan} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Masalah / Kerusakan <span className="text-red-500">*</span></label>
                      <textarea name="deskripsi_kerusakan" required value={formData.deskripsi_kerusakan} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Jelaskan detail kendala yang dialami..."></textarea>
                    </div>
                  </div>
                )}

                {modalMode === 'edit' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Aset Terkait</p>
                      <p className="text-sm font-semibold text-blue-900">{formData.asset_nama}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ubah Status Tiket <span className="text-red-500">*</span></label>
                      <select name="status" required value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                        <option value="pending">Pending (Menunggu)</option>
                        <option value="diproses">Diproses (Sedang Dikerjakan)</option>
                        <option value="selesai">Selesai (Aset Kembali Baik)</option>
                        <option value="dibatalkan">Dibatalkan</option>
                      </select>
                      <p className="text-[10px] text-gray-400 mt-1">Status 'Selesai' akan mengubah kondisi aset menjadi Baik otomatis.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Ditangani Oleh (Teknisi)</label>
                      <select name="handled_by" value={formData.handled_by} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                        <option value="">-- Pilih Teknisi --</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Mulai Dikerjakan</label>
                      <input type="date" name="tanggal_mulai" value={formData.tanggal_mulai} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Selesai</label>
                      <input type="date" name="tanggal_selesai" value={formData.tanggal_selesai} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Biaya Perbaikan (Rp)</label>
                      <input type="number" name="biaya_perbaikan" min="0" value={formData.biaya_perbaikan} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Kosongkan jika gratis/garansi" />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Tindakan Perbaikan yang Dilakukan</label>
                      <textarea name="tindakan_perbaikan" value={formData.tindakan_perbaikan} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Catat komponen apa saja yang diganti/diperbaiki..."></textarea>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={closeModal} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Batal
              </button>
              <button type="submit" form="mntForm" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                {isSaving ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}