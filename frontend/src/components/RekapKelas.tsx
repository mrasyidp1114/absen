"use client";

import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { downloadFile } from "@/lib/download";

interface KelasOption {
  id: number;
  tingkat: string;
  nama: string;
}

interface Mapel {
  id: number;
  nama_mapel: string;
}

interface RekapRow {
  siswa_id: number;
  nisn: string;
  nama: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  terlambat: number;
  total: number;
}

function startOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function RekapKelas({ kelasOptions }: { kelasOptions: KelasOption[] }) {
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [kelasId, setKelasId] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [dari, setDari] = useState(startOfMonth());
  const [sampai, setSampai] = useState(today());
  const [rows, setRows] = useState<RekapRow[] | null>(null);
  const [kelasLabel, setKelasLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kelasOptions.length && !kelasId) {
      setKelasId(String(kelasOptions[0].id));
    }
  }, [kelasOptions, kelasId]);

  useEffect(() => {
    api.get("/mapel").then((res) => setMapelList(res.data)).catch(() => setMapelList([]));
  }, []);

  async function handleView() {
    if (!kelasId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/rekap/kelas/${kelasId}`, {
        params: { dari, sampai, mapel_id: mapelId || undefined },
      });
      setRows(data.data);
      setKelasLabel(data.kelas);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(format: "excel" | "pdf") {
    if (!kelasId) return;
    try {
      await downloadFile(
        `/rekap/kelas/${kelasId}/export/${format}?dari=${dari}&sampai=${sampai}${mapelId ? `&mapel_id=${mapelId}` : ""}`,
        `rekap-kelas.${format === "excel" ? "xlsx" : "pdf"}`
      );
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500">Kelas</label>
          <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            {kelasOptions.map((k) => (
              <option key={k.id} value={k.id}>
                {k.tingkat}{k.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500">Mapel (opsional)</label>
          <select value={mapelId} onChange={(e) => setMapelId(e.target.value)} className="rounded border border-slate-300 px-2 py-1.5 text-sm">
            <option value="">Semua mapel</option>
            {mapelList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama_mapel}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500">Dari</label>
          <input type="date" value={dari} onChange={(e) => setDari(e.target.value)} className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-slate-500">Sampai</label>
          <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
        </div>
        <button onClick={handleView} disabled={loading} className="rounded bg-blue-600 text-white px-4 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Memuat..." : "Lihat Rekap"}
        </button>
        {rows && (
          <>
            <button onClick={() => handleExport("excel")} className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
              Export Excel
            </button>
            <button onClick={() => handleExport("pdf")} className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
              Export PDF
            </button>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {rows && (
        <table className="mt-6 w-full bg-white rounded-lg shadow overflow-hidden text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">NISN</th>
              <th className="text-left px-4 py-2">Nama</th>
              <th className="text-center px-4 py-2">Hadir</th>
              <th className="text-center px-4 py-2">Izin</th>
              <th className="text-center px-4 py-2">Sakit</th>
              <th className="text-center px-4 py-2">Alpa</th>
              <th className="text-center px-4 py-2">Terlambat</th>
              <th className="text-center px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.siswa_id} className="border-t border-slate-100">
                <td className="px-4 py-2">{r.nisn}</td>
                <td className="px-4 py-2 font-medium">{r.nama}</td>
                <td className="px-4 py-2 text-center">{r.hadir}</td>
                <td className="px-4 py-2 text-center">{r.izin}</td>
                <td className="px-4 py-2 text-center">{r.sakit}</td>
                <td className="px-4 py-2 text-center">{r.alpa}</td>
                <td className="px-4 py-2 text-center">{r.terlambat}</td>
                <td className="px-4 py-2 text-center font-medium">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {rows && <p className="text-xs text-slate-400 mt-2">Kelas {kelasLabel}</p>}
    </div>
  );
}
