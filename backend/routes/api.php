<?php

use App\Http\Controllers\Api\AbsenScanController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GuruController;
use App\Http\Controllers\Api\JadwalController;
use App\Http\Controllers\Api\KelasController;
use App\Http\Controllers\Api\MapelController;
use App\Http\Controllers\Api\RekapController;
use App\Http\Controllers\Api\SesiAbsensiController;
use App\Http\Controllers\Api\SiswaController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('kelas', KelasController::class)->parameters(['kelas' => 'kelas']);
        Route::apiResource('siswa', SiswaController::class);
        Route::apiResource('guru', GuruController::class);
        Route::apiResource('mapel', MapelController::class);
        Route::apiResource('jadwal', JadwalController::class);
    });

    Route::middleware('role:guru')->group(function () {
        Route::get('/jadwal-hari-ini', [SesiAbsensiController::class, 'jadwalHariIni']);
        Route::get('/kelas-saya', [SesiAbsensiController::class, 'kelasSaya']);
        Route::post('/sesi', [SesiAbsensiController::class, 'store']);
        Route::get('/sesi/{sesi}', [SesiAbsensiController::class, 'show']);
        Route::patch('/sesi/{sesi}/tutup', [SesiAbsensiController::class, 'tutup']);
        Route::post('/sesi/{sesi}/absen-manual', [SesiAbsensiController::class, 'absenManual']);
    });

    Route::middleware('role:siswa')->group(function () {
        Route::get('/siswa/jadwal-hari-ini', [AbsenScanController::class, 'jadwalHariIni']);
        Route::post('/absen/scan', [AbsenScanController::class, 'scan']);
        Route::get('/riwayat-absensi', [AbsenScanController::class, 'riwayat']);
    });

    Route::middleware('role:admin,guru')->group(function () {
        Route::get('/rekap/kelas/{kelas}', [RekapController::class, 'kelasPeriode']);
        Route::get('/rekap/kelas/{kelas}/export/excel', [RekapController::class, 'exportKelasExcel']);
        Route::get('/rekap/kelas/{kelas}/export/pdf', [RekapController::class, 'exportKelasPdf']);
        Route::get('/rekap/siswa/{siswa}', [RekapController::class, 'siswaPeriode']);
    });
});
