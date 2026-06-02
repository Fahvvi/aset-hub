<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AssetTransfer extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    
    protected $fillable = ['asset_id', 'dari_location_id', 
    'ke_location_id', 'dari_user_id', 'ke_user_id', 
    'tanggal_transfer', 'alasan', 'disetujui_oleh', 'status'];

    public function asset() { return $this->belongsTo(Asset::class, 'asset_id'); }
    public function dariLokasi() { return $this->belongsTo(Location::class, 'dari_location_id'); }
    public function keLokasi() { return $this->belongsTo(Location::class, 'ke_location_id'); }
    public function dariUser() { return $this->belongsTo(User::class, 'dari_user_id'); }
    public function keUser() { return $this->belongsTo(User::class, 'ke_user_id'); }
    public function approver() { return $this->belongsTo(User::class, 'disetujui_oleh'); }

}
