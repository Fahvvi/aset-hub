<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssetDisposal;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DisposalController extends Controller
{
    public function index()
    {
        $disposals = AssetDisposal::with(['asset', 'creator', 'approver'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($disposals);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'tanggal_disposal' => 'required|date',
            'metode_disposal' => 'required|in:dijual,dihapus,dihibahkan,rusak_total',
            'nilai_disposal' => 'nullable|numeric|min:0',
            'alasan' => 'required|string',
            'dokumen_referensi' => 'nullable|string'
        ]);

        // Cek apakah aset sudah didisposal
        $asset = Asset::findOrFail($validated['asset_id']);
        if ($asset->status === 'disposal') {
            return response()->json(['message' => 'Aset ini sudah dalam status disposal.'], 400);
        }

        $validated['created_by'] = auth()->id() ?? 1;
        
        // Kita asumsikan ada kolom status (pending/disetujui/ditolak) di tabel asset_disposals
        $validated['status'] = 'pending'; 

        $disposal = AssetDisposal::create($validated);
        return response()->json(['message' => 'Pengajuan disposal berhasil dibuat', 'data' => $disposal], 201);
    }

    public function approve($id)
    {
        DB::beginTransaction();
        try {
            $disposal = AssetDisposal::findOrFail($id);
            if ($disposal->status !== 'pending') {
                return response()->json(['message' => 'Pengajuan ini sudah diproses.'], 400);
            }

            // 1. Update status disposal
            $disposal->update([
                'status' => 'disetujui',
                'disetujui_oleh' => auth()->id() ?? 1
            ]);

            // 2. Kunci Aset & ubah statusnya menjadi disposal
            $disposal->asset->update([
                'status' => 'disposal',
                'kondisi' => 'rusak_berat' // Asumsi dasar, bisa disesuaikan
            ]);

            DB::commit();
            return response()->json(['message' => 'Disposal disetujui. Aset telah dihapus dari peredaran.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan sistem'], 500);
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