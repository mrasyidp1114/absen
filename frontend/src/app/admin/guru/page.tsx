"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";

interface Guru {
  id: number;
  nip: string;
  nama: string;
}

const EMPTY_FORM = { nip: "", nama: "", email: "" };

export default function GuruPage() {
  const [list, setList] = useState<Guru[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data } = await api.get("/guru");
    setList(data);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(g: Guru) {
    setEditingId(g.id);
    setForm({ nip: g.nip, nama: g.nama, email: "" });
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
        await api.put(`/guru/${editingId}`, { nip: form.nip, nama: form.nama });
      } else {
        await api.post("/guru", form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus guru ini? Akun login guru juga akan terhapus.")) return;
    try {
      await api.delete(`/guru/${id}`);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Guru</h1>

      <form onSubmit={handleSubmit} className="mt-4 bg-white rounded-lg shadow p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500">NIP</label>
          <input
            required
            value={form.nip}
            onChange={(e) => setForm({ ...form, nip: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm w-48"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">Nama</label>
          <input
            required
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm min-w-[220px]"
          />
        </div>
        {!editingId && (
          <div>
            <label className="block text-xs text-slate-500">Email (opsional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm min-w-[220px]"
            />
          </div>
        )}
        <button type="submit" className="rounded bg-blue-600 text-white px-4 py-1.5 text-sm font-medium hover:bg-blue-700">
          {editingId ? "Simpan" : "Tambah"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:underline">
            Batal
          </button>
        )}
      </form>
      {!editingId && (
        <p className="text-xs text-slate-400 mt-1">Password login default guru sama dengan NIP.</p>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <table className="mt-6 w-full bg-white rounded-lg shadow overflow-hidden text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="text-left px-4 py-2">NIP</th>
            <th className="text-left px-4 py-2">Nama</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((g) => (
            <tr key={g.id} className="border-t border-slate-100">
              <td className="px-4 py-2 font-medium">{g.nip}</td>
              <td className="px-4 py-2">{g.nama}</td>
              <td className="px-4 py-2 text-right space-x-3">
                <button onClick={() => startEdit(g)} className="text-blue-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(g.id)} className="text-red-600 hover:underline">
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
