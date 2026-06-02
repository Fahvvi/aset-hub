<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'kode_aset', 'nama_aset', 'category_id', 'location_id', 'vendor_id', 'user_id',
        'tanggal_pembelian', 'tanggal_aktif', 'masa_pakai_tahun', 'harga_perolehan',
        'nilai_sisa', 'jumlah', 'satuan', 'nomor_seri', 'nomor_inventaris',
        'kondisi', 'status', 'keterangan', 'created_by', 'updated_by'
    ];

    // Relasi
    public function category() { return $this->belongsTo(Category::class); }
    public function location() { return $this->belongsTo(Location::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function user() { return $this->belongsTo(User::class); } // Penanggung Jawab
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    }