<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'kode_aset', 'nama_aset', 'category_id', 'department_id', 'location_id', 'vendor_id', 'user_id',
        'nomor_seri', 'nomor_rangka_mesin', 'nomor_unique_lain', // <-- INI YANG BARU
        'tanggal_pembelian', 'tanggal_aktif', 'masa_pakai_tahun', 'harga_perolehan',
        'nilai_sisa', 'kondisi', 'status', 'keterangan', 'foto', 'created_by', 'updated_by'
    ];

    // Relasi
    public function category() { return $this->belongsTo(Category::class); }
    public function location() { return $this->belongsTo(Location::class); }
    public function vendor() { return $this->belongsTo(Vendor::class); }
    public function user() { return $this->belongsTo(User::class); } // Penanggung Jawab
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    public function department() {
        return $this->belongsTo(Department::class);
    }

    public function depreciations() {
        return $this->hasMany(AssetDepreciation::class, 'asset_id');
    }
    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function maintenances() 
    {
        return $this->hasMany(Maintenance::class, 'asset_id');
    }

    // Relasi ke tabel asset_transfers (Pastikan namanya 'transfers', bukan 'assetTransfers')
    public function transfers() 
    {
        return $this->hasMany(AssetTransfer::class, 'asset_id');
    }

    }