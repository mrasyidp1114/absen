<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SesiAbsensi extends Model
{
    use HasFactory;

    protected $fillable = [
        'jadwal_id',
        'tanggal',
        'token',
        'batas_hadir',
        'jumlah_hadir',
        'waktu_mulai',
        'waktu_berakhir',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'waktu_mulai' => 'datetime',
            'waktu_berakhir' => 'datetime',
        ];
    }

    public function jadwal(): BelongsTo
    {
        return $this->belongsTo(Jadwal::class);
    }

    public function absensis(): HasMany
    {
        return $this->hasMany(Absensi::class);
    }

    public function isWaktuHabis(): bool
    {
        return now()->greaterThan($this->waktu_berakhir);
    }

    public function isPenuh(): bool
    {
        return $this->jumlah_hadir >= $this->batas_hadir;
    }

    public function bisaMenerimaScan(): bool
    {
        return $this->status === 'aktif' && ! $this->isWaktuHabis() && ! $this->isPenuh();
    }
}
