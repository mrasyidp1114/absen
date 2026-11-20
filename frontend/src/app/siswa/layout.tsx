"use client";

import DashboardShell from "@/components/DashboardShell";

const NAV_ITEMS = [
  { href: "/siswa", label: "Jadwal Hari Ini" },
  { href: "/siswa/scan", label: "Scan QR" },
  { href: "/siswa/riwayat", label: "Riwayat Absensi" },
];

export default function SiswaLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Siswa" navItems={NAV_ITEMS}>
      {children}
    </DashboardShell>
  );
}
