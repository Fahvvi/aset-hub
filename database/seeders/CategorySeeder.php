<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'kode_kategori' => 'ELK',
                'nama_kategori' => 'Elektronik & IT',
                'metode_penyusutan' => 'straight_line',
                'umur_ekonomis_tahun' => 4,
                'nilai_sisa_persen' => 0,
            ],
            [
                'kode_kategori' => 'FRN',
                'nama_kategori' => 'Furnitur & Peralatan Kantor',
                'metode_penyusutan' => 'straight_line',
                'umur_ekonomis_tahun' => 5,
                'nilai_sisa_persen' => 5.00,
            ],
            [
                'kode_kategori' => 'KND',
                'nama_kategori' => 'Kendaraan Operasional',
                'metode_penyusutan' => 'declining_balance',
                'umur_ekonomis_tahun' => 8,
                'nilai_sisa_persen' => 20.00,
            ]
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}