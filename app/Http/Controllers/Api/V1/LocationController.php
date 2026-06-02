<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Location\StoreLocationRequest;
use App\Http\Requests\Location\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Services\LocationService;

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
        $this->locationService->deleteLocation($id);
        return response()->json(['message' => 'Lokasi berhasil dihapus']);
    }
}