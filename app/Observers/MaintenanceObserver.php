<?php

namespace App\Observers;

use App\Models\Maintenance;

class MaintenanceObserver
{
    public function creating(Maintenance $maintenance): void
    {
        // 1. Auto-generate kode MNT
        if (empty($maintenance->kode_maintenance)) {
            $tahun = date('Y');
            $last = Maintenance::where('kode_maintenance', 'like', "MNT-{$tahun}-%")->orderBy('kode_maintenance', 'desc')->first();
            $newNumber = $last ? str_pad(intval(substr($last->kode_maintenance, -4)) + 1, 4, '0', STR_PAD_LEFT) : '0001';
            $maintenance->kode_maintenance = "MNT-{$tahun}-{$newNumber}";
        }

        // 2. Jika baru dibuat, pastikan statusnya pending
        if (empty($maintenance->status)) {
            $maintenance->status = 'pending';
        }
    }

    public function updated(Maintenance $maintenance): void
    {
        // Jika status berubah menjadi selesai, otomatis perbaiki status aset utama
        if ($maintenance->isDirty('status') && $maintenance->status === 'selesai') {
            if ($maintenance->asset) {
                $maintenance->asset->update([
                    'kondisi' => 'baik',
                    'status' => 'aktif'
                ]);
            }
        }
    }
}