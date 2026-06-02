<?php

namespace App\Services;

use App\Repositories\LocationRepository;
use Illuminate\Support\Facades\DB;
use Exception;

class LocationService
{
    protected $locationRepository;

    public function __construct(LocationRepository $locationRepository)
    {
        $this->locationRepository = $locationRepository;
    }

    public function getAllLocations() { return $this->locationRepository->getAll(); }
    public function getLocationById($id) { return $this->locationRepository->findById($id); }
    
    public function createLocation(array $data) {
        DB::beginTransaction();
        try {
            $location = $this->locationRepository->create($data);
            DB::commit();
            return $location;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateLocation($id, array $data) {
        DB::beginTransaction();
        try {
            $location = $this->locationRepository->update($id, $data);
            DB::commit();
            return $location;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteLocation($id) { return $this->locationRepository->delete($id); }
}