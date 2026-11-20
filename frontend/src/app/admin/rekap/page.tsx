"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import RekapKelas from "@/components/RekapKelas";

interface KelasOption {
  id: number;
  tingkat: string;
  nama: string;
}

export default function AdminRekapPage() {
  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([]);

  useEffect(() => {
    api.get("/kelas").then((res) => setKelasOptions(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Rekap Absensi</h1>
      <div className="mt-4">{kelasOptions.length > 0 && <RekapKelas kelasOptions={kelasOptions} />}</div>
    </div>
  );
}
