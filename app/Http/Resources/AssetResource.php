<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Cari berkas berjenis 'foto' dari relasi documents yang sudah dimuat
        $foto = $this->relationLoaded('documents') ? $this->documents->where('tipe_dokumen', 'foto')->first() : null;

        return [
            'id' => $this->id,
            'kode_aset' => $this->kode_aset,
            'nama_aset' => $this->nama_aset,
            
            'kategori' => $this->whenLoaded('category', function() {
                return $this->category->nama_kategori;
            }),
            'lokasi' => $this->whenLoaded('location', function() {
                return $this->location->nama_lokasi;
            }),
            'departemen' => $this->department ? $this->department->nama_departemen : null, // <-- TAMBAHKAN INI
            'nomor_seri' => $this->nomor_seri,
            'nomor_rangka_mesin' => $this->nomor_rangka_mesin,
            'nomor_unique_lain' => $this->nomor_unique_lain,
            
            'vendor' => $this->whenLoaded('vendor', function() {
                return $this->vendor->nama_vendor;
            }),
            'penanggung_jawab' => $this->whenLoaded('user', function() {
                return $this->user->nama;
            }),
            'nomor_seri' => $this->nomor_seri,
            'nomor_rangka_mesin' => $this->nomor_rangka_mesin,
            'nomor_unique_lain' => $this->nomor_unique_lain,
            
            'user_detail' => $this->when(
                $this->relationLoaded('user') && in_array(auth()->user()->role ?? '', ['admin', 'superadmin']), 
                function() {
                    return [
                        'id' => $this->user->id,
                        'nama' => $this->user->nama,
                        'email' => $this->user->email,
                        'role' => $this->user->role,
                    ];
            }),
            
            
            'tanggal_pembelian' => $this->tanggal_pembelian,
            'tanggal_aktif' => $this->tanggal_aktif,
            'harga_perolehan' => (float) $this->harga_perolehan,
            'nilai_sisa' => (float) $this->nilai_sisa,
            'kondisi' => $this->kondisi,
            'status' => $this->status,
            'keterangan' => $this->keterangan,
            
            // Tambahkan baris ini untuk mengirimkan URL foto langsung ke React
            'foto_url' => $foto ? asset('storage/' . $foto->path) : null,
            
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}