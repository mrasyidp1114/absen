"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  href: string;
  label: string;
}

export default function DashboardShell({
  title,
  navItems,
  children,
}: {
  title: string;
  navItems: NavItem[];
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-slate-900 text-slate-100 flex flex-col">
        <div className="px-5 py-5 text-lg font-semibold border-b border-slate-800">{title}</div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm ${
                  active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 text-sm">
          <p className="font-medium">{user?.name}</p>
          <button onClick={() => logout()} className="mt-2 text-slate-400 hover:text-white text-xs">
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-slate-50 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
