"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props { userEmail: string; }

const NAV = [
  { href: "/lancamento",    icon: "📋", label: "Lançamento" },
  { href: "/parcelamentos", icon: "📑", label: "Parcelamentos" },
  { href: "/dashboard",     icon: "📊", label: "Dashboard" },
];

export default function Sidebar({ userEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-[220px] bg-navy flex flex-col flex-shrink-0 z-10 hidden md:flex">
      <div className="px-5 pt-7 pb-5 border-b border-white/[.08]">
        <div className="text-3xl">💰</div>
        <div className="text-[15px] font-bold text-white mt-2 leading-tight">
          Controle<br />Financeiro
        </div>
        <div className="text-[11px] text-white/40 mt-0.5">Dados na nuvem</div>
      </div>

      <nav className="py-3 flex-1">
        {NAV.map(({ href, icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-medium border-l-[3px] transition-all ${
                active
                  ? "bg-white/10 text-white border-amarelo"
                  : "text-white/60 border-transparent hover:bg-white/[.06] hover:text-white"
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="py-2 border-t border-white/[.08] flex flex-col gap-0.5">
        <SidebarBtn onClick={() => {}} label="📥 Exportar Excel" />
        <SidebarBtn onClick={() => {}} label="💾 Backup (JSON)" />
        <SidebarBtn onClick={() => {}} label="📂 Restaurar Backup" />
        <SidebarBtn onClick={handleSignOut} label="🚪 Sair" danger />
      </div>

      <div className="px-5 py-3.5 border-t border-white/[.08] text-[11px] text-white/30">
        {userEmail}
      </div>
    </aside>
  );
}

function SidebarBtn({
  onClick, label, danger = false,
}: {
  onClick: () => void; label: string; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 mx-3 px-3 py-[7px] rounded-md text-[12px] font-medium border transition-all w-[calc(100%-24px)] font-sans ${
        danger
          ? "text-[rgba(255,180,180,.7)] border-[rgba(255,180,180,.2)] hover:bg-[rgba(255,80,80,.1)] hover:text-[#FFB4B4]"
          : "text-white/60 border-white/15 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
