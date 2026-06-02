<?php

namespace App\Repositories;

use App\Models\Location;

class LocationRepository
{
    public function getAll() { return Location::orderBy('created_at', 'desc')->get(); }
    public function findById($id) { return Location::findOrFail($id); }
    public function create(array $data) { return Location::create($data); }
    public function update($id, array $data) {
        $location = $this->findById($id);
        $location->update($data);
        return $location;
    }
    public function delete($id) {
        $location = $this->findById($id);
        return $location->delete();
    }
}