<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LocationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
        return [
            'id' => $this->id,
            'kode_lokasi' => $this->kode_lokasi,
            'nama_lokasi' => $this->nama_lokasi,
            'gedung' => $this->gedung,
            'lantai' => $this->lantai,
            'deskripsi' => $this->deskripsi,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
