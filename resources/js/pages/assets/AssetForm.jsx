import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';

export default function AssetForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State untuk dropdown master data & users
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]); // Tambahan untuk daftar pengguna

  // State untuk form
  const [formData, setFormData] = useState({
    kode_aset: '', nama_aset: '', category_id: '', location_id: '', vendor_id: '', user_id: '',
    tanggal_pembelian: '', tanggal_aktif: '', masa_pakai_tahun: '', harga_perolehan: '',
    nilai_sisa: '', kondisi: 'baik', status: 'aktif', keterangan: ''
  });
  const [fotoFile, setFotoFile] = useState(null);

  // Ambil data referensi saat komponen dimuat
  useEffect(() => {
  const fetchMasterData = async () => {
            try {
            // Menjalankan request secara independen agar jika satu error, yang lain tetap jalan
            const catReq = axiosInstance.get('/categories').catch(() => ({ data: [] }));
            const locReq = axiosInstance.get('/locations').catch(() => ({ data: [] }));
            const venReq = axiosInstance.get('/vendors').catch(() => ({ data: [] }));
            const userReq = axiosInstance.get('/users').catch(() => ({ data: [] }));

            const [catRes, locRes, venRes, userRes] = await Promise.all([catReq, locReq, venReq, userReq]);
            
            setCategories(catRes.data.data || catRes.data || []);
            setLocations(locRes.data.data || locRes.data || []);
            setVendors(venRes.data.data || venRes.data || []);
            setUsers(userRes.data.data || userRes.data || []);
            } catch (err) {
            console.error("Gagal mengambil data referensi", err);
            }
        };
    fetchMasterData();
    }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Gunakan FormData karena ada file foto
    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) payload.append(key, formData[key]);
    });
    if (fotoFile) payload.append('foto', fotoFile);

    try {
      await axiosInstance.post('/assets', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/assets'); // Kembali ke daftar aset jika sukses
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan aset. Periksa kembali isian Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link to="/assets" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Tambah Aset Baru</h1>
          <p className="text-sm text-gray-500 mt-1">Lengkapi informasi detail mengenai aset yang akan didaftarkan.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-3 border border-red-100">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Informasi Dasar */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-5">
          <h3 className="font-bold text-gray-800 border-b pb-2">Informasi Dasar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Aset <span className="text-red-500">*</span></label>
              <input type="text" name="nama_aset" required value={formData.nama_aset} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Contoh: MacBook Pro M3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Aset (Opsional)</label>
              <input type="text" name="kode_aset" value={formData.kode_aset} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Kosongkan untuk otomatis SDI-..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
              <select name="category_id" required value={formData.category_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="" disabled>-- Pilih Kategori --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nama_kategori} ({c.kode_kategori})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi <span className="text-red-500">*</span></label>
              <select name="location_id" required value={formData.location_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="" disabled>-- Pilih Lokasi --</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.nama_lokasi} - {l.gedung}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor Pengadaan</label>
              <select name="vendor_id" value={formData.vendor_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="">-- Tidak Ada / Pilih Vendor --</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.nama_vendor}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Nilai & Masa Pakai */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-5">
          <h3 className="font-bold text-gray-800 border-b pb-2">Nilai & Masa Pakai</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Pembelian <span className="text-red-500">*</span></label>
              <input type="date" name="tanggal_pembelian" required value={formData.tanggal_pembelian} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Mulai Dipakai <span className="text-red-500">*</span></label>
              <input type="date" name="tanggal_aktif" required value={formData.tanggal_aktif} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Perolehan (Rp) <span className="text-red-500">*</span></label>
              <input type="number" name="harga_perolehan" required min="0" value={formData.harga_perolehan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Contoh: 15000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Masa Pakai (Tahun) <span className="text-red-500">*</span></label>
              <input type="number" name="masa_pakai_tahun" required min="1" value={formData.masa_pakai_tahun} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Isi sesuai umur ekonomis kategori" />
            </div>
          </div>
        </div>

        {/* Status, Pengguna & Foto */}
        <div className="bg-white p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-5">
          <h3 className="font-bold text-gray-800 border-b pb-2">Status & Penggunaan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kondisi</label>
              <select name="kondisi" value={formData.kondisi} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="baik">Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Aset</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="aktif">Aktif</option>
                <option value="tidak_aktif">Tidak Aktif</option>
                <option value="dalam_perbaikan">Dalam Perbaikan</option>
              </select>
            </div>
            
            {/* TAMBAHAN: Digunakan Oleh */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Digunakan oleh (Opsional)</label>
              <select name="user_id" value={formData.user_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="">-- Bebas / Belum Ada Penanggung Jawab --</option>
                {Array.isArray(users) && users.map(u => (
                    <option key={u.id} value={u.id}>{u.nama} ({u.role})</option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">Anda bisa mengetikkan nama di dalam kotak untuk mencari dengan cepat.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto Aset</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <ImageIcon className="text-gray-400 w-10 h-10 mb-2" />
                <p className="text-sm text-gray-600 mb-1">Klik atau seret foto ke area ini</p>
                <p className="text-xs text-gray-400 mb-4">PNG, JPG, JPEG (Max. 2MB)</p>
                <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan / Catatan Tambahan</label>
              <textarea name="keterangan" value={formData.keterangan} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3 mt-2">
          <Link to="/assets" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Batal
          </Link>
          <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
            <Save size={18} />
            {isLoading ? 'Menyimpan...' : 'Simpan Aset'}
          </button>
        </div>
      </form>
    </div>
  );
}