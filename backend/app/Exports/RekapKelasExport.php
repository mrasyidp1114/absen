<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class RekapKelasExport implements FromArray, WithHeadings
{
    public function __construct(private array $rows)
    {
    }

    public function array(): array
    {
        return array_map(fn ($row) => [
            $row['nisn'],
            $row['nama'],
            $row['hadir'],
            $row['izin'],
            $row['sakit'],
            $row['alpa'],
            $row['terlambat'],
            $row['total'],
        ], $this->rows);
    }

    public function headings(): array
    {
        return ['NISN', 'Nama', 'Hadir', 'Izin', 'Sakit', 'Alpa', 'Terlambat', 'Total'];
    }
}
