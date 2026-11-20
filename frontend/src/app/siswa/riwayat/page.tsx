"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface RiwayatItem {
  id: number;
  status: string;
  metode: string;
  waktu_absen: string;
  sesi_absensi: {
    jadwal: {
      mapel: { nama_mapel: string };
      kelas: { tingkat: string; nama: string };
    };
  };
}

export default function RiwayatAbsensiPage() {
  const [items, setItems] = useState<RiwayatItem[]>([]);

  useEffect(() => {
    api.get("/riwayat-absensi").then((res) => setItems(res.data.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Riwayat Absensi Saya</h1>

      <table className="mt-4 w-full bg-white rounded-lg shadow overflow-hidden text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="text-left px-4 py-2">Waktu</th>
            <th className="text-left px-4 py-2">Mapel</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Metode</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-slate-100">
              <td className="px-4 py-2">{new Date(item.waktu_absen).toLocaleString("id-ID")}</td>
              <td className="px-4 py-2">{item.sesi_absensi.jadwal.mapel.nama_mapel}</td>
              <td className="px-4 py-2 capitalize">{item.status}</td>
              <td className="px-4 py-2 uppercase">{item.metode}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                Belum ada riwayat absensi.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
