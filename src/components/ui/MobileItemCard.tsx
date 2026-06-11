"use client";

import { useRef, useState } from "react";

export type ChipTone = "ok" | "warn" | "bad" | "info" | "neutral";

export const CHIP_TONES: Record<ChipTone, string> = {
  ok:      "bg-[#DCFCE7] text-[#15803d] dark:bg-[#1D3B25] dark:text-[#7ED957]",
  warn:    "bg-[#FEF3C7] text-[#92400e] dark:bg-[#3A311A] dark:text-[#FFD56A]",
  bad:     "bg-[#FEE2E2] text-[#991b1b] dark:bg-[#42201F] dark:text-[#FF8A8A]",
  info:    "bg-[#E0E7FF] text-[#3730a3] dark:bg-[#272E52] dark:text-[#A5B4FC]",
  neutral: "bg-[#E5E7EB] text-[#374151] dark:bg-[#2A3144] dark:text-[#C3C9D6]",
};

export function toneForPago(s: string): ChipTone {
  return s === "OK" ? "ok" : s === "Pendente" ? "warn" : "bad";
}

// Classes compartilhadas dos campos do editor expandido (iguais às das tabelas desktop)
export const FIELD_CLS = "border-[1.5px] border-border rounded-md px-2 py-2 font-sans text-[13px] bg-bg text-apptext w-full outline-none focus:border-accent focus:bg-card transition-colors";
export const FIELD_MONO_CLS = "border-[1.5px] border-border rounded-md px-2 py-2 font-mono text-[13px] text-right bg-bg text-apptext w-full outline-none focus:border-accent focus:bg-card transition-colors";

export function CardField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold text-muted uppercase tracking-[.4px] mb-1">{label}</span>
      {children}
    </label>
  );
}

interface Props {
  title: string;
  titlePlaceholder?: string;
  subtitle?: string;
  value: string;
  chip?: string;
  chipTone?: ChipTone;
  onChipTap?: () => void;
  onDelete: () => void;
  children: React.ReactNode; // editor exibido ao expandir
}

const REVEAL_W = 88; // largura da área "Excluir" revelada pelo swipe

/**
 * Card de item para telas pequenas: toque expande o editor,
 * swipe para a esquerda revela o botão de excluir.
 */
export default function MobileItemCard({
  title, titlePlaceholder = "Sem descrição", subtitle, value,
  chip, chipTone = "neutral", onChipTap, onDelete, children,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [offset, setOffset] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef(0); // espelho síncrono de `offset` — o state pode estar defasado no touchend
  const start = useRef<{ x: number; y: number; base: number } | null>(null);
  const axis = useRef<"h" | "v" | null>(null);
  const moved = useRef(false);

  function setOffsetSync(v: number) {
    offsetRef.current = v;
    setOffset(v);
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY, base: revealed ? -REVEAL_W : 0 };
    axis.current = null;
    moved.current = false;
    setDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!start.current) return;
    const t = e.touches[0];
    const dx = t.clientX - start.current.x;
    const dy = t.clientY - start.current.y;
    // Decide o eixo do gesto uma única vez, para não roubar o scroll vertical
    if (!axis.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
    if (axis.current === "v") return;
    moved.current = true;
    setOffsetSync(Math.min(0, Math.max(-REVEAL_W, start.current.base + dx)));
  }

  function onTouchEnd() {
    setDragging(false);
    if (axis.current === "h") {
      const open = offsetRef.current < -REVEAL_W / 2;
      setRevealed(open);
      setOffsetSync(open ? -REVEAL_W : 0);
    }
    start.current = null;
    axis.current = null;
  }

  function handleTap() {
    if (moved.current) { moved.current = false; return; }
    if (revealed) {
      setRevealed(false);
      setOffset(0);
      return;
    }
    setExpanded(x => !x);
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      {/* Área de excluir, revelada pelo swipe */}
      <button
        onClick={onDelete}
        tabIndex={revealed ? 0 : -1}
        aria-hidden={!revealed}
        className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-0.5 bg-vermelho text-white text-[11px] font-semibold"
        style={{ width: REVEAL_W }}
      >
        <span className="text-base">🗑️</span>
        Excluir
      </button>

      {/* Conteúdo deslizante */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ transform: `translateX(${offset}px)`, touchAction: "pan-y" }}
        className={`relative bg-card ${dragging ? "" : "transition-transform duration-200"}`}
      >
        <div className="flex items-center gap-2.5 px-3.5 py-3" onClick={handleTap}>
          <div className="flex-1 min-w-0">
            <div className={`text-[13px] font-semibold truncate ${title ? "" : "text-muted font-normal italic"}`}>
              {title || titlePlaceholder}
            </div>
            {subtitle && <div className="text-[11px] text-muted truncate mt-0.5">{subtitle}</div>}
          </div>
          {chip && (
            onChipTap ? (
              <button
                onClick={e => { e.stopPropagation(); onChipTap(); }}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${CHIP_TONES[chipTone]}`}
              >
                {chip}
              </button>
            ) : (
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${CHIP_TONES[chipTone]}`}>
                {chip}
              </span>
            )
          )}
          <span className="font-mono text-[13px] font-semibold whitespace-nowrap">{value}</span>
          <span className={`text-muted text-[10px] transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
        </div>

        {expanded && (
          <div className="px-3.5 pb-3.5 pt-2.5 border-t border-border space-y-2.5">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
