<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssetTransfer;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Transfer\StoreTransferRequest;

class TransferController extends Controller
{
    public function index()
{
    $transfers = \App\Models\AssetTransfer::with([
        'asset', 
        'dariLokasi', 
        'keLokasi', 
        'dariUser', 
        'keUser'
    ])->orderBy('created_at', 'desc')->get();

    return response()->json($transfers);
}

    public function store(StoreTransferRequest $request)
    {
        $validated = $request->validated();
        $asset = Asset::findOrFail($validated['asset_id']);

        // Ambil data lokasi & user saat ini dari aset
        $validated['dari_location_id'] = $asset->location_id;
        $validated['dari_user_id'] = $asset->user_id;
        $validated['status'] = 'pending';
        // Opsional: jika tabel transfer punya kolom created_by
        // $validated['created_by'] = auth()->id(); 

        $transfer = AssetTransfer::create($validated);

        return response()->json(['message' => 'Pengajuan transfer berhasil dibuat', 'data' => $transfer], 201);
    }

    public function approve($id)
    {
        DB::beginTransaction();
        try {
            $transfer = AssetTransfer::findOrFail($id);
            if ($transfer->status !== 'pending') {
                return response()->json(['message' => 'Hanya pengajuan pending yang bisa disetujui'], 400);
            }

            // 1. Update status transfer
            $transfer->update([
                'status' => 'disetujui',
                'disetujui_oleh' => auth()->id()
            ]);

            // 2. Update data Aset utama
            $transfer->asset->update([
                'location_id' => $transfer->ke_location_id,
                'user_id' => $transfer->ke_user_id
            ]);

            DB::commit();
            return response()->json(['message' => 'Transfer disetujui dan aset berhasil dipindahkan']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Terjadi kesalahan sistem'], 500);
        }
    }

    public function reject($id)
    {
        $transfer = AssetTransfer::findOrFail($id);
        $transfer->update([
            'status' => 'ditolak',
            'disetujui_oleh' => auth()->id() ?? 1
        ]);
        return response()->json(['message' => 'Pengajuan transfer ditolak']);
    }
}