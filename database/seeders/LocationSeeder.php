<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        Location::create([
            'kode_lokasi' => 'GD-A-101',
            'nama_lokasi' => 'Ruang Server Utama',
            'gedung' => 'Gedung A',
            'lantai' => '1',
        ]);
        
        Location::create([
            'kode_lokasi' => 'GD-B-205',
            'nama_lokasi' => 'Ruang Staff Operasional',
            'gedung' => 'Gedung B',
            'lantai' => '2',
        ]);
    }
}