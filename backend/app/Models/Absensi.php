<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absensi extends Model
{
    use HasFactory;

    protected $fillable = [
        'sesi_absensi_id',
        'siswa_id',
        'status',
        'metode',
        'waktu_absen',
        'dicatat_oleh_guru_id',
    ];

    protected function casts(): array
    {
        return [
            'waktu_absen' => 'datetime',
        ];
    }

    public function sesiAbsensi(): BelongsTo
    {
        return $this->belongsTo(SesiAbsensi::class);
    }

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }

    public function dicatatOlehGuru(): BelongsTo
    {
        return $this->belongsTo(Guru::class, 'dicatat_oleh_guru_id');
    }
}
