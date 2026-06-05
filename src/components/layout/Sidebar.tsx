"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useExportImport } from "@/hooks/useExportImport";

interface Props { userEmail: string; }

const NAV = [
  { href: "/lancamento",    icon: "📋", label: "Lançamento" },
  { href: "/parcelamentos", icon: "📑", label: "Parcelamentos" },
  { href: "/dashboard",     icon: "📊", label: "Dashboard" },
];

type ConfirmAction = "restore" | "reset" | null;

export default function Sidebar({ userEmail }: Props) {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();
  const { show: toast } = useToast();
  const { exportarExcel, exportarJSON, restaurarJSON, apagarTudo } = useExportImport();
  const fileRef   = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleExcelClick() {
    setBusy(true);
    try {
      await exportarExcel();
      toast("Excel exportado!");
    } catch (e) {
      toast("Erro ao exportar: " + (e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }

  async function handleJSONClick() {
    setBusy(true);
    try {
      await exportarJSON();
      toast("Backup gerado!");
    } catch (e) {
      toast("Erro: " + (e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }

  function handleRestoreClick() {
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setConfirm("restore");
    e.target.value = "";
  }

  async function handleConfirm() {
    setConfirm(null);
    setBusy(true);
    try {
      if (confirm === "restore" && pendingFile) {
        await restaurarJSON(pendingFile);
        setPendingFile(null);
        toast("Backup restaurado!");
        window.location.reload();
      } else if (confirm === "reset") {
        await apagarTudo();
        toast("Dados apagados");
        window.location.reload();
      }
    } catch (e) {
      toast("Erro: " + (e as Error).message, true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <aside className="w-[220px] bg-navy flex-col flex-shrink-0 z-10 hidden md:flex">
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
          <SidebarBtn onClick={handleExcelClick} label="📥 Exportar Excel"   disabled={busy} />
          <SidebarBtn onClick={handleJSONClick}  label="💾 Backup (JSON)"    disabled={busy} />
          <SidebarBtn onClick={handleRestoreClick} label="📂 Restaurar Backup" disabled={busy} />
          <SidebarBtn onClick={() => setConfirm("reset")} label="🗑️ Apagar Tudo" danger disabled={busy} />
          <SidebarBtn onClick={handleSignOut}    label="🚪 Sair"             disabled={busy} />
        </div>

        <div className="px-5 py-3.5 border-t border-white/[.08] text-[11px] text-white/30 truncate">
          {userEmail}
        </div>
      </aside>

      {/* Hidden file input for JSON restore */}
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Confirm: restore */}
      <ConfirmModal
        open={confirm === "restore"}
        title="Restaurar backup?"
        message="Todos os dados atuais serão substituídos pelos dados do arquivo. Esta ação não pode ser desfeita."
        onConfirm={handleConfirm}
        onCancel={() => { setConfirm(null); setPendingFile(null); }}
      />

      {/* Confirm: reset */}
      <ConfirmModal
        open={confirm === "reset"}
        title="Apagar todos os dados?"
        message="Todos os lançamentos e parcelamentos serão apagados permanentemente. Faça um backup antes."
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}

function SidebarBtn({
  onClick, label, danger = false, disabled = false,
}: {
  onClick: () => void; label: string; danger?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 mx-3 px-3 py-[7px] rounded-md text-[12px] font-medium border transition-all w-[calc(100%-24px)] font-sans disabled:opacity-40 disabled:cursor-not-allowed ${
        danger
          ? "text-[rgba(255,180,180,.7)] border-[rgba(255,180,180,.2)] hover:bg-[rgba(255,80,80,.1)] hover:text-[#FFB4B4]"
          : "text-white/60 border-white/15 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
