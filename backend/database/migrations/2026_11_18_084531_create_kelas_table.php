<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kelas', function (Blueprint $table) {
            $table->id();
            $table->enum('tingkat', ['7', '8', '9']);
            $table->string('nama', 1); // A, B, C, D
            $table->foreignId('wali_kelas_id')->nullable()->constrained('gurus')->nullOnDelete();
            $table->timestamps();

            $table->unique(['tingkat', 'nama']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kelas');
    }
};
