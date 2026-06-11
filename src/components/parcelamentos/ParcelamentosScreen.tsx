"use client";

import { useState } from "react";
import { brl } from "@/lib/utils";
import { useParcelamentos } from "@/hooks/useParcelamentos";
import { useToast } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import MobileItemCard, { CHIP_TONES, type ChipTone } from "@/components/ui/MobileItemCard";
import ParcelModal from "./ParcelModal";
import type { Parcelamento, StatusParc } from "@/types";

export default function ParcelamentosScreen() {
  return <Inner />;
}

function Inner() {
  const { loading, parcelas, add, update, remove } = useParcelamentos();
  const { show: toast } = useToast();
  const [modalId, setModalId] = useState<string | null | "new">(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const aReceber = parcelas.filter(p => p.situacao === "Ativo")
    .reduce((s, p) => s + (p.valor_total / p.num_parcelas) * Math.max(0, p.num_parcelas - p.parcelas_pagas), 0);
  const recebido = parcelas.filter(p => p.situacao === "Ativo")
    .reduce((s, p) => s + (p.valor_total / p.num_parcelas) * p.parcelas_pagas, 0);
  const ativos = parcelas.filter(p => p.situacao === "Ativo").length;

  const editing = modalId && modalId !== "new"
    ? parcelas.find(p => p.id === modalId) ?? null
    : null;

  async function handleSave(payload: Omit<Parcelamento, "id"|"user_id"|"created_at"|"updated_at">) {
    if (modalId === "new") {
      await add(payload);
      toast("Parcelamento adicionado");
    } else if (modalId) {
      await update(modalId, payload);
      toast("Parcelamento atualizado");
    }
    setModalId(null);
  }

  async function handleDelete() {
    if (!confirmId) return;
    await remove(confirmId);
    setConfirmId(null);
    setModalId(null);
    toast("Removido");
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 md:px-6 h-[60px] flex items-center justify-between gap-2 flex-shrink-0">
        <h1 className="text-[15px] md:text-[17px] font-bold text-heading">Controle de Parcelamentos</h1>
        <button
          onClick={() => setModalId("new")}
          className="bg-ent text-white rounded-lg px-4 py-2 text-[13px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
        >
          + Novo
        </button>
      </div>

      {/* Summary */}
      <div className="bg-card border-b border-border px-4 md:px-6 py-3 flex gap-2 md:gap-3 flex-shrink-0 flex-wrap">
        <SumCard label="Total a Receber" value={brl(aReceber)} color="bg-ent" />
        <SumCard label="Total Recebido" value={brl(recebido)} color="bg-fixos" />
        <SumCard label="Ativos" value={String(ativos)} color="bg-navy" />
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-muted text-sm">Carregando…</div>
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1.4fr_1.6fr_.9fr_.5fr_.5fr_.6fr_.9fr_.9fr_.9fr_.8fr_40px] gap-1.5 px-3.5 py-2 bg-thead border-b-[1.5px] border-border">
                {["Cliente","Descrição","Total","Pagas","Rest.","R$/Parc.","Recebido","A Receber","Situação","Progresso",""].map((h,i) => (
                  <span key={i} className="text-[10px] font-bold text-muted uppercase">{h}</span>
                ))}
              </div>
              {parcelas.length === 0 ? (
                <div className="px-8 py-8 text-center text-muted text-[13px]">
                  Nenhum parcelamento. Clique em &quot;+ Novo&quot; para adicionar.
                </div>
              ) : parcelas.map(p => (
                <ParcelRow
                  key={p.id}
                  p={p}
                  onEdit={() => setModalId(p.id)}
                  onDelete={() => setConfirmId(p.id)}
                />
              ))}
            </div>

            {/* Mobile: cards expansíveis com swipe para excluir */}
            <div className="md:hidden space-y-2">
              {parcelas.length === 0 ? (
                <div className="bg-card border border-border rounded-xl px-6 py-8 text-center text-muted text-[13px]">
                  Nenhum parcelamento. Toque em &quot;+ Novo&quot; para adicionar.
                </div>
              ) : parcelas.map(p => (
                <ParcelCard
                  key={p.id}
                  p={p}
                  onEdit={() => setModalId(p.id)}
                  onDelete={() => setConfirmId(p.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ParcelModal
        open={modalId !== null}
        initial={editing}
        onSave={handleSave}
        onDelete={editing ? () => setConfirmId(editing.id) : undefined}
        onClose={() => setModalId(null)}
      />

      <ConfirmModal
        open={confirmId !== null}
        title="Remover parcelamento?"
        message="Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}

function SumCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`flex-1 min-w-[140px] rounded-xl px-3.5 py-2.5 flex flex-col gap-1 ${color}`}>
      <span className="text-[11px] text-white/80 font-medium">{label}</span>
      <span className="text-lg font-bold text-white font-mono">{value}</span>
    </div>
  );
}

const BADGE_TONE: Record<StatusParc, ChipTone> = {
  Ativo:        "ok",
  Concluído:    "info",
  Inadimplente: "bad",
  Suspenso:     "warn",
};

function progressColor(s: StatusParc) {
  return s === "Inadimplente" ? "#C00000" : s === "Concluído" ? "#2E75B6" : "#70AD47";
}

function ParcelRow({ p, onEdit, onDelete }: {
  p: Parcelamento; onEdit: () => void; onDelete: () => void;
}) {
  const vp = p.valor_total / (p.num_parcelas || 1);
  const rst = Math.max(0, p.num_parcelas - p.parcelas_pagas);
  const pct = Math.round(p.parcelas_pagas / (p.num_parcelas || 1) * 100);

  return (
    <div
      className="grid grid-cols-[1.4fr_1.6fr_.9fr_.5fr_.5fr_.6fr_.9fr_.9fr_.9fr_.8fr_40px] gap-1.5 px-3.5 py-2 border-b border-border last:border-0 even:bg-roweven hover:bg-rowhover cursor-pointer items-center"
      onClick={onEdit}
    >
      <span className="font-sans font-semibold text-[13px]">{p.cliente}</span>
      <span className="font-sans text-[12px] text-muted">{p.desc}</span>
      <span className="font-mono text-[12px]">{brl(p.valor_total)}</span>
      <span className="font-mono text-[12px]">{p.parcelas_pagas}/{p.num_parcelas}</span>
      <span className="font-mono text-[12px]">{rst}</span>
      <span className="font-mono text-[12px]">{brl(vp)}</span>
      <span className="font-mono text-[12px]">{brl(vp * p.parcelas_pagas)}</span>
      <span className="font-mono text-[12px]">{brl(vp * rst)}</span>
      <span>
        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${CHIP_TONES[BADGE_TONE[p.situacao] ?? "ok"]}`}>
          {p.situacao}
        </span>
      </span>
      <div>
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: progressColor(p.situacao) }} />
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="text-[#ccc] dark:text-[#4A5568] hover:text-vermelho dark:hover:text-vermelho text-sm flex items-center justify-center transition-colors"
      >✕</button>
    </div>
  );
}

function ParcelCard({ p, onEdit, onDelete }: {
  p: Parcelamento; onEdit: () => void; onDelete: () => void;
}) {
  const vp = p.valor_total / (p.num_parcelas || 1);
  const rst = Math.max(0, p.num_parcelas - p.parcelas_pagas);
  const pct = Math.round(p.parcelas_pagas / (p.num_parcelas || 1) * 100);

  return (
    <MobileItemCard
      title={p.cliente}
      titlePlaceholder="Sem cliente"
      subtitle={p.desc || `${p.parcelas_pagas}/${p.num_parcelas} parcelas`}
      value={brl(p.valor_total)}
      chip={p.situacao}
      chipTone={BADGE_TONE[p.situacao] ?? "ok"}
      onDelete={onDelete}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: progressColor(p.situacao) }} />
        </div>
        <span className="font-mono text-[11px] text-muted">{p.parcelas_pagas}/{p.num_parcelas}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <CardStat label="R$ / Parcela" value={brl(vp)} />
        <CardStat label="Restantes" value={String(rst)} />
        <CardStat label="Recebido" value={brl(vp * p.parcelas_pagas)} />
        <CardStat label="A Receber" value={brl(vp * rst)} />
      </div>
      <button
        onClick={onEdit}
        className="w-full bg-navy text-white rounded-lg py-2 text-[13px] font-semibold active:opacity-80 transition-opacity"
      >
        ✏️ Editar
      </button>
    </MobileItemCard>
  );
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-muted">{label}</span>
      <span className="font-mono text-[12px] font-semibold">{value}</span>
    </div>
  );
}
