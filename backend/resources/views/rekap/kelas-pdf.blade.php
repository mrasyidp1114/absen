<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        h2 { margin-bottom: 0; }
        p { margin-top: 4px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
        th { background: #f0f0f0; }
        td.center, th.center { text-align: center; }
    </style>
</head>
<body>
    <h2>Rekap Absensi Kelas {{ $kelas }}</h2>
    <p>Periode: {{ $dari }} s.d. {{ $sampai }}</p>

    <table>
        <thead>
            <tr>
                <th>NISN</th>
                <th>Nama</th>
                <th class="center">Hadir</th>
                <th class="center">Izin</th>
                <th class="center">Sakit</th>
                <th class="center">Alpa</th>
                <th class="center">Terlambat</th>
                <th class="center">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $row)
                <tr>
                    <td>{{ $row['nisn'] }}</td>
                    <td>{{ $row['nama'] }}</td>
                    <td class="center">{{ $row['hadir'] }}</td>
                    <td class="center">{{ $row['izin'] }}</td>
                    <td class="center">{{ $row['sakit'] }}</td>
                    <td class="center">{{ $row['alpa'] }}</td>
                    <td class="center">{{ $row['terlambat'] }}</td>
                    <td class="center">{{ $row['total'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
