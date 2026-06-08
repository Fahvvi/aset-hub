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
        Schema::create('asset_disposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->date('tanggal_disposal');
            $table->enum('metode_disposal', ['dijual', 'dihapus', 'dihibahkan', 'rusak_total']);
            $table->decimal('nilai_disposal', 15, 2)->default(0);
            $table->text('alasan');
            $table->foreignId('disetujui_oleh')->nullable()->constrained('users');
            $table->string('dokumen_referensi', 100)->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_disposals');
    }
};
