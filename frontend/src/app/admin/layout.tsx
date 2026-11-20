"use client";

import DashboardShell from "@/components/DashboardShell";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/kelas", label: "Kelas" },
  { href: "/admin/siswa", label: "Siswa" },
  { href: "/admin/guru", label: "Guru" },
  { href: "/admin/mapel", label: "Mata Pelajaran" },
  { href: "/admin/jadwal", label: "Jadwal" },
  { href: "/admin/rekap", label: "Rekap" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Admin" navItems={NAV_ITEMS}>
      {children}
    </DashboardShell>
  );
}
