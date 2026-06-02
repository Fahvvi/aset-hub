<?php

namespace App\Observers;

use App\Models\Asset;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

class AssetObserver
{
    // Berjalan SEBELUM data disimpan (untuk generate kode)
    public function creating(Asset $asset): void
    {
        if (empty($asset->kode_aset)) {
            $tahun = date('Y');
            $lastAsset = Asset::where('kode_aset', 'like', "SDI-{$tahun}-%")->orderBy('kode_aset', 'desc')->first();
            $newNumber = $lastAsset ? str_pad(intval(substr($lastAsset->kode_aset, -4)) + 1, 4, '0', STR_PAD_LEFT) : '0001';
            $asset->kode_aset = "SDI-{$tahun}-{$newNumber}";
        }
    }

    // Berjalan SETELAH data berhasil dibuat
    public function created(Asset $asset): void
    {
        $this->recordLog($asset, 'create', null, $asset->toArray());
    }

    // Berjalan SETELAH data berhasil diupdate
    public function updated(Asset $asset): void
    {
        // Hanya catat kolom yang benar-benar berubah
        $bawaan = $asset->getOriginal();
        $perubahan = $asset->getChanges();
        
        $this->recordLog($asset, 'update', $bawaan, $perubahan);
    }

    // Berjalan SETELAH data dihapus (Soft Delete)
    public function deleted(Asset $asset): void
    {
        $this->recordLog($asset, 'delete', $asset->toArray(), null);
    }

    // Fungsi bantuan penyimpan log
    private function recordLog(Asset $asset, string $action, $nilaiLama, $nilaiBaru): void
    {
        AuditLog::create([
            'user_id' => auth()->id(), // Siapa yang melakukan aksi
            'action' => $action,
            'auditable_type' => Asset::class,
            'auditable_id' => $asset->id,
            'nilai_lama' => $nilaiLama ? json_encode($nilaiLama) : null,
            'nilai_baru' => $nilaiBaru ? json_encode($nilaiBaru) : null,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}