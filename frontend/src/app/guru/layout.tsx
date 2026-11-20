"use client";

import DashboardShell from "@/components/DashboardShell";

const NAV_ITEMS = [
  { href: "/guru", label: "Jadwal Hari Ini" },
  { href: "/guru/rekap", label: "Rekap Kelas" },
];

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="Guru" navItems={NAV_ITEMS}>
      {children}
    </DashboardShell>
  );
}
