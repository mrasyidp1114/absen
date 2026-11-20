"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";

interface Kelas {
  id: number;
  tingkat: string;
  nama: string;
}
interface Mapel {
  id: number;
  nama_mapel: string;
}
interface Guru {
  id: number;
  nama: string;
}
interface Jadwal {
  id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  kelas: Kelas;
  mapel: Mapel;
  guru: Guru;
}

const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const EMPTY_FORM = { kelas_id: "", mapel_id: "", guru_id: "", hari: "Senin", jam_mulai: "07:00", jam_selesai: "07:40" };

export default function JadwalPage() {
  const [list, setList] = useState<Jadwal[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [filterKelas, setFilterKelas] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(kelasId?: string) {
    const { data } = await api.get("/jadwal", { params: kelasId ? { kelas_id: kelasId } : {} });
    setList(data);
  }

  useEffect(() => {
    load();
    api.get("/kelas").then((res) => setKelasList(res.data));
    api.get("/mapel").then((res) => setMapelList(res.data));
    api.get("/guru").then((res) => setGuruList(res.data));
  }, []);

  function startEdit(j: Jadwal) {
    setEditingId(j.id);
    setForm({
      kelas_id: String(j.kelas.id),
      mapel_id: String(j.mapel.id),
      guru_id: String(j.guru.id),
      hari: j.hari,
      jam_mulai: j.jam_mulai.slice(0, 5),
      jam_selesai: j.jam_selesai.slice(0, 5),
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      kelas_id: Number(form.kelas_id),
      mapel_id: Number(form.mapel_id),
      guru_id: Number(form.guru_id),
      hari: form.hari,
      jam_mulai: form.jam_mulai,
      jam_selesai: form.jam_selesai,
    };
    try {
      if (editingId) {
        await api.put(`/jadwal/${editingId}`, payload);
      } else {
        await api.post("/jadwal", payload);
      }
      resetForm();
      await load(filterKelas);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus jadwal ini?")) return;
    try {
      await api.delete(`/jadwal/${id}`);
      await load(filterKelas);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Jadwal Pelajaran</h1>

      <form onSubmit={handleSubmit} className="mt-4 bg-white rounded-lg shadow p-4 flex flex-wrap items-end gap-3">
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
        <div>
          <label className="block text-xs text-slate-500">Mapel</label>
          <select
            required
            value={form.mapel_id}
            onChange={(e) => setForm({ ...form, mapel_id: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Pilih mapel</option>
            {mapelList.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama_mapel}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500">Guru</label>
          <select
            required
            value={form.guru_id}
            onChange={(e) => setForm({ ...form, guru_id: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Pilih guru</option>
            {guruList.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500">Hari</label>
          <select
            value={form.hari}
            onChange={(e) => setForm({ ...form, hari: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            {HARI_LIST.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500">Jam Mulai</label>
          <input
            type="time"
            value={form.jam_mulai}
            onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">Jam Selesai</label>
          <input
            type="time"
            value={form.jam_selesai}
            onChange={(e) => setForm({ ...form, jam_selesai: e.target.value })}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
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
            <th className="text-left px-4 py-2">Hari</th>
            <th className="text-left px-4 py-2">Jam</th>
            <th className="text-left px-4 py-2">Kelas</th>
            <th className="text-left px-4 py-2">Mapel</th>
            <th className="text-left px-4 py-2">Guru</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((j) => (
            <tr key={j.id} className="border-t border-slate-100">
              <td className="px-4 py-2">{j.hari}</td>
              <td className="px-4 py-2">{j.jam_mulai.slice(0, 5)}-{j.jam_selesai.slice(0, 5)}</td>
              <td className="px-4 py-2">{j.kelas.tingkat}{j.kelas.nama}</td>
              <td className="px-4 py-2">{j.mapel.nama_mapel}</td>
              <td className="px-4 py-2">{j.guru.nama}</td>
              <td className="px-4 py-2 text-right space-x-3">
                <button onClick={() => startEdit(j)} className="text-blue-600 hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(j.id)} className="text-red-600 hover:underline">
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
