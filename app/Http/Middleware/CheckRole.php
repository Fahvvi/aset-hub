<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * $roles akan menerima parameter seperti 'superadmin,admin'
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Cek apakah role user ada di dalam daftar role yang diizinkan
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Forbidden. Anda tidak memiliki izin untuk mengakses aksi ini.'
            ], 403);
        }

        return $next($request);
    }
}