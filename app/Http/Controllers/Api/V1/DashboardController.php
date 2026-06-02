<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetDepreciation;
use App\Models\Maintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary()
    {
        // 1. Statistik Angka Utama (Metric Cards)
        $totalAsetAktif = Asset::where('status', 'aktif')->count();
        $asetDalamPerbaikan = Asset::where('status', 'dalam_perbaikan')->count();
        
        // Menghitung Total Nilai Aset (berdasarkan harga perolehan untuk aset aktif)
        $totalNilaiAset = Asset::where('status', 'aktif')->sum('harga_perolehan');
        
        // Menghitung Nilai Buku Terkini (jika penyusutan sudah pernah dijalankan)
        // Jika belum ada data penyusutan, gunakan harga perolehan awal
        $totalPenyusutan = AssetDepreciation::sum('beban_penyusutan'); // Simplifikasi
        $totalNilaiBuku = $totalNilaiAset - $totalPenyusutan;

        // 2. Data Grafik: Distribusi Aset Berdasarkan Kategori
        $asetPerKategori = DB::table('assets')
            ->join('categories', 'assets.category_id', '=', 'categories.id')
            ->select('categories.nama_kategori as name', DB::raw('count(assets.id) as total'))
            ->whereNull('assets.deleted_at')
            ->where('assets.status', '!=', 'disposal')
            ->groupBy('categories.nama_kategori')
            ->get();

        // 3. Alerts: Pemeliharaan (Maintenance) yang belum selesai
        $maintenancePending = Maintenance::with(['asset:id,nama_aset,kode_aset', 'requester:id,nama'])
            ->whereIn('status', ['pending', 'diproses'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // 4. Riwayat Penambahan Aset Terbaru
        $asetTerbaru = Asset::with('category:id,nama_kategori')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'kode_aset', 'nama_aset', 'harga_perolehan', 'created_at', 'category_id']);

        return response()->json([
            'metrics' => [
                'total_aset' => $totalAsetAktif,
                'aset_rusak' => $asetDalamPerbaikan,
                'total_nilai_aset' => $totalNilaiAset,
                'total_nilai_buku' => $totalNilaiBuku,
            ],
            'chart_kategori' => $asetPerKategori,
            'alerts_maintenance' => $maintenancePending,
            'aset_terbaru' => $asetTerbaru,
        ]);
    }
}