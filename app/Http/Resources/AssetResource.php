<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode_aset' => $this->kode_aset,
            'nama_aset' => $this->nama_aset,
            
            // --- ID MENTAH ---
            'category_id' => $this->category_id,
            'location_id' => $this->location_id,
            'department_id' => $this->department_id,
            'vendor_id' => $this->vendor_id,
            'user_id' => $this->user_id,

            // --- NAMA RELASI (DENGAN PENGAMAN ?-> ) ---
            'kategori' => $this->whenLoaded('category', fn() => $this->category?->nama_kategori),
            'lokasi' => $this->whenLoaded('location', fn() => $this->location?->nama_lokasi),
            'departemen' => $this->whenLoaded('department', fn() => $this->department?->nama_departemen),
            'vendor' => $this->whenLoaded('vendor', fn() => $this->vendor?->nama_vendor),
            'penanggung_jawab' => $this->whenLoaded('user', fn() => $this->user?->nama),
            'maintenances' => $this->whenLoaded('maintenances'),
            'transfers' => $this->whenLoaded('transfers'),
            
            // --- IDENTITAS UNIK ---
            'nomor_seri' => $this->nomor_seri,
            'nomor_rangka_mesin' => $this->nomor_rangka_mesin,
            'nomor_unique_lain' => $this->nomor_unique_lain,
            
            // --- PENGAMANAN TOTAL UNTUK USER DETAIL ---
            // Mencegah crash jika user_id kosong, ATAU jika diakses via Public Scan (tanpa token login)
            'user_detail' => $this->whenLoaded('user', function() {
                $currentUser = auth()->guard('sanctum')->user();
                
                // Pastikan aset ini PUNYA user, DAN yang request sedang login, DAN rolenya admin/superadmin
                if ($this->user && $currentUser && in_array($currentUser->role, ['admin', 'superadmin'])) {
                    return [
                        'id' => $this->user->id, 
                        'nama' => $this->user->nama, 
                        'email' => $this->user->email, 
                        'role' => $this->user->role
                    ];
                }
                return null;
            }),
            
            // --- SISANYA ---
            'tanggal_pembelian' => $this->tanggal_pembelian,
            'tanggal_aktif' => $this->tanggal_aktif,
            'masa_pakai_tahun' => $this->masa_pakai_tahun,
            'harga_perolehan' => (float) $this->harga_perolehan,
            'nilai_sisa' => (float) $this->nilai_sisa,
            'kondisi' => $this->kondisi,
            'status' => $this->status,
            'keterangan' => $this->keterangan,
            'foto_url' => $this->foto ? asset('storage/' . $this->foto) : null,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}