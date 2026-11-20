"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { api, apiErrorMessage } from "@/lib/api";

interface DaftarHadirItem {
  siswa_id: number;
  nisn: string;
  nama: string;
  status: string | null;
  metode: string | null;
  waktu_absen: string | null;
}

interface SesiDetail {
  id: number;
  token: string;
  batas_hadir: number;
  jumlah_hadir: number;
  waktu_berakhir: string;
  status: "aktif" | "ditutup";
  jadwal: {
    kelas: { tingkat: string; nama: string };
    mapel: { nama_mapel: string };
  };
}

const STATUS_OPTIONS = ["hadir", "izin", "sakit", "alpa", "terlambat"];

export default function SesiDetailPage() {
  const params = useParams<{ id: string }>();
  const sesiId = params.id;
  const [sesi, setSesi] = useState<SesiDetail | null>(null);
  const [daftarHadir, setDaftarHadir] = useState<DaftarHadirItem[]>([]);
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualStatus, setManualStatus] = useState<Record<number, string>>({});

  async function load() {
    try {
      const { data } = await api.get(`/sesi/${sesiId}`);
      setSesi(data.sesi);
      setDaftarHadir(data.daftar_hadir);
      setServerTime(data.server_time);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesiId]);

  const sisaWaktu = useMemo(() => {
    if (!sesi || !serverTime) return null;
    const diffMs = new Date(sesi.waktu_berakhir).getTime() - new Date(serverTime).getTime();
    if (diffMs <= 0) return "Waktu habis";
    const totalSeconds = Math.floor(diffMs / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [sesi, serverTime]);

  async function handleTutup() {
    if (!confirm("Tutup sesi absen sekarang?")) return;
    try {
      await api.patch(`/sesi/${sesiId}/tutup`);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleAbsenManual(siswaId: number) {
    const status = manualStatus[siswaId] || "hadir";
    try {
      await api.post(`/sesi/${sesiId}/absen-manual`, { siswa_id: siswaId, status });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  if (!sesi) {
    return <p className="text-sm text-slate-500">Memuat...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        {sesi.jadwal.mapel.nama_mapel} - Kelas {sesi.jadwal.kelas.tingkat}{sesi.jadwal.kelas.nama}
      </h1>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          {sesi.status === "aktif" ? (
            <QRCodeSVG value={sesi.token} size={220} />
          ) : (
            <p className="text-slate-500 py-16">Sesi sudah ditutup, QR tidak ditampilkan.</p>
          )}
          <p className="mt-4 text-sm text-slate-500">Siswa scan QR ini untuk absen</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-semibold text-slate-900">
                {sesi.jumlah_hadir}/{sesi.batas_hadir}
              </p>
              <p className="text-sm text-slate-500">Hadir / Batas</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-slate-900">{sesi.status === "aktif" ? sisaWaktu : "-"}</p>
              <p className="text-sm text-slate-500">Sisa Waktu</p>
            </div>
          </div>
          <p className="mt-3 text-center text-sm font-medium">
            Status sesi: <span className={sesi.status === "aktif" ? "text-emerald-600" : "text-slate-500"}>{sesi.status}</span>
          </p>
          {sesi.status === "aktif" && (
            <button onClick={handleTutup} className="mt-4 w-full rounded bg-red-600 text-white py-2 text-sm font-medium hover:bg-red-700">
              Tutup Sesi
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <h2 className="mt-6 text-lg font-semibold text-slate-900">Daftar Hadir</h2>
      <table className="mt-2 w-full bg-white rounded-lg shadow overflow-hidden text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="text-left px-4 py-2">NISN</th>
            <th className="text-left px-4 py-2">Nama</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Metode</th>
            <th className="text-left px-4 py-2">Catat Manual</th>
          </tr>
        </thead>
        <tbody>
          {daftarHadir.map((s) => (
            <tr key={s.siswa_id} className="border-t border-slate-100">
              <td className="px-4 py-2">{s.nisn}</td>
              <td className="px-4 py-2 font-medium">{s.nama}</td>
              <td className="px-4 py-2">{s.status ?? "-"}</td>
              <td className="px-4 py-2">{s.metode ?? "-"}</td>
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <select
                    value={manualStatus[s.siswa_id] || "hadir"}
                    onChange={(e) => setManualStatus({ ...manualStatus, [s.siswa_id]: e.target.value })}
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <button onClick={() => handleAbsenManual(s.siswa_id)} className="text-blue-600 hover:underline text-xs">
                    Catat
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
