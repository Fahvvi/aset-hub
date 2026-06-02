<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_kategori', 'nama_kategori', 'deskripsi', 
        'metode_penyusutan', 'umur_ekonomis_tahun', 'nilai_sisa_persen'
    ];
}