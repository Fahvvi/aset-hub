<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('asset_requests', function (Blueprint $table) {
            $table->id();
            $table->string('kode_pengajuan', 30)->unique();
            $table->foreignId('requester_id')->constrained('users');
            $table->foreignId('department_id')->constrained('departments');
            
            $table->string('nama_aset_diminta');
            $table->text('spesifikasi_kebutuhan');
            $table->text('alasan');
            $table->decimal('estimasi_harga', 15, 2)->default(0);
            $table->enum('tingkat_urgensi', ['rendah', 'sedang', 'tinggi'])->default('sedang');
            
            $table->enum('status', ['pending', 'disetujui', 'ditolak', 'selesai'])->default('pending');
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users');
            $table->text('catatan_admin')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_requests');
    }
};
