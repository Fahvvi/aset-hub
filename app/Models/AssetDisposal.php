<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AssetDisposal extends Model
{

use HasFactory;
    protected $fillable = ['asset_id', 'tanggal_disposal', 'metode_disposal', 
    'nilai_disposal', 'alasan', 'disetujui_oleh', 'dokumen_referensi', 'created_by'];

    protected $guarded = ['id'];

    public function asset() { return $this->belongsTo(Asset::class, 'asset_id'); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function approver() { return $this->belongsTo(User::class, 'disetujui_oleh'); }
}
