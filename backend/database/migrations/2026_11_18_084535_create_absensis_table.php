<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absensis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesi_absensi_id')->constrained('sesi_absensis')->cascadeOnDelete();
            $table->foreignId('siswa_id')->constrained('siswas')->cascadeOnDelete();
            $table->enum('status', ['hadir', 'izin', 'sakit', 'alpa', 'terlambat']);
            $table->enum('metode', ['qr', 'manual']);
            $table->dateTime('waktu_absen');
            $table->foreignId('dicatat_oleh_guru_id')->nullable()->constrained('gurus')->nullOnDelete();
            $table->timestamps();

            $table->unique(['sesi_absensi_id', 'siswa_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absensis');
    }
};
