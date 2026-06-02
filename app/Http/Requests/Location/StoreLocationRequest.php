<?php

namespace App\Http\Requests\Location;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLocationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return true; }
    public function rules(): array {
        return [
            'kode_lokasi' => 'required|string|max:20|unique:locations,kode_lokasi',
            'nama_lokasi' => 'required|string|max:100',
            'gedung' => 'nullable|string|max:100',
            'lantai' => 'nullable|string|max:20',
            'deskripsi' => 'nullable|string',
        ];
    }
}
