"use client";

import { useEffect } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useDataControls } from "@/hooks/useDataControls";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function MobileMenu({ open, onClose, userEmail }: Props) {
  const { dark, toggle } = useTheme();
  const {
    busy, confirm, setConfirm, fileRef,
    handleSignOut, handleExcelClick, handleJSONClick,
    handleRestoreClick, handleFileChange, handleConfirm, cancelConfirm,
  } = useDataControls();

  // Trava o scroll do fundo enquanto o menu está aberto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/45 z-40 md:hidden"
          onClick={onClose}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-card rounded-t-2xl px-4 pt-3 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,.3)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />

            <MenuRow
              icon={dark ? "☀️" : "🌙"}
              label={dark ? "Modo claro" : "Modo escuro"}
              onClick={toggle}
            />
            <MenuRow icon="📥" label="Exportar Excel"    onClick={handleExcelClick}   disabled={busy} />
            <MenuRow icon="💾" label="Backup (JSON)"     onClick={handleJSONClick}    disabled={busy} />
            <MenuRow icon="📂" label="Restaurar Backup"  onClick={handleRestoreClick} disabled={busy} />
            <MenuRow icon="🗑️" label="Apagar Tudo"       onClick={() => setConfirm("reset")} danger disabled={busy} />
            <MenuRow icon="🚪" label="Sair"              onClick={handleSignOut}      disabled={busy} />

            {userEmail && (
              <div className="text-[11px] text-muted text-center mt-4 truncate">{userEmail}</div>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      <ConfirmModal
        open={confirm === "restore"}
        title="Restaurar backup?"
        message="Todos os dados atuais serão substituídos pelos dados do arquivo. Esta ação não pode ser desfeita."
        onConfirm={handleConfirm}
        onCancel={cancelConfirm}
      />
      <ConfirmModal
        open={confirm === "reset"}
        title="Apagar todos os dados?"
        message="Todos os lançamentos e parcelamentos serão apagados permanentemente. Faça um backup antes."
        onConfirm={handleConfirm}
        onCancel={cancelConfirm}
      />
    </>
  );
}

function MenuRow({
  icon, label, onClick, danger = false, disabled = false,
}: {
  icon: string; label: string; onClick: () => void; danger?: boolean; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-[14px] font-medium transition-colors disabled:opacity-40 ${
        danger ? "text-vermelho active:bg-vermelho/10" : "text-apptext active:bg-rowhover"
      }`}
    >
      <span className="text-lg w-6 text-center">{icon}</span>
      {label}
    </button>
  );
}
