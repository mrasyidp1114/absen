export type Role = "admin" | "guru" | "siswa";

export interface GuruProfile {
  id: number;
  nip: string;
  nama: string;
}

export interface SiswaProfile {
  id: number;
  nisn: string;
  nama: string;
  kelas_id: number;
  kelas: string;
}

export interface AuthUser {
  id: number;
  name: string;
  username: string;
  role: Role;
  guru?: GuruProfile | null;
  siswa?: SiswaProfile | null;
}
