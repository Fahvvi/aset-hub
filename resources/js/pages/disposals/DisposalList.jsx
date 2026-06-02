import React, { useState, useEffect } from 'react';
import { 
  Trash2, Plus, Search, Check, X as RejectIcon, X, AlertCircle, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import axiosInstance from '../../api/axios';

export default function DisposalList() {
  const [disposals, setDisposals] = useState([]);
  const [assets, setAssets] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dspRes, astRes] = await Promise.all([
        axiosInstance.get('/disposals'),
        axiosInstance.get('/assets').catch(() => ({ data: [] }))
      ]);
      setDisposals(dspRes.data.data || dspRes.data);
      // Hanya tampilkan aset yang BUKAN berstatus disposal untuk form pengajuan
      const activeAssets = (astRes.data.data || astRes.data).filter(a => a.status !== 'disposal');
      setAssets(activeAssets);
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
      asset_id: '', metode_disposal: 'dijual', nilai_disposal: '',
      tanggal_disposal: new Date().toISOString().split('T')[0], alasan: '', dokumen_referensi: ''
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
      await axiosInstance.post('/disposals', formData);
      closeModal();
      fetchData(); 
    } catch (error) {
      setFormError(error.response?.data?.message || 'Gagal mengajukan penghapusan aset.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveReject = async (id, action) => {
    const actionText = action === 'approve' ? 'Menyetujui' : 'Menolak';
    if (!window.confirm(`Yakin ingin ${actionText} penghapusan aset ini? Aset yang disetujui akan terkunci permanen.`)) return;
    try {
      await axiosInstance.put(`/disposals/${id}/${action}`);
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

  const filteredData = disposals.filter(d => 
    d.asset?.nama_aset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.asset?.kode_aset?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full max-w-full overflow-hidden relative pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Penghapusan Aset (Disposal)</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Kelola pelepasan aset yang rusak, dijual, atau dihibahkan.</p>
        </div>
        <button onClick={openModal} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm whitespace-nowrap transition-colors">
          <Trash2 size={18} /> Ajukan Penghapusan
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col w-full overflow-hidden">
        
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-3 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Cari aset yang didisposal..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white" />
          </div>
        </div>

        {/* Tabel Data */}
        <div className="w-full overflow-x-auto pb-2 min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 min-w-[900px]">
            <thead className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Aset</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Metode & Nilai</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Tanggal & Alasan</th>
                <th className="px-5 py-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-5 py-4 font-semibold text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-gray-400">Belum ada riwayat penghapusan aset.</td></tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/10 transition-colors group">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-800">{item.asset?.nama_aset}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.asset?.kode_aset}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800 capitalize">{item.metode_disposal?.replace('_', ' ')}</p>
                      <p className="text-xs font-semibold text-red-600 mt-0.5">
                        {item.nilai_disposal > 0 ? `Rp ${new Intl.NumberFormat('id-ID').format(item.nilai_disposal)}` : '-'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium whitespace-nowrap text-gray-800">{item.tanggal_disposal}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 max-w-[200px]" title={item.alasan}>{item.alasan}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      {item.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleApproveReject(item.id, 'approve')} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Setujui"><Check size={18} /></button>
                          <button onClick={() => handleApproveReject(item.id, 'reject')} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Tolak"><RejectIcon size={18} /></button>
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
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <Trash2 size={20} /> Ajukan Penghapusan Aset
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2"><AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{formError}</span></div>
              )}
              
              <form id="dspForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Aset yang Dihapus <span className="text-red-500">*</span></label>
                  <select name="asset_id" required value={formData.asset_id} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white">
                    <option value="" disabled>-- Pilih Aset Aktif --</option>
                    {assets.map(a => <option key={a.id} value={a.id}>{a.kode_aset} - {a.nama_aset}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Metode Disposal <span className="text-red-500">*</span></label>
                    <select name="metode_disposal" required value={formData.metode_disposal} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm outline-none bg-white">
                      <option value="dijual">Dijual (Lelang)</option>
                      <option value="dihibahkan">Dihibahkan</option>
                      <option value="dihapus">Dihapus (Dimusnahkan)</option>
                      <option value="rusak_total">Rusak Total / Hilang</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Disposal <span className="text-red-500">*</span></label>
                    <input type="date" name="tanggal_disposal" required value={formData.tanggal_disposal} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" />
                  </div>
                </div>

                {formData.metode_disposal === 'dijual' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nilai Realisasi / Harga Jual (Rp)</label>
                    <input type="number" name="nilai_disposal" min="0" value={formData.nilai_disposal} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="Isi jika aset ini menghasilkan uang masuk" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">No. Dokumen Referensi (BA/SK)</label>
                  <input type="text" name="dokumen_referensi" value={formData.dokumen_referensi} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="Contoh: BA-001/IT/2026" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alasan Detail <span className="text-red-500">*</span></label>
                  <textarea name="alasan" required value={formData.alasan} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border rounded-lg text-sm outline-none" placeholder="Jelaskan alasan aset ini dikeluarkan dari inventaris..."></textarea>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg">Batal</button>
              <button type="submit" form="dspForm" disabled={isSaving} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg">{isSaving ? 'Memproses...' : 'Ajukan Disposal'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}