<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index()
    {
        return response()->json(Department::orderBy('nama_departemen')->get());
    }

    public function store(Request $request)
    {
        $val = $request->validate([
            'kode_departemen' => 'required|unique:departments',
            'nama_departemen' => 'required',
            'deskripsi' => 'nullable'
        ]);
        
        return response()->json(Department::create($val), 201);
    }

    public function update(Request $request, $id)
    {
        $dep = Department::findOrFail($id);
        $val = $request->validate([
            'kode_departemen' => 'required|unique:departments,kode_departemen,'.$id,
            'nama_departemen' => 'required',
            'deskripsi' => 'nullable'
        ]);
        
        $dep->update($val);
        return response()->json($dep);
    }

    public function destroy($id)
    {
        Department::destroy($id);
        return response()->json(['message' => 'Departemen berhasil dihapus']);
    }
}