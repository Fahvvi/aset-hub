<?php

namespace App\Http\Requests\Disposal;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Asset;

class StoreDisposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'asset_id' => [
                'required',
                'exists:assets,id',
                // Custom rule: Proteksi status aset
                function ($attribute, $value, $fail) {
                    $asset = Asset::find($value);
                    if ($asset) {
                        if ($asset->status === 'disposal') {
                            $fail('Aset ini sudah dalam status disposal.');
                        }
                        if ($asset->status === 'dalam_perbaikan') {
                            $fail('Aset sedang dalam perbaikan teknisi. Selesaikan atau batalkan pemeliharaan terlebih dahulu sebelum melakukan disposal.');
                        }
                    }
                },
            ],
            'tanggal_disposal' => 'required|date',
            'metode_disposal' => 'required|in:dijual,dihapus,dihibahkan,rusak_total',
            'nilai_disposal' => 'nullable|numeric|min:0',
            'alasan' => 'required|string',
            'dokumen_referensi' => 'nullable|string'
        ];
    }
}