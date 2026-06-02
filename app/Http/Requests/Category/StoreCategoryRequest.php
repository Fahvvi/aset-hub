<?php

namespace App\Http\Requests\Category;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return true; } // Nanti disesuaikan dengan Policy
    public function rules(): array
    {
        return [
            'kode_kategori' => 'required|string|max:20|unique:categories,kode_kategori',
            'nama_kategori' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
            'metode_penyusutan' => 'required|in:straight_line,declining_balance',
            'umur_ekonomis_tahun' => 'required|integer|min:1',
            'nilai_sisa_persen' => 'required|numeric|min:0|max:100',
        ];
    }
}
