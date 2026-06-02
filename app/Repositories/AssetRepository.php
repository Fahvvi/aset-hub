<?php

namespace App\Repositories;

use App\Models\Asset;

class AssetRepository
{
    public function getAll()
    {
        // Eager load relasi agar response API cepat dan lengkap
        return Asset::with(['category', 'location', 'vendor', 'user'])->orderBy('created_at', 'desc')->get();
    }

    public function findById($id)
    {
        return Asset::with(['category', 'location', 'vendor', 'user', 'documents'])->findOrFail($id);
    }

    public function create(array $data)
    {
        return Asset::create($data);
    }

    public function update($id, array $data)
    {
        $asset = $this->findById($id);
        $asset->update($data);
        return $asset;
    }

    public function delete($id)
    {
        $asset = $this->findById($id);
        return $asset->delete(); // Soft delete
    }
}