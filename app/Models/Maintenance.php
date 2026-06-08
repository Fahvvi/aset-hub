<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;  

class Maintenance extends Model
{

use HasFactory;
    protected $guarded = ['id'];

    protected $fillable = [
        'kode_maintenance', // <--- WAJIB TAMBAHKAN INI DI BARIS PALING ATAS
        'asset_id', 
        'requested_by', 
        'vendor_id', 
        'tipe', 
        'tanggal_laporan', 
        'tanggal_mulai', 
        'tanggal_selesai', 
        'deskripsi_kerusakan', 
        'tindakan_perbaikan', 
        'biaya_perbaikan', 
        'status', 
        'keterangan'
    ];
    public function asset() {
        return $this->belongsTo(Asset::class, 'asset_id');
    }

    public function requester() {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function handler() {
        return $this->belongsTo(User::class, 'handled_by');
    }

    public function vendor() {
    return $this->belongsTo(Vendor::class, 'vendor_id'); // Pastikan Anda sudah punya model Vendor
}

}
