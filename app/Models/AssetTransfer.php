<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetTransfer extends Model
{
    protected $fillable = ['asset_id', 'dari_location_id', 
    'ke_location_id', 'dari_user_id', 'ke_user_id', 
    'tanggal_transfer', 'alasan', 'disetujui_oleh', 'status'];
}
