"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";

interface Mapel {
  id: number;
  kode: string;
  nama_mapel: string;
}

const EMPTY_FORM = { kode: "", nama_mapel: "" };

export default function MapelPage() {
  const [list, setList] = useState<Mapel[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data } = await api.get("/mapel");
    setList(data);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(m: Mapel) {
    setEditingId(m.id);
    setForm({ kode: m.kode, nama_mapel: m.nama_mapel });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await api.put(`/mapel/${editingId}`, form);
      } else {
        await api.post("/mapel", form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus mata pelajaran ini?")) return;
    try {
      await api.delete(`/mapel/${id}`);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Mata Pelajaran</h1>

      <form onSubmit={handleSubmit} className="mt-4 bg-white rounded-lg shadow p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500">Kode</label>
          <input
            required
            value={form.kode}
            onChange={(e) => setForm({ ...form, kode: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm w-28"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">Nama Mapel</label>
          <input
            required
            value={form.nama_mapel}
            onChange={(e) => setForm({ ...form, nama_mapel: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm min-w-[220px]"
          />
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
            <th className="text-left px-4 py-2">Kode</th>
            <th className="text-left px-4 py-2">Nama Mapel</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((m) => (
            <tr key={m.id} className="border-t border-slate-100">
              <td className="px-4 py-2 font-medium">{m.kode}</td>
              <td className="px-4 py-2">{m.nama_mapel}</td>
              <td className="px-4 py-2 text-right space-x-3">
                <button onClick={() => startEdit(m)} className="text-blue-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:underline">
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
