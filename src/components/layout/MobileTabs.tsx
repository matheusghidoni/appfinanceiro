"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/lancamento",    icon: "📋", label: "Lançamento" },
  { href: "/parcelamentos", icon: "📑", label: "Parcelas" },
  { href: "/dashboard",     icon: "📊", label: "Dashboard" },
];

export default function MobileTabs() {
  const pathname = usePathname();
  return (
    <nav className="flex md:hidden bg-navy border-t border-white/10 order-10">
      {TABS.map(({ href, icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold border-t-2 transition-all ${
              active
                ? "text-white border-amarelo"
                : "text-white/50 border-transparent"
            }`}
          >
            <span className="text-lg">{icon}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
