"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { useExportImport } from "@/hooks/useExportImport";

export type ConfirmAction = "restore" | "reset" | null;

/**
 * Lógica compartilhada dos controles de dados (exportar, backup,
 * restaurar, apagar tudo, sair) usada pela Sidebar e pelo menu mobile.
 */
export function useDataControls() {
  const router = useRouter();
  const supabase = createClient();
  const { show: toast } = useToast();
  const { exportarExcel, exportarJSON, restaurarJSON, apagarTudo } = useExportImport();
  const fileRef = useRef<HTMLInputElement>(null);
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

  function cancelConfirm() {
    setConfirm(null);
    setPendingFile(null);
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

  return {
    busy, confirm, setConfirm, fileRef,
    handleSignOut, handleExcelClick, handleJSONClick,
    handleRestoreClick, handleFileChange, handleConfirm, cancelConfirm,
  };
}
