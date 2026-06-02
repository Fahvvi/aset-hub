<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'kode_vendor' => $this->kode_vendor,
            'nama_vendor' => $this->nama_vendor,
            'kontak_person' => $this->kontak_person,
            'telepon' => $this->telepon,
            'email' => $this->email,
            'alamat' => $this->alamat,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }   
}
