<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Maintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MaintenanceController extends Controller
{
    public function index()
    {
        // Eager load relasi untuk dikirim ke React
        $maintenances = Maintenance::with(['asset', 'requester', 'handler'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($maintenances);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'tipe' => 'required|in:preventif,korektif',
            'tanggal_laporan' => 'required|date',
            'deskripsi_kerusakan' => 'required|string',
            'keterangan' => 'nullable|string',
        ]);

        // Otomatis set requested_by ke user yang sedang login
        $validated['requested_by'] = auth()->id(); // 1 sebagai fallback sementara jika auth belum ketat

        DB::beginTransaction();
        try {
            $maintenance = Maintenance::create($validated);
            
            // Otomatis ubah status aset menjadi 'dalam_perbaikan'
            $maintenance->asset->update(['status' => 'dalam_perbaikan']);
            
            DB::commit();
            return response()->json(['message' => 'Laporan pemeliharaan berhasil dibuat', 'data' => $maintenance], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal membuat laporan', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $maintenance = Maintenance::with(['asset', 'requester', 'handler'])->findOrFail($id);
        return response()->json($maintenance);
    }

    public function update(Request $request, $id)
    {
        $maintenance = Maintenance::findOrFail($id);
        
        $validated = $request->validate([
            'handled_by' => 'nullable|exists:users,id',
            'tanggal_mulai' => 'nullable|date',
            'tanggal_selesai' => 'nullable|date',
            'tindakan_perbaikan' => 'nullable|string',
            'biaya_perbaikan' => 'nullable|numeric|min:0',
            'status' => 'required|in:pending,diproses,selesai,dibatalkan',
        ]);

        $maintenance->update($validated); // Akan men-trigger Observer jika status=selesai

        return response()->json(['message' => 'Data pemeliharaan berhasil diperbarui', 'data' => $maintenance]);
    }

    public function destroy($id)
    {
        Maintenance::destroy($id);
        return response()->json(['message' => 'Data pemeliharaan berhasil dihapus']);
    }
}