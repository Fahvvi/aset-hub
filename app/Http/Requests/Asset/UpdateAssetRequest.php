<?php

namespace App\Http\Requests\Asset;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Ambil ID aset dari URL untuk mengecualikan validasi unique kode_aset
        $assetId = $this->route('id');

        return [
            'kode_aset' => 'nullable|string|max:50|unique:assets,kode_aset,' . $assetId,
            'nama_aset' => 'required|string|max:150',
            
            // --- MASTER DATA RELATIONS ---
            'category_id' => 'required|exists:categories,id',
            'department_id' => 'required|exists:departments,id', // <-- WAJIB ADA
            'location_id' => 'required|exists:locations,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'user_id' => 'nullable|exists:users,id',
            
            // --- IDENTITAS UNIK ---
            'nomor_seri' => 'nullable|string|max:100',
            'nomor_rangka_mesin' => 'nullable|string|max:100', // <-- WAJIB ADA
            'nomor_unique_lain' => 'nullable|string|max:100',  // <-- WAJIB ADA
            
            // --- NILAI & MASA PAKAI ---
            'tanggal_pembelian' => 'required|date',
            'tanggal_aktif' => 'nullable|date',
            'masa_pakai_tahun' => 'required|integer|min:1',
            'harga_perolehan' => 'required|numeric|min:0',
            'nilai_sisa' => 'nullable|numeric|min:0',
            
            // --- STATUS & FOTO ---
            'kondisi' => 'nullable|in:baik,rusak_ringan,rusak_berat',
            'status' => 'nullable|in:aktif,tidak_aktif,dalam_perbaikan,disposal',
            'keterangan' => 'nullable|string',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ];
    }
}