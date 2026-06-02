<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DepreciationService;

class CalculateDepreciation extends Command
{
    // Nama perintah Artisan
    protected $signature = 'depreciation:calculate';

    // Deskripsi perintah
    protected $description = 'Menghitung penyusutan bulanan untuk seluruh aset aktif sesuai PSAK 16';

    public function handle(DepreciationService $service)
    {
        $this->info('Memulai kalkulasi penyusutan aset...');
        
        $jumlahAset = $service->calculateMonthlyDepreciation();
        
        $this->info("Kalkulasi selesai! Berhasil memproses penyusutan untuk {$jumlahAset} aset bulan ini.");
    }
}