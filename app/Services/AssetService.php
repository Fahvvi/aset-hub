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
        return Asset::with(['category', 'location', 'vendor', 'department', 'user', 'maintenances.vendor',
            'transfers.dariLokasi', 
            'transfers.keLokasi', 
            'transfers.keUser',
            'transfers.dariUser'])->findOrFail($id);
        }

    public function createAsset(array $data, $files = [])
    {
        DB::beginTransaction();
        try {
            // Set ID pembuat aset
            $data['created_by'] = auth()->id();
            
            // Cegah Eloquent menyimpan path .tmp dari file upload
            if (isset($data['foto'])) {
                unset($data['foto']);
            }
            
            // =======================================================
            // MESIN GENERATOR KODE ASET OTOMATIS (SDI-YYYY-XXXX)
            // =======================================================
            if (empty($data['kode_aset'])) {
                $tahun = date('Y'); // Mengambil tahun saat ini (misal: 2026)
                
                // Cari aset terakhir di tahun yang sama
                $asetTerakhir = \App\Models\Asset::where('kode_aset', 'like', "SDI-{$tahun}-%")
                                                 ->orderBy('id', 'desc')
                                                 ->first();
                $urutan = 1;
                
                // Jika sudah ada aset sebelumnya, ambil angka terakhir dan tambah 1
                if ($asetTerakhir) {
                    $parts = explode('-', $asetTerakhir->kode_aset);
                    $urutan = (int) end($parts) + 1;
                }
                
                // Format kode: SDI-2026-0001
                $data['kode_aset'] = 'SDI-' . $tahun . '-' . str_pad($urutan, 4, '0', STR_PAD_LEFT);
            }
            // =======================================================

            // Simpan ke database (Sekarang $data['kode_aset'] sudah pasti ada isinya!)
            $asset = $this->assetRepository->create($data);

            // Handle Upload Foto
            $this->handleFileUploads($asset, $files);

            DB::commit();
            
            return $asset->refresh(); 
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
            
            // CEGAH ELOQUENT MENYIMPAN PATH .TMP
            if (isset($data['foto'])) {
                unset($data['foto']);
            }
            
            $asset = $this->assetRepository->update($id, $data);
            
            // Handle Upload Foto
            $this->handleFileUploads($asset, $files);

            DB::commit();
            
            // Wajib refresh agar API memuat path foto terbaru dari Database
            return $asset->refresh(); 
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