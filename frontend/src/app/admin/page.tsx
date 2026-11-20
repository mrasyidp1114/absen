"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  kelas: number;
  siswa: number;
  guru: number;
  mapel: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const [kelas, siswa, guru, mapel] = await Promise.all([
        api.get("/kelas"),
        api.get("/siswa"),
        api.get("/guru"),
        api.get("/mapel"),
      ]);
      setStats({
        kelas: kelas.data.length,
        siswa: siswa.data.length,
        guru: guru.data.length,
        mapel: mapel.data.length,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Kelas", value: stats?.kelas },
    { label: "Siswa", value: stats?.siswa },
    { label: "Guru", value: stats?.guru },
    { label: "Mata Pelajaran", value: stats?.mapel },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard Admin</h1>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg shadow p-5">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-3xl font-semibold text-slate-900 mt-1">{c.value ?? "-"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
