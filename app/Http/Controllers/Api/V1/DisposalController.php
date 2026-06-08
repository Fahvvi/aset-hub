<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssetDisposal;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Disposal\StoreDisposalRequest;

class DisposalController extends Controller
{
    public function index()
    {
        $disposals = AssetDisposal::with(['asset', 'creator', 'approver'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($disposals);
    }

    public function store(StoreDisposalRequest $request)
    {
        $validated = $request->validated();

        $validated['created_by'] = auth()->id();
        $validated['status'] = 'pending'; 

        $disposal = AssetDisposal::create($validated);
        
        return response()->json(['message' => 'Pengajuan disposal berhasil dibuat', 'data' => $disposal], 201);
    }

    public function approve($id)
    {
        DB::beginTransaction();
        try {
            // Tambahkan with('asset') untuk memastikan relasi aset ikut terbaca
            $disposal = AssetDisposal::with('asset')->findOrFail($id);
            
            if ($disposal->status !== 'pending') {
                return response()->json(['message' => 'Pengajuan ini sudah diproses.'], 400);
            }

            // 1. Update status disposal
            $disposal->update([
                'status' => 'disetujui',
                'disetujui_oleh' => auth()->id() ?? 1
            ]);

            // 2. Kunci Aset & ubah statusnya menjadi disposal
            if ($disposal->asset) {
                $disposal->asset->update([
                    'status' => 'disposal',
                    'kondisi' => 'rusak_berat' // Asumsi dasar, bisa disesuaikan
                ]);
            } else {
                throw new \Exception("Aset terkait tidak ditemukan di database!");
            }

            DB::commit();
            return response()->json(['message' => 'Disposal disetujui. Aset telah dihapus dari peredaran.']);
        } catch (\Exception $e) {
            DB::rollBack();
            
            // --- INI KUNCI UTAMANYA: Tampilkan error asli ---
            return response()->json([
                'message' => 'Terjadi kesalahan sistem', 
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function reject($id)
    {
        $disposal = AssetDisposal::findOrFail($id);
        $disposal->update([
            'status' => 'ditolak',
            'disetujui_oleh' => auth()->id() ?? 1
        ]);
        return response()->json(['message' => 'Pengajuan disposal ditolak']);
    }
}