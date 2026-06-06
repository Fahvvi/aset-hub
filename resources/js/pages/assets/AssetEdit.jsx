import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axios';

export default function AssetEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]); 

  const [formData, setFormData] = useState({
    kode_aset: '', nama_aset: '', category_id: '', department_id: '', location_id: '', vendor_id: '', user_id: '',
    nomor_seri: '', nomor_rangka_mesin: '', nomor_unique_lain: '',
    tanggal_pembelian: '', tanggal_aktif: '', masa_pakai_tahun: '', harga_perolehan: '',
    nilai_sisa: '', kondisi: '', status: '', keterangan: ''
  });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoLama, setFotoLama] = useState(null); // Menampilkan foto lama

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, locRes, venRes, userRes, depRes, assetRes] = await Promise.all([
          axiosInstance.get('/categories').catch(() => ({ data: [] })),
          axiosInstance.get('/locations').catch(() => ({ data: [] })),
          axiosInstance.get('/vendors').catch(() => ({ data: [] })),
          axiosInstance.get('/users').catch(() => ({ data: [] })),
          axiosInstance.get('/departments').catch(() => ({ data: [] })), 
          axiosInstance.get(`/assets/${id}`)
        ]);
        
        const safeArray = (res) => {
          if (Array.isArray(res)) return res;
          if (res?.data && Array.isArray(res.data)) return res.data;
          if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
          return [];
        };

        setCategories(safeArray(catRes));
        setLocations(safeArray(locRes));
        setVendors(safeArray(venRes));
        setUsers(safeArray(userRes));
        setDepartments(safeArray(depRes)); 

        const assetData = assetRes.data.data || assetRes.data;
        
        // Simpan URL foto lama untuk ditampilkan
        if(assetData.foto_url) setFotoLama(assetData.foto_url);

        setFormData({
          kode_aset: assetData.kode_aset || '',
          nama_aset: assetData.nama_aset || '',
          category_id: assetData.category_id || '',
          department_id: assetData.department_id || '', 
          location_id: assetData.location_id || '',
          vendor_id: assetData.vendor_id || '',
          user_id: assetData.user_id || '',
          nomor_seri: assetData.nomor_seri || '', 
          nomor_rangka_mesin: assetData.nomor_rangka_mesin || '', 
          nomor_unique_lain: assetData.nomor_unique_lain || '', 
          tanggal_pembelian: assetData.tanggal_pembelian || '',
          tanggal_aktif: assetData.tanggal_aktif || '',
          masa_pakai_tahun: assetData.masa_pakai_tahun || '',
          harga_perolehan: assetData.harga_perolehan || '',
          nilai_sisa: assetData.nilai_sisa || '',
          kondisi: assetData.kondisi || 'baik',
          status: assetData.status || 'aktif',
          keterangan: assetData.keterangan || ''
        });
      } catch (err) {
        setError('Gagal mengambil data aset. Mungkin aset sudah dihapus.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [id]);

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

    const payload = new FormData();
    
    // Trik Wajib Laravel: Kirim sebagai POST, tapi beri header spoofing PUT
    payload.append('_method', 'PUT'); 
    
    Object.keys(formData).forEach(key => {
      // Pastikan angka 0 tetap terkirim, tapi string kosong dibuang
      if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        payload.append(key, formData[key]);
      }
    });
    
    // Jika ada file foto baru, lampirkan
    if (fotoFile) {
        payload.append('foto', fotoFile);
    }

    try {
      // PENTING: Gunakan axiosInstance.post, BUKAN .put (karena FormData + File = POST)
      await axiosInstance.post(`/assets/${id}`, payload, {
        headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
        }
      });
      navigate('/assets'); 
    } catch (err) {
      console.error(err.response);
      setError(err.response?.data?.message || 'Gagal menyimpan pembaruan aset.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="p-8 text-center text-gray-500 flex justify-center mt-20">Memuat data untuk diedit...</div>;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/assets" className="p-2 w-fit bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Edit Aset</h1>
          <p className="text-sm text-gray-500 mt-1">Perbarui informasi untuk <span className="font-semibold">{formData.kode_aset}</span></p>
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
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 sm:gap-5">
          <h3 className="font-bold text-gray-800 border-b pb-2">Informasi Dasar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Aset <span className="text-red-500">*</span></label>
              <input type="text" name="nama_aset" required value={formData.nama_aset} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Aset</label>
              <input type="text" name="kode_aset" value={formData.kode_aset} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 outline-none" readOnly title="Kode aset tidak dapat diubah" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
              <select name="category_id" required value={formData.category_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="" disabled>-- Pilih Kategori --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nama_kategori}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Departemen <span className="text-red-500">*</span></label>
              <select name="department_id" required value={formData.department_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="" disabled>-- Pilih Departemen --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.nama_departemen}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lokasi <span className="text-red-500">*</span></label>
              <select name="location_id" required value={formData.location_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="" disabled>-- Pilih Lokasi --</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.nama_lokasi}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Vendor Pengadaan</label>
              <select name="vendor_id" value={formData.vendor_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="">-- Tidak Ada / Pilih Vendor --</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.nama_vendor}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Identitas Unik */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 sm:gap-5">
          <h3 className="font-bold text-gray-800 border-b pb-2">Identitas Unik (Opsional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Seri (S/N) Pabrik</label>
              <input type="text" name="nomor_seri" value={formData.nomor_seri} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Contoh: SN-1234567890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Rangka / Mesin</label>
              <input type="text" name="nomor_rangka_mesin" value={formData.nomor_rangka_mesin} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Khusus kendaraan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Unik Lainnya</label>
              <input type="text" name="nomor_unique_lain" value={formData.nomor_unique_lain} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="MAC / BPKB / dll" />
            </div>
          </div>
        </div>

        {/* Nilai & Masa Pakai */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 sm:gap-5">
          <h3 className="font-bold text-gray-800 border-b pb-2">Nilai & Masa Pakai</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Perolehan (Rp) <span className="text-red-500">*</span></label>
              <input type="number" name="harga_perolehan" required min="0" value={formData.harga_perolehan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Masa Pakai (Tahun) <span className="text-red-500">*</span></label>
              <input type="number" name="masa_pakai_tahun" required min="1" value={formData.masa_pakai_tahun} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Pembelian <span className="text-red-500">*</span></label>
              <input type="date" name="tanggal_pembelian" required value={formData.tanggal_pembelian} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Mulai Dipakai <span className="text-red-500">*</span></label>
              <input type="date" name="tanggal_aktif" required value={formData.tanggal_aktif} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            </div>
          </div>
        </div>

        {/* Status, Pengguna & Foto */}
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 sm:gap-5">
          <h3 className="font-bold text-gray-800 border-b pb-2">Status & Penggunaan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Digunakan oleh (Opsional)</label>
              <select name="user_id" value={formData.user_id} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                <option value="">-- Bebas / Belum Ada Penanggung Jawab --</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.nama} ({u.role})</option>)}
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
              {fotoLama && (
                <div className="w-full sm:w-32 h-32 shrink-0 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                    <img src={fotoLama} alt="Foto Lama" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ubah Foto Aset (Biarkan kosong jika tidak diubah)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center bg-gray-50/50 w-full">
                    <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100 overflow-hidden" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan Tambahan</label>
              <textarea name="keterangan" value={formData.keterangan} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"></textarea>
            </div>
          </div>
        </div>

        {/* Tombol Aksi - Fixed At Bottom on Mobile */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2 mb-10 sm:mb-0">
          <Link to="/assets" className="px-6 py-3 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center">
            Batal
          </Link>
          <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
            <Save size={18} />
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}