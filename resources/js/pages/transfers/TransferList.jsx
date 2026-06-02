import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, Plus, Search, Check, X as RejectIcon, X, AlertCircle, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import axiosInstance from '../../api/axios';

export default function TransferList() {
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [trfRes, astRes, locRes, usrRes] = await Promise.all([
        axiosInstance.get('/transfers'),
        axiosInstance.get('/assets').catch(() => ({ data: [] })),
        axiosInstance.get('/locations').catch(() => ({ data: [] })),
        axiosInstance.get('/users').catch(() => ({ data: [] }))
      ]);
      setTransfers(trfRes.data.data || trfRes.data);
      setAssets(astRes.data.data || astRes.data);
      setLocations(locRes.data.data || locRes.data);
      setUsers(usrRes.data.data || usrRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = () => {
    setFormError('');
    setFormData({
      asset_id: '', ke_location_id: '', ke_user_id: '',
      tanggal_transfer: new Date().toISOString().split('T')[0], alasan: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');
    try {
      await axiosInstance.post('/transfers', formData);
      closeModal();
      fetchData(); 
    } catch (error) {
      setFormError(error.response?.data?.message || 'Gagal mengajukan pemindahan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveReject = async (id, action) => {
    const actionText = action === 'approve' ? 'Menyetujui' : 'Menolak';
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} transfer ini?`)) return;
    try {
      await axiosInstance.put(`/transfers/${id}/${action}`);
      fetchData();
    } catch (error) {
      alert(`Gagal ${actionText} data.`);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'disetujui': return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-green-50 text-green-700 rounded-full border border-green-200 uppercase"><CheckCircle size={12}/> Disetujui</span>;
      case 'ditolak': return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-red-50 text-red-700 rounded-full border border-red-200 uppercase"><XCircle size={12}/> Ditolak</span>;
      default: return <span className="flex w-fit items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold bg-orange-50 text-orange-700 rounded-full border border-orange-200 uppercase"><Clock size={12}/> Pending</span>;
    }
  };

  const filteredData = transfers.filter(t => 
    t.asset?.nama_aset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.asset?.kode_aset?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-full overflow-hidden relative pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Pemindahan Aset</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Riwayat mutasi dan perpindahan aset antar lokasi.</p>
        </div>
        <button onClick={openModal} className="flex items-center justify-center gap-2 bg-primary hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm whitespace-nowrap transition-colors">
          <Plus size={18} /> Ajukan Mutasi
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col w-full overflow-hidden">
        
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-3 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Cari aset yang dipindah..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
          </div>
        </div>

        {/* Tabel Data (Mobile Responsive dgn whitespace-nowrap) */}
        <div className="w-full overflow-x-auto pb-2 min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 min-w-[900px]">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Aset</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Lokasi Asal</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Tujuan Pemindahan</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Tanggal & Alasan</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-5 py-4 font-semibold text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-gray-400">Belum ada riwayat mutasi aset.</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-800">{item.asset?.nama_aset}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.asset?.kode_aset}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap bg-red-50/30">
                      <p className="font-medium text-red-800">{item.dariLokasi?.nama_lokasi}</p>
                      <p className="text-[10px] text-red-600/70 uppercase mt-0.5 font-bold">PJ: {item.dariUser?.nama || '-'}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap bg-green-50/30 border-l border-r border-gray-50">
                      <p className="font-medium text-green-800">{item.keLokasi?.nama_lokasi}</p>
                      <p className="text-[10px] text-green-600/70 uppercase mt-0.5 font-bold">PJ: {item.keUser?.nama || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium whitespace-nowrap text-gray-800">{item.tanggal_transfer}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 max-w-[200px]" title={item.alasan}>{item.alasan}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleApproveReject(item.id, 'approve')} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Setujui Mutasi"><Check size={18} /></button>
                          <button onClick={() => handleApproveReject(item.id, 'reject')} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Tolak Mutasi"><RejectIcon size={18} /></button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Terkunci</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL PENGAJUAN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <ArrowRightLeft size={20} className="text-primary"/> Ajukan Mutasi Aset
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{formError}</span></div>
              )}
              
              <form id="trfForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Aset yang Dipindah <span className="text-red-500">*</span></label>
                  <select name="asset_id" required value={formData.asset_id} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white">
                    <option value="" disabled>-- Pilih Aset --</option>
                    {assets.map(a => <option key={a.id} value={a.id}>{a.kode_aset} - {a.nama_aset}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi Tujuan <span className="text-red-500">*</span></label>
                    <select name="ke_location_id" required value={formData.ke_location_id} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white">
                      <option value="" disabled>-- Pilih Lokasi --</option>
                      {locations.map(l => <option key={l.id} value={l.id}>{l.nama_lokasi}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Penanggung Jawab Baru</label>
                    <select name="ke_user_id" value={formData.ke_user_id} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white">
                      <option value="">-- Tetap / Kosongkan --</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Transfer <span className="text-red-500">*</span></label>
                  <input type="date" name="tanggal_transfer" required value={formData.tanggal_transfer} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alasan Pemindahan <span className="text-red-500">*</span></label>
                  <textarea name="alasan" required value={formData.alasan} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="Tuliskan alasan pemindahan / mutasi ini..."></textarea>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg">Batal</button>
              <button type="submit" form="trfForm" disabled={isSaving} className="px-4 py-2 text-sm text-white bg-primary rounded-lg">{isSaving ? 'Menyimpan...' : 'Ajukan Transfer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}