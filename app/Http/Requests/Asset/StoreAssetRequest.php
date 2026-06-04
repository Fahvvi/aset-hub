<?php

namespace App\Http\Requests\Asset;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { 
        return true; 
        }
    public function rules(): array
    {
        return [
            'kode_aset' => 'nullable|string|max:30|unique:assets,kode_aset',
            'nama_aset' => 'required|string|max:150',
            'category_id' => 'required|exists:categories,id',
            'location_id' => 'required|exists:locations,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'user_id' => 'nullable|exists:users,id', // Penanggung jawab
            'tanggal_pembelian' => 'required|date',
            'tanggal_aktif' => 'required|date',
            'masa_pakai_tahun' => 'required|integer|min:1',
            'harga_perolehan' => 'required|numeric|min:0',
            'nilai_sisa' => 'nullable|numeric|min:0',
            'jumlah' => 'nullable|integer|min:1',
            'satuan' => 'nullable|string|max:30',
            'nomor_seri' => 'nullable|string|max:100',
            'nomor_inventaris' => 'nullable|string|max:100',
            'kondisi' => 'nullable|in:baik,rusak_ringan,rusak_berat',
            'status' => 'nullable|in:aktif,tidak_aktif,dalam_perbaikan,disposal',
            'keterangan' => 'nullable|string',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // Maksimal 2MB
        ];
    }
}
