<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssetDepreciation extends Model
{
   protected $fillable = ['asset_id', 'periode', 'nilai_awal_periode', 
   'beban_penyusutan', 'akumulasi_penyusutan', 'nilai_buku', 'metode'];
}
