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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('kode_aset', 30)->unique();
            $table->string('nama_aset', 150);

            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete(); 
            $table->foreignId('location_id')->constrained('locations')->restrictOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Penanggung jawab
            
            $table->string('nomor_seri', 100)->nullable()->comment('S/N dari pabrik');
            $table->string('nomor_rangka_mesin', 100)->nullable()->comment('Untuk kendaraan / mesin berat');
            $table->string('nomor_unique_lain', 100)->nullable()->comment('Nomor unik lain jika ada');

            $table->date('tanggal_pembelian');
            $table->date('tanggal_aktif');
            $table->integer('masa_pakai_tahun');
            $table->decimal('harga_perolehan', 15, 2);
            $table->decimal('nilai_sisa', 15, 2)->default(0);
            $table->integer('jumlah')->default(1);
            $table->string('satuan', 30)->default('unit');
            
            
            $table->enum('kondisi', ['baik', 'rusak_ringan', 'rusak_berat'])->default('baik');
            $table->enum('status', ['aktif', 'tidak_aktif', 'dalam_perbaikan', 'disposal'])->default('aktif');
            $table->text('keterangan')->nullable();
            $table->string('foto')->nullable();
            
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
