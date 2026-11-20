"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";

interface Kelas {
  id: number;
  tingkat: string;
  nama: string;
}

interface Siswa {
  id: number;
  nisn: string;
  nama: string;
  jenis_kelamin: "L" | "P";
  kelas_id: number;
  kelas: Kelas;
}

const EMPTY_FORM = { nisn: "", nama: "", jenis_kelamin: "L", kelas_id: "", email: "" };

export default function SiswaPage() {
  const [list, setList] = useState<Siswa[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [filterKelas, setFilterKelas] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(kelasId?: string) {
    const { data } = await api.get("/siswa", { params: kelasId ? { kelas_id: kelasId } : {} });
    setList(data);
  }

  useEffect(() => {
    load();
    api.get("/kelas").then((res) => setKelasList(res.data));
  }, []);

  function startEdit(s: Siswa) {
    setEditingId(s.id);
    setForm({ nisn: s.nisn, nama: s.nama, jenis_kelamin: s.jenis_kelamin, kelas_id: String(s.kelas_id), email: "" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      nisn: form.nisn,
      nama: form.nama,
      jenis_kelamin: form.jenis_kelamin,
      kelas_id: Number(form.kelas_id),
      email: form.email || undefined,
    };
    try {
      if (editingId) {
        await api.put(`/siswa/${editingId}`, payload);
      } else {
        await api.post("/siswa", payload);
      }
      resetForm();
      await load(filterKelas);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus siswa ini? Akun login siswa juga akan terhapus.")) return;
    try {
      await api.delete(`/siswa/${id}`);
      await load(filterKelas);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Siswa</h1>

      <form onSubmit={handleSubmit} className="mt-4 bg-white rounded-lg shadow p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-slate-500">NISN</label>
          <input
            required
            value={form.nisn}
            onChange={(e) => setForm({ ...form, nisn: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm w-40"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">Nama</label>
          <input
            required
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm min-w-[200px]"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">Jenis Kelamin</label>
          <select
            value={form.jenis_kelamin}
            onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500">Kelas</label>
          <select
            required
            value={form.kelas_id}
            onChange={(e) => setForm({ ...form, kelas_id: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Pilih kelas</option>
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>
                {k.tingkat}{k.nama}
              </option>
            ))}
          </select>
        </div>
        {!editingId && (
          <div>
            <label className="block text-xs text-slate-500">Email (opsional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm min-w-[200px]"
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
      {!editingId && <p className="text-xs text-slate-400 mt-1">Password login default siswa sama dengan NISN.</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <div className="mt-6 flex items-center gap-2">
        <label className="text-sm text-slate-600">Filter kelas:</label>
        <select
          value={filterKelas}
          onChange={(e) => {
            setFilterKelas(e.target.value);
            load(e.target.value);
          }}
          className="rounded border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">Semua kelas</option>
          {kelasList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.tingkat}{k.nama}
            </option>
          ))}
        </select>
      </div>

      <table className="mt-3 w-full bg-white rounded-lg shadow overflow-hidden text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="text-left px-4 py-2">NISN</th>
            <th className="text-left px-4 py-2">Nama</th>
            <th className="text-left px-4 py-2">JK</th>
            <th className="text-left px-4 py-2">Kelas</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.id} className="border-t border-slate-100">
              <td className="px-4 py-2 font-medium">{s.nisn}</td>
              <td className="px-4 py-2">{s.nama}</td>
              <td className="px-4 py-2">{s.jenis_kelamin}</td>
              <td className="px-4 py-2">{s.kelas?.tingkat}{s.kelas?.nama}</td>
              <td className="px-4 py-2 text-right space-x-3">
                <button onClick={() => startEdit(s)} className="text-blue-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">
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
