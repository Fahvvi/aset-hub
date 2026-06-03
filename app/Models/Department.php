<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_departemen',
        'nama_departemen',
        'deskripsi'
    ];

    // Relasi balik: Satu departemen memiliki banyak user dan banyak aset
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }
}