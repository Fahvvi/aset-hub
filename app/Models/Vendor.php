<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_vendor', 'nama_vendor', 'kontak_person', 'telepon', 'email', 'alamat'
    ];
}