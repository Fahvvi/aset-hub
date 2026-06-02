<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\StoreVendorRequest;
use App\Http\Requests\Vendor\UpdateVendorRequest;
use App\Http\Resources\VendorResource;
use App\Services\VendorService;

class VendorController extends Controller
{
    protected $vendorService;

    public function __construct(VendorService $vendorService)
    {
        $this->vendorService = $vendorService;
    }

    public function index() {
        return VendorResource::collection($this->vendorService->getAllVendors());
    }

    public function store(StoreVendorRequest $request) {
        $vendor = $this->vendorService->createVendor($request->validated());
        return new VendorResource($vendor);
    }

    public function show($id) {
        return new VendorResource($this->vendorService->getVendorById($id));
    }

    public function update(UpdateVendorRequest $request, $id) {
        $vendor = $this->vendorService->updateVendor($id, $request->validated());
        return new VendorResource($vendor);
    }

    public function destroy($id) {
        $this->vendorService->deleteVendor($id);
        return response()->json(['message' => 'Vendor berhasil dihapus']);
    }
}