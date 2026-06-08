<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Asset\StoreAssetRequest;
use App\Http\Requests\Asset\UpdateAssetRequest;
use App\Http\Resources\AssetResource; // Abaikan jika Anda belum mengisi detail Resource ini
use App\Services\AssetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Asset;

class AssetController extends Controller
{
    protected $assetService;

    public function __construct(AssetService $assetService)
    {
        $this->assetService = $assetService;
    }

    public function index()
    {
        $assets = $this->assetService->getAllAssets();
        return AssetResource::collection($assets);
    }

    public function show($id)
    {
        $asset = $this->assetService->getAssetById($id);
        return new AssetResource($asset);
    }

    public function store(StoreAssetRequest $request)
    {
        $files = $request->only(['foto']);
        $asset = $this->assetService->createAsset($request->validated(), $files);
        return response()->json(['message' => 'Aset berhasil ditambahkan', 'data' => $asset], 201);
    }

    public function update(UpdateAssetRequest $request, $id)
    {
        $files = $request->only(['foto']);
        $asset = $this->assetService->updateAsset($id, $request->validated(), $files);
        return response()->json(['message' => 'Aset berhasil diupdate', 'data' => $asset]);
    }

    public function destroy($id)
    {
        $this->assetService->deleteAsset($id);
        return response()->json(['message' => 'Aset berhasil dihapus']);
    }

    public function scan($kode_aset)
    {
        $asset = \App\Models\Asset::with(['category', 'location', 'vendor', 'department', 'user'])
            ->where('kode_aset', $kode_aset)
            ->first();

        if (!$asset) {
            return response()->json(['message' => 'Aset tidak ditemukan atau kode tidak valid'], 404);
        }

        return new \App\Http\Resources\AssetResource($asset);
    }

    public function downloadTemplate()
    {
        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=template_import_aset.csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $columns = [
            'nama_aset',        // $row[0]
            'category_id',      // $row[1]
            'department_id',    // $row[2]
            'location_id',      // $row[3]
            'vendor_id',        // $row[4]
            'harga_perolehan',  // $row[5]
            'tanggal_pembelian',// $row[6]
            'tanggal_aktif',    // $row[7]
            'masa_pakai_tahun', // $row[8]
            'kondisi',          // $row[9]
            'status'            // $row[10]
        ];

        $callback = function() use($columns) {
            $file = fopen('php://output', 'w');
            
            // 1. Tulis Baris Header (Nama Kolom)
            fputcsv($file, $columns);
            
            // 2. Tulis Baris Contoh (Sebagai panduan user saat membuka Excel)
            // INGAT: Kolom ID (Kategori, Dept, Lokasi, Vendor) HARUS ANGKA, bukan teks!
            fputcsv($file, [
                'Asus Vivobook Go 14', // nama_aset
                '1',                   // category_id (Angka)
                '1',                   // department_id (Angka)
                '1',                   // location_id (Angka)
                '1',                   // vendor_id (Angka, kosongkan jika tidak ada)
                '20000000',            // harga_perolehan (Tanpa titik/koma)
                '2026-06-05',          // tanggal_pembelian (YYYY-MM-DD)
                '2026-06-08',          // tanggal_aktif (YYYY-MM-DD)
                '5',                   // masa_pakai_tahun
                'baik',                // kondisi (baik, rusak_ringan, rusak_berat)
                'aktif'                // status (aktif, tidak_aktif)
            ]);
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Memproses file CSV dan mendaftarkannya ke database secara massal
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        
        // Lewati baris pertama (header)
        fgetcsv($handle, 1000, ',');
        
        DB::beginTransaction();
        try {
            $tahun = date('Y');
            while (($row = fgetcsv($handle, 1000, ',')) !== FALSE) {
                if (empty($row[0])) continue;

                // Hitung kode unik otomatis bulanan/tahunan (Anti Bentrok)
                $asetTerakhir = \App\Models\Asset::where('kode_aset', 'like', "SDI-{$tahun}-%")
                    ->orderBy('id', 'desc')
                    ->first();
                $urutan = 1;
                if ($asetTerakhir) {
                    $parts = explode('-', $asetTerakhir->kode_aset);
                    $urutan = (int) end($parts) + 1;
                }
                $kodeAset = 'SDI-' . $tahun . '-' . str_pad($urutan, 4, '0', STR_PAD_LEFT);

                \App\Models\Asset::create([
                    'kode_aset'         => $kodeAset,
                    'nama_aset'         => $row[0],
                    'category_id'       => (int)$row[1],
                    'department_id'     => (int)$row[2],
                    'location_id'       => (int)$row[3],
                    'vendor_id'         => !empty($row[4]) ? (int)$row[4] : null,
                    'harga_perolehan'   => (float)$row[5],
                    'tanggal_pembelian' => $row[6],
                    'tanggal_aktif'     => $row[7],
                    'masa_pakai_tahun'  => (int)$row[8],
                    'kondisi'           => !empty($row[9]) ? $row[9] : 'baik',
                    'status'            => !empty($row[10]) ? $row[10] : 'aktif',
                    'created_by'        => auth()->id()
                ]);
            }
            DB::commit();
            fclose($handle);
            return response()->json(['message' => 'Seluruh data aset dalam dokumen berhasil di-import ke sistem.']);
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            return response()->json(['message' => 'Gagal memproses import dokumen', 'error' => $e->getMessage()], 500);
        }
    }
}