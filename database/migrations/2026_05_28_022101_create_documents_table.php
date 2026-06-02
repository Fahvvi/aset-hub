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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->morphs('documentable'); // Otomatis membuat documentable_type & documentable_id
            $table->string('nama_file', 255);
            $table->enum('tipe_dokumen', ['foto', 'faktur', 'garansi', 'sk', 'berita_acara', 'lainnya']);
            $table->string('path', 500);
            $table->integer('ukuran_kb');
            $table->string('mime_type', 100);
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
