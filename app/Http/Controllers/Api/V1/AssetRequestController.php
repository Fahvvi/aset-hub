<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssetRequest;
use Illuminate\Http\Request;

class AssetRequestController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $query = AssetRequest::with(['requester', 'department', 'approver'])->orderBy('created_at', 'desc');
        
        // Staff hanya melihat pengajuannya sendiri
        if ($user->role === 'staff') {
            $query->where('requester_id', $user->id);
        }
        
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $val = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'nama_aset_diminta' => 'required|string',
            'spesifikasi_kebutuhan' => 'required|string',
            'alasan' => 'required|string',
            'estimasi_harga' => 'required|numeric|min:0',
            'tingkat_urgensi' => 'required|in:rendah,sedang,tinggi'
        ]);
        
        $val['requester_id'] = auth()->id();
        $val['kode_pengajuan'] = 'REQ-' . date('Ym') . '-' . rand(1000, 9999);
        
        return response()->json(AssetRequest::create($val), 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $req = AssetRequest::findOrFail($id);
        $val = $request->validate([
            'status' => 'required|in:disetujui,ditolak,selesai',
            'catatan_admin' => 'nullable|string'
        ]);
        
        $val['disetujui_oleh'] = auth()->id();
        $req->update($val);
        
        return response()->json(['message' => 'Status pengajuan diubah', 'data' => $req]);
    }
}