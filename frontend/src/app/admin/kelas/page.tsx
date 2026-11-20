"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";

interface Guru {
  id: number;
  nama: string;
}

interface Kelas {
  id: number;
  tingkat: string;
  nama: string;
  wali_kelas_id: number | null;
  siswas_count: number;
  wali_kelas: Guru | null;
}

const EMPTY_FORM = { tingkat: "7", nama: "A", wali_kelas_id: "" };

export default function KelasPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadKelas() {
    const { data } = await api.get("/kelas");
    setKelasList(data);
  }

  useEffect(() => {
    loadKelas();
    api.get("/guru").then((res) => setGuruList(res.data));
  }, []);

  function startEdit(k: Kelas) {
    setEditingId(k.id);
    setForm({ tingkat: k.tingkat, nama: k.nama, wali_kelas_id: k.wali_kelas_id ? String(k.wali_kelas_id) : "" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      tingkat: form.tingkat,
      nama: form.nama,
      wali_kelas_id: form.wali_kelas_id ? Number(form.wali_kelas_id) : null,
    };
    try {
      if (editingId) {
        await api.put(`/kelas/${editingId}`, payload);
      } else {
        await api.post("/kelas", payload);
      }
      resetForm();
      await loadKelas();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus kelas ini?")) return;
    try {
      await api.delete(`/kelas/${id}`);
      await loadKelas();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Kelas</h1>

      <form onSubmit={handleSubmit} className="mt-4 bg-white rounded-lg shadow p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500">Tingkat</label>
          <select
            value={form.tingkat}
            onChange={(e) => setForm({ ...form, tingkat: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500">Nama Kelas</label>
          <select
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            {["A", "B", "C", "D"].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500">Wali Kelas</label>
          <select
            value={form.wali_kelas_id}
            onChange={(e) => setForm({ ...form, wali_kelas_id: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm min-w-[180px]"
          >
            <option value="">- Tidak ada -</option>
            {guruList.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nama}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded bg-blue-600 text-white px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
          {editingId ? "Simpan" : "Tambah"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:underline">
            Batal
          </button>
        )}
      </form>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <table className="mt-6 w-full bg-white rounded-lg shadow overflow-hidden text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="text-left px-4 py-2">Kelas</th>
            <th className="text-left px-4 py-2">Wali Kelas</th>
            <th className="text-left px-4 py-2">Jumlah Siswa</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {kelasList.map((k) => (
            <tr key={k.id} className="border-t border-slate-100">
              <td className="px-4 py-2 font-medium">{k.tingkat}{k.nama}</td>
              <td className="px-4 py-2">{k.wali_kelas?.nama ?? "-"}</td>
              <td className="px-4 py-2">{k.siswas_count}</td>
              <td className="px-4 py-2 text-right space-x-3">
                <button onClick={() => startEdit(k)} className="text-blue-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(k.id)} className="text-red-600 hover:underline">
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
