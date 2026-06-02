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
        Schema::create('asset_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('dari_location_id')->constrained('locations');
            $table->foreignId('ke_location_id')->constrained('locations');
            $table->foreignId('dari_user_id')->nullable()->constrained('users'); // PJ Lama
            $table->foreignId('ke_user_id')->nullable()->constrained('users'); // PJ Baru
            $table->date('tanggal_transfer');
            $table->text('alasan');
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users');
            $table->enum('status', ['pending', 'disetujui', 'ditolak'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_transfers');
    }
};
