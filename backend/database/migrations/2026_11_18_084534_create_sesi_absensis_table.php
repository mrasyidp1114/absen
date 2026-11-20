<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sesi_absensis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jadwal_id')->constrained('jadwals')->cascadeOnDelete();
            $table->date('tanggal');
            $table->string('token', 64)->unique();
            $table->unsignedSmallInteger('batas_hadir');
            $table->unsignedSmallInteger('jumlah_hadir')->default(0);
            $table->dateTime('waktu_mulai');
            $table->dateTime('waktu_berakhir');
            $table->enum('status', ['aktif', 'ditutup'])->default('aktif');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesi_absensis');
    }
};
