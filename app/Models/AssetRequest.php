<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetRequest extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // Relasi ke User yang mengajukan
    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    // Relasi ke Departemen
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    // Relasi ke Admin yang menyetujui
    public function approver()
    {
        return $this->belongsTo(User::class, 'disetujui_oleh');
    }
}