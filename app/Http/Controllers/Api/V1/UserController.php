<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        // Hanya ambil user yang aktif untuk pilihan dropdown
        $users = User::where('is_active', true)
                     ->orderBy('nama', 'asc')
                     ->get(['id', 'nama', 'role']);
                     
        return response()->json($users);
    }
}