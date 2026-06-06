<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Location\StoreLocationRequest;
use App\Http\Requests\Location\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Services\LocationService;
use Illuminate\Database\QueryException; // <-- WAJIB TAMBAHKAN IMPORT INI

class LocationController extends Controller
{
    protected $locationService;

    public function __construct(LocationService $locationService)
    {
        $this->locationService = $locationService;
    }

    public function index() {
        return LocationResource::collection($this->locationService->getAllLocations());
    }

    public function store(StoreLocationRequest $request) {
        $location = $this->locationService->createLocation($request->validated());
        return new LocationResource($location);
    }

    public function show($id) {
        return new LocationResource($this->locationService->getLocationById($id));
    }

    public function update(UpdateLocationRequest $request, $id) {
        $location = $this->locationService->updateLocation($id, $request->validated());
        return new LocationResource($location);
    }

    public function destroy($id) {
        try {
            $this->locationService->deleteLocation($id);
            return response()->json(['message' => 'Lokasi berhasil dihapus']);
            
        } catch (QueryException $e) {
            // Menangkap error Foreign Key Constraint dari PostgreSQL (23001 atau 23503)
            if ($e->getCode() == '23001' || $e->getCode() == '23503') {
                return response()->json([
                    'message' => 'Lokasi tidak dapat dihapus karena masih ada Aset yang terdaftar di ruangan ini. Silakan pindahkan atau hapus aset terkait terlebih dahulu.'
                ], 400); // 400 Bad Request
            }
            
            // Jika ada error database lain
            return response()->json([
                'message' => 'Terjadi kesalahan pada database.',
                'error' => $e->getMessage()
            ], 500);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus lokasi.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}