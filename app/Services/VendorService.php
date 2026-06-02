<?php

namespace App\Services;

use App\Repositories\VendorRepository;
use Illuminate\Support\Facades\DB;
use Exception;

class VendorService
{
    protected $vendorRepository;

    public function __construct(VendorRepository $vendorRepository)
    {
        $this->vendorRepository = $vendorRepository;
    }

    public function getAllVendors() { return $this->vendorRepository->getAll(); }
    public function getVendorById($id) { return $this->vendorRepository->findById($id); }
    
    public function createVendor(array $data) {
        DB::beginTransaction();
        try {
            $vendor = $this->vendorRepository->create($data);
            DB::commit();
            return $vendor;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateVendor($id, array $data) {
        DB::beginTransaction();
        try {
            $vendor = $this->vendorRepository->update($id, $data);
            DB::commit();
            return $vendor;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteVendor($id) { return $this->vendorRepository->delete($id); }
}