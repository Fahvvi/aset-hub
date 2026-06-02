<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetDepreciation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DepreciationService
{
    public function calculateMonthlyDepreciation()
    {
        $periodeBulanIni = Carbon::now()->startOfMonth();
        
        // Ambil semua aset yang statusnya aktif dan sudah melewati tanggal aktif
        $assets = Asset::with('category')
            ->where('status', 'aktif')
            ->whereDate('tanggal_aktif', '<=', $periodeBulanIni)
            ->get();

        $count = 0;

        foreach ($assets as $asset) {
            DB::beginTransaction();
            try {
                // 1. Tentukan Nilai Buku Terakhir
                $lastDepreciation = AssetDepreciation::where('asset_id', $asset->id)
                    ->orderBy('periode', 'desc')
                    ->first();

                $nilaiBukuAwal = $lastDepreciation ? $lastDepreciation->nilai_buku : $asset->harga_perolehan;

                // Jika nilai buku sudah mencapai atau di bawah nilai sisa (salvage value), hentikan penyusutan
                if ($nilaiBukuAwal <= $asset->nilai_sisa) {
                    DB::rollBack();
                    continue;
                }

                // 2. Tentukan Metode dan Masa Pakai (dalam bulan)
                $metode = $asset->category->metode_penyusutan ?? 'straight_line';
                $masaPakaiBulan = ($asset->masa_pakai_tahun ?? $asset->category->umur_ekonomis_tahun) * 12;

                if ($masaPakaiBulan <= 0) continue;

                $bebanPenyusutan = 0;

                // 3. Hitung Beban Penyusutan Bulan Ini
                if ($metode === 'straight_line') {
                    // Garis Lurus: (Harga Beli - Nilai Sisa) / Total Bulan
                    $bebanPenyusutan = ($asset->harga_perolehan - $asset->nilai_sisa) / $masaPakaiBulan;
                } else {
                    // Saldo Menurun Ganda (Double Declining): (Nilai Buku Terakhir * (2 / Total Bulan))
                    $rate = 2 / $masaPakaiBulan;
                    $bebanPenyusutan = $nilaiBukuAwal * $rate;
                }

                // Pastikan beban tidak membuat nilai buku lebih rendah dari nilai sisa
                if (($nilaiBukuAwal - $bebanPenyusutan) < $asset->nilai_sisa) {
                    $bebanPenyusutan = $nilaiBukuAwal - $asset->nilai_sisa;
                }

                $akumulasiSebelumnya = $lastDepreciation ? $lastDepreciation->akumulasi_penyusutan : 0;
                $nilaiBukuBaru = $nilaiBukuAwal - $bebanPenyusutan;

                // 4. Catat ke Tabel asset_depreciation
                AssetDepreciation::create([
                    'asset_id' => $asset->id,
                    'periode' => $periodeBulanIni->format('Y-m-d'),
                    'nilai_awal_periode' => $nilaiBukuAwal,
                    'beban_penyusutan' => $bebanPenyusutan,
                    'akumulasi_penyusutan' => $akumulasiSebelumnya + $bebanPenyusutan,
                    'nilai_buku' => $nilaiBukuBaru,
                    'metode' => $metode,
                ]);

                $count++;
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Gagal menghitung penyusutan Aset ID {$asset->id}: " . $e->getMessage());
            }
        }

        return $count;
    }
}