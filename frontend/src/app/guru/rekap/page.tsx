"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import RekapKelas from "@/components/RekapKelas";

interface KelasOption {
  id: number;
  tingkat: string;
  nama: string;
}

export default function GuruRekapPage() {
  const [kelasOptions, setKelasOptions] = useState<KelasOption[]>([]);

  useEffect(() => {
    api.get("/kelas-saya").then((res) => setKelasOptions(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Rekap Kelas Saya</h1>
      <div className="mt-4">
        {kelasOptions.length > 0 ? (
          <RekapKelas kelasOptions={kelasOptions} />
        ) : (
          <p className="text-sm text-slate-500">Belum ada kelas yang Anda ajar.</p>
        )}
      </div>
    </div>
  );
}
