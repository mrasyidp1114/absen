"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, apiErrorMessage } from "@/lib/api";

interface SesiHariIni {
  id: number;
  status: "aktif" | "ditutup";
}

interface JadwalItem {
  id: number;
  jam_mulai: string;
  jam_selesai: string;
  kelas: { tingkat: string; nama: string };
  mapel: { nama_mapel: string };
  sesi_hari_ini: SesiHariIni | null;
}

export default function GuruDashboardPage() {
  const [hari, setHari] = useState("");
  const [jadwals, setJadwals] = useState<JadwalItem[]>([]);
  const [activeFormId, setActiveFormId] = useState<number | null>(null);
  const [batasHadir, setBatasHadir] = useState("");
  const [durasi, setDurasi] = useState("15");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function load() {
    const { data } = await api.get("/jadwal-hari-ini");
    setHari(data.hari);
    setJadwals(data.jadwals);
  }

  useEffect(() => {
    load();
  }, []);

  function openForm(jadwalId: number) {
    setActiveFormId(jadwalId);
    setBatasHadir("");
    setDurasi("15");
    setError(null);
  }

  async function handleMulaiSesi(jadwalId: number) {
    setSubmitting(true);
    setError(null);
    try {
      const { data } = await api.post("/sesi", {
        jadwal_id: jadwalId,
        batas_hadir: batasHadir ? Number(batasHadir) : undefined,
        durasi_menit: Number(durasi),
      });
      router.push(`/guru/sesi/${data.id}`);
    } catch (err) {
      setError(apiErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Jadwal Mengajar Hari {hari}</h1>

      <div className="mt-4 space-y-3">
        {jadwals.length === 0 && <p className="text-sm text-slate-500">Tidak ada jadwal mengajar hari ini.</p>}

        {jadwals.map((j) => (
          <div key={j.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  {j.mapel.nama_mapel} - Kelas {j.kelas.tingkat}{j.kelas.nama}
                </p>
                <p className="text-sm text-slate-500">
                  {j.jam_mulai.slice(0, 5)} - {j.jam_selesai.slice(0, 5)}
                </p>
              </div>

              {j.sesi_hari_ini ? (
                <button
                  onClick={() => router.push(`/guru/sesi/${j.sesi_hari_ini!.id}`)}
                  className="rounded border border-blue-600 text-blue-600 px-3 py-1.5 text-sm font-medium hover:bg-blue-50"
                >
                  {j.sesi_hari_ini.status === "aktif" ? "Lihat Sesi Aktif" : "Lihat Hasil Sesi"}
                </button>
              ) : (
                <button
                  onClick={() => openForm(j.id)}
                  className="rounded bg-blue-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-blue-700"
                >
                  Mulai Sesi
                </button>
              )}
            </div>

            {activeFormId === j.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs text-slate-500">Batas hadir (kosongkan = jumlah siswa kelas)</label>
                  <input
                    type="number"
                    min={1}
                    value={batasHadir}
                    onChange={(e) => setBatasHadir(e.target.value)}
                    className="rounded border border-slate-300 px-2 py-1.5 text-sm w-48"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500">Durasi (menit)</label>
                  <input
                    type="number"
                    min={1}
                    value={durasi}
                    onChange={(e) => setDurasi(e.target.value)}
                    className="rounded border border-slate-300 px-2 py-1.5 text-sm w-28"
                  />
                </div>
                <button
                  onClick={() => handleMulaiSesi(j.id)}
                  disabled={submitting}
                  className="rounded bg-emerald-600 text-white px-4 py-1.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  {submitting ? "Membuat..." : "Buat QR Sesi"}
                </button>
                <button onClick={() => setActiveFormId(null)} className="text-sm text-slate-500 hover:underline">
                  Batal
                </button>
              </div>
            )}
            {activeFormId === j.id && error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
