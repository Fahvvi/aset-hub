<?php

namespace App\Services;

use App\Repositories\AssetRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class AssetService
{
    protected $assetRepository;

    public function __construct(AssetRepository $assetRepository)
    {
        $this->assetRepository = $assetRepository;
    }

    public function getAllAssets() { return $this->assetRepository->getAll(); }
    public function getAssetById($id) { return $this->assetRepository->findById($id); }

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
            $path = $files['foto']->store("assets/{$asset->id}", 'public');
            $asset->documents()->create([
                'nama_file' => $files['foto']->getClientOriginalName(),
                'tipe_dokumen' => 'foto',
                'path' => $path,
                'ukuran_kb' => round($files['foto']->getSize() / 1024),
                'mime_type' => $files['foto']->getMimeType(),
                'uploaded_by' => auth()->id(),
            ]);
        }
    }
}