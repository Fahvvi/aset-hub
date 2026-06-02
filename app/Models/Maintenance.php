<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;  

class Maintenance extends Model
{

use HasFactory;
    protected $guarded = ['id'];

    public function asset() {
        return $this->belongsTo(Asset::class, 'asset_id');
    }

    public function requester() {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function handler() {
        return $this->belongsTo(User::class, 'handled_by');
    }

    protected $fillable= ['kode_maintenance', 'asset_id', 'requested_by', 
    'handled_by', 'tipe', 'tanggal_laporan', 'tanggal_mulai', 
    'tanggal_selesai', 'deskripsi_kerusakan', 'tindakan_perbaikan', 
    'biaya_perbaikan', 'status', 'keterangan'];
}
