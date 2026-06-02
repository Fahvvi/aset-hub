<?php

namespace App\Http\Requests\Category;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool { return true; }
    public function rules(): array
    {
        return [
            'kode_kategori' => 'sometimes|required|string|max:20|unique:categories,kode_kategori,' . $this->route('category'),
            'nama_kategori' => 'sometimes|required|string|max:100',
            'deskripsi' => 'nullable|string',
            'metode_penyusutan' => 'sometimes|required|in:straight_line,declining_balance',
            'umur_ekonomis_tahun' => 'sometimes|required|integer|min:1',
            'nilai_sisa_persen' => 'sometimes|required|numeric|min:0|max:100',
        ];
    }
}
