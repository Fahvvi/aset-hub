<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // <-- WAJIB TAMBAHKAN INI

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // PAKSA HTTPS AGAR NGROK & BROWSER HP TIDAK MEMBLOKIR SCRIPT
        if (config('app.env') !== 'local' || request()->header('x-forwarded-proto') === 'https') {
            URL::forceScheme('https');
        }
        
        // Atau jika ingin langsung dipaksa tanpa syarat (aman untuk testing Ngrok):
        // URL::forceScheme('https');
    }
}