<?php

namespace App\Http\Requests\Transfer;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Asset;

class StoreTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Otorisasi sudah ditangani oleh Middleware RBAC kita
    }

    public function rules(): array
    {
        return [
            'asset_id' => 'required|exists:assets,id',
            'ke_location_id' => [
                'required',
                'exists:locations,id',
                // Custom rule: Cek agar tidak pindah ke lokasi yang sama
                function ($attribute, $value, $fail) {
                    $asset = Asset::find($this->asset_id);
                    if ($asset && $asset->location_id == $value) {
                        $fail('Lokasi tujuan tidak boleh sama dengan lokasi aset saat ini.');
                    }
                },
            ],
            'ke_user_id' => 'nullable|exists:users,id',
            'tanggal_transfer' => 'required|date',
            'alasan' => 'required|string',
        ];
    }
}