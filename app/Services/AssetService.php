<?php

namespace App\Services;

use App\Repositories\AssetRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\Asset;
use Exception;

class AssetService
{
    protected $assetRepository;

    public function __construct(AssetRepository $assetRepository)
    {
        $this->assetRepository = $assetRepository;
    }

    public function getAllAssets()
    {
        $query = Asset::with(['category', 'location', 'vendor', 'department', 'user'])
                      ->where('status', '!=', 'disposal');

        $user = auth()->user();
        
        // RBAC: Jika yang login Staff, HANYA tampilkan aset dari departemennya sendiri
        if ($user && $user->role === 'staff' && $user->department_id) {
            $query->where('department_id', $user->department_id);
        }

        return $query->get();
    }
    public function getAssetById($id) { 
        return Asset::with(['category', 'location', 'vendor', 'department', 'user'])->findOrFail($id);
        }

    public function createAsset(array $data, $files = [])
    {
        DB::beginTransaction();
        try {
            // Set otomatis created_by dari user yang sedang login
            $data['created_by'] = auth()->id();
            
            $asset = $this->assetRepository->create($data);

            // Handle Upload Foto / Dokumen
            $this->handleFileUploads($asset, $files);

            DB::commit();
            return $asset;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateAsset($id, array $data, $files = [])
    {
        DB::beginTransaction();
        try {
            $data['updated_by'] = auth()->id();
            $asset = $this->assetRepository->update($id, $data);
            
            $this->handleFileUploads($asset, $files);

            DB::commit();
            return $asset;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteAsset($id) { return $this->assetRepository->delete($id); }

    // Fungsi bantuan untuk upload ke folder storage/app/public/assets/{id}/
    private function handleFileUploads($asset, $files)
    {
        if (isset($files['foto'])) {
            // 1. Cek dan hapus FOTO LAMA fisik dari folder (jika ada)
            if ($asset->foto && Storage::disk('public')->exists($asset->foto)) {
                Storage::disk('public')->delete($asset->foto);
            }

            // 2. Simpan FOTO BARU fisik ke folder
            $path = $files['foto']->store("assets/{$asset->id}", 'public');

            // 3. Simpan path foto ke dalam kolom 'foto' di tabel 'assets' langsung
            $asset->foto = $path;
            $asset->save();
        }
    }
}