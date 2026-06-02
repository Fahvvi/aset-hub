<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetDepreciation;
use App\Models\AssetTransfer;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    // 1. Laporan Daftar Aset & Penggunaannya Saat Ini
    public function assetUsage(Request $request)
    {
        $assets = Asset::with(['category', 'location', 'user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($asset) {
                return [
                    'kode_aset' => $asset->kode_aset,
                    'nama_aset' => $asset->nama_aset,
                    'kategori' => $asset->category->nama_kategori ?? '-',
                    'lokasi' => $asset->location->nama_lokasi ?? '-',
                    'penanggung_jawab' => $asset->user->nama ?? 'TIDAK ADA / BEBAS',
                    'tanggal_aktif' => $asset->tanggal_aktif,
                    'kondisi' => $asset->kondisi,
                    'status' => $asset->status,
                ];
            });

        return response()->json($assets);
    }

    // 2. Laporan Histori Pemegang Aset (Mutasi/Transfer)
    public function assetHoldersHistory(Request $request)
    {
        // Mengambil dari riwayat transfer yang sudah disetujui
        $history = AssetTransfer::with(['asset', 'dariUser', 'keUser', 'dariLokasi', 'keLokasi'])
            ->where('status', 'disetujui')
            ->orderBy('tanggal_transfer', 'desc')
            ->get()
            ->map(function ($transfer) {
                return [
                    'kode_aset' => $transfer->asset->kode_aset ?? '-',
                    'nama_aset' => $transfer->asset->nama_aset ?? '-',
                    'tanggal_pindah' => $transfer->tanggal_transfer,
                    'dari_lokasi' => $transfer->dariLokasi->nama_lokasi ?? '-',
                    'ke_lokasi' => $transfer->keLokasi->nama_lokasi ?? '-',
                    'pemegang_lama' => $transfer->dariUser->nama ?? 'Tidak Ada',
                    'pemegang_baru' => $transfer->keUser->nama ?? 'Tidak Ada',
                    'alasan' => $transfer->alasan
                ];
            });

        return response()->json($history);
    }

    // 3. Laporan Nilai Aset & Penyusutan
    public function assetDepreciation(Request $request)
    {
        $assets = Asset::with(['category', 'depreciations' => function($q) {
            $q->orderBy('periode', 'desc'); // Ambil histori penyusutan yang paling terbaru
        }])
        ->where('status', '!=', 'disposal') // Jangan tampilkan yang sudah dihapus
        ->get()
        ->map(function ($asset) {
            // Ambil record penyusutan terakhir
            $lastDep = $asset->depreciations->first();
            
            return [
                'kode_aset' => $asset->kode_aset,
                'nama_aset' => $asset->nama_aset,
                'kategori' => $asset->category->nama_kategori ?? '-',
                'harga_perolehan' => (float) $asset->harga_perolehan, // Paksa jadi angka
                'akumulasi_penyusutan' => $lastDep ? (float) $lastDep->akumulasi_penyusutan : 0,
                'nilai_buku_sekarang' => $lastDep ? (float) $lastDep->nilai_buku : (float) $asset->harga_perolehan,
                'periode_terakhir' => $lastDep ? $lastDep->periode : 'Aset Baru / Belum Disusutkan'
            ];
        });

        return response()->json($assets);
    }
}