"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface JadwalItem {
  id: number;
  jam_mulai: string;
  jam_selesai: string;
  mapel: { nama_mapel: string };
  guru: { nama: string };
}

export default function SiswaDashboardPage() {
  const { user } = useAuth();
  const [hari, setHari] = useState("");
  const [jadwals, setJadwals] = useState<JadwalItem[]>([]);

  useEffect(() => {
    api.get("/siswa/jadwal-hari-ini").then((res) => {
      setHari(res.data.hari);
      setJadwals(res.data.jadwals);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Halo, {user?.name} ({user?.siswa?.kelas})
      </h1>
      <p className="text-slate-500 mt-1">Jadwal pelajaran hari {hari}</p>

      <div className="mt-4 space-y-2">
        {jadwals.length === 0 && <p className="text-sm text-slate-500">Tidak ada jadwal pelajaran hari ini.</p>}
        {jadwals.map((j) => (
          <div key={j.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">{j.mapel.nama_mapel}</p>
              <p className="text-sm text-slate-500">{j.guru.nama}</p>
            </div>
            <p className="text-sm text-slate-600">
              {j.jam_mulai.slice(0, 5)} - {j.jam_selesai.slice(0, 5)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
