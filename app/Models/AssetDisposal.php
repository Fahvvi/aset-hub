<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetDisposal extends Model
{
    protected $fillable = ['asset_id', 'tanggal_disposal', 'metode_disposal', 
    'nilai_disposal', 'alasan', 'disetujui_oleh', 'dokumen_referensi', 'created_by'];
}
