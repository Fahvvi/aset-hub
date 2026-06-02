<?php

namespace App\Repositories;

use App\Models\Vendor;

class VendorRepository
{
    public function getAll() { return Vendor::orderBy('created_at', 'desc')->get(); }
    public function findById($id) { return Vendor::findOrFail($id); }
    public function create(array $data) { return Vendor::create($data); }
    public function update($id, array $data) {
        $vendor = $this->findById($id);
        $vendor->update($data);
        return $vendor;
    }
    public function delete($id) {
        $vendor = $this->findById($id);
        return $vendor->delete();
    }
}