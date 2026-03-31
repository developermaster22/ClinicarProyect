"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const links = [
  { href: "/dashboard", label: "Panel" },
  { href: "/dashboard/metrics", label: "Metricas" },
  { href: "/dashboard/monitor", label: "Monitor" },
  { href: "/dashboard/work-orders/new", label: "Nueva orden" },
  { href: "/dashboard/reports", label: "Informes" },
];

export function DashboardShell({
  children,
  userLabel,
}: {
  children: ReactNode;
  userLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-glow" />
        <div className="sidebar-brand">
          <Image src="/logo-clinicar.jpeg" alt="Clinicar" width={64} height={64} className="brand-logo small" />
          <div>
            <p className="eyebrow">Clinicar</p>
            <h2>Control Center</h2>
            <p className="muted sidebar-caption">Operacion diaria, metricas y monitor.</p>
          </div>
        </div>

        <nav className="nav-list">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href ? "nav-link active" : "nav-link"}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="muted">{userLabel}</p>
          <button className="secondary-button" onClick={handleLogout} type="button">
            Cerrar sesion
          </button>
        </div>
      </aside>

      <div className="dashboard-content">{children}</div>
    </div>
  );
}
