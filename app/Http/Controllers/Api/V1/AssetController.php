<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Asset\StoreAssetRequest;
use App\Http\Requests\Asset\UpdateAssetRequest;
use App\Http\Resources\AssetResource; // Abaikan jika Anda belum mengisi detail Resource ini
use App\Services\AssetService;

class AssetController extends Controller
{
    protected $assetService;

    public function __construct(AssetService $assetService)
    {
        $this->assetService = $assetService;
    }

    public function index()
    {
        $assets = $this->assetService->getAllAssets();
        return AssetResource::collection($assets);
    }

    public function show($id)
    {
        $asset = $this->assetService->getAssetById($id);
        return new AssetResource($asset);
    }

    public function store(StoreAssetRequest $request)
    {
        $files = $request->only(['foto']);
        $asset = $this->assetService->createAsset($request->validated(), $files);
        return response()->json(['message' => 'Aset berhasil ditambahkan', 'data' => $asset], 201);
    }

    public function update(UpdateAssetRequest $request, $id)
    {
        $files = $request->only(['foto']);
        $asset = $this->assetService->updateAsset($id, $request->validated(), $files);
        return response()->json(['message' => 'Aset berhasil diupdate', 'data' => $asset]);
    }

    public function destroy($id)
    {
        $this->assetService->deleteAsset($id);
        return response()->json(['message' => 'Aset berhasil dihapus']);
    }
}