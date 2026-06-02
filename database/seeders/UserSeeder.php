<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nama' => 'Super Administrator',
            'username' => 'superadmin',
            'email' => 'admin@aset.local',
            'password' => Hash::make('password'),
            'role' => 'superadmin', // Role tertinggi sesuai matrix
            'is_active' => true,
        ]);
    }
}