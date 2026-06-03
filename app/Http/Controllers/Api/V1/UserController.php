<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Menampilkan daftar pengguna.
     */
    public function index(Request $request)
    {
        $query = User::orderBy('nama', 'asc');
        $query = User::with('department')->orderBy('nama', 'asc');

        // Jika request meminta hanya user yang aktif (biasanya untuk dropdown form)
        if ($request->has('active_only') && $request->active_only == 'true') {
            $query->where('is_active', true);
        }

        return response()->json($query->get());
    }

    /**
     * Menyimpan pengguna baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|max:100|unique:users,email',
            'department_id' => 'required|exists:departments,id',
            'password' => 'required|string|min:8',
            'role' => 'required|in:superadmin,admin,staff',
            'is_active' => 'required|boolean',
        ]);

        // Enkripsi kata sandi sebelum disimpan
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => 'Pengguna berhasil ditambahkan', 
            'data' => $user
        ], 201);
    }

    /**
     * Mengambil satu data pengguna spesifik.
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Memperbarui data pengguna.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'nama' => 'required|string|max:100',
            // Validasi unique mengecualikan ID user yang sedang diupdate
            'username' => 'required|string|max:50|unique:users,username,' . $user->id,
            'email' => 'required|email|max:100|unique:users,email,' . $user->id,
            'department_id' => 'required|exists:departments,id',
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:superadmin,admin,staff',
            'is_active' => 'required|boolean',
        ]);

        // Jika password diisi, enkripsi dan simpan. Jika kosong, abaikan.
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Data pengguna berhasil diperbarui', 
            'data' => $user
        ]);
    }

    /**
     * Menghapus pengguna.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Proteksi: Mencegah pengguna menghapus akunnya sendiri
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.'
            ], 400);
        }

        $user->delete();

        return response()->json(['message' => 'Pengguna berhasil dihapus']);
    }
}