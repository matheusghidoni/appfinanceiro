"use client";

import { brl, parseBrl } from "@/lib/utils";
import { CATS_FIXOS, STATUS_PAGO } from "@/lib/constants";
import type { GastoFixo, StatusPago } from "@/types";

interface Props {
  rows: GastoFixo[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof GastoFixo, value: unknown) => void;
  onDelete: (id: string) => void;
}

export default function GastosFixosTable({ rows, onAdd, onUpdate, onDelete }: Props) {
  const subtotal = rows.reduce((s, it) => s + Number(it.valor), 0);

  return (
    <div>
      <div className="bg-fixos rounded-t-lg px-4 py-2.5 flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-[.5px]">Gastos Fixos</h3>
        <button onClick={onAdd} className="bg-white/20 hover:bg-white/35 text-white text-xs font-semibold px-2.5 py-1 rounded-md transition-colors">
          + Adicionar
        </button>
      </div>
      <div className="bg-card border border-border border-t-0 rounded-b-lg overflow-hidden">
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_32px] bg-[#F4F5FA] border-b border-border px-3 py-1.5">
          {["Descrição","Categoria","Valor (R$)","Pago?",""].map((h, i) => (
            <span key={i} className="text-[10px] font-bold text-muted uppercase tracking-[.4px]">{h}</span>
          ))}
        </div>
        {rows.map(row => (
          <div
            key={row.id}
            className="grid grid-cols-[2fr_1.2fr_1fr_1fr_32px] px-3 py-2 items-center gap-2 border-b border-border last:border-0 odd:bg-white even:bg-[#FAFBFD] hover:bg-[#F0F4FF]"
          >
            <input
              type="text"
              placeholder="Descrição"
              defaultValue={row.desc}
              onBlur={e => onUpdate(row.id, "desc", e.target.value)}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-sans text-[13px] bg-bg text-apptext w-full outline-none focus:border-navy focus:bg-white transition-colors"
            />
            <select
              defaultValue={row.cat}
              onChange={e => onUpdate(row.id, "cat", e.target.value)}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-sans text-[13px] bg-bg text-apptext w-full outline-none focus:border-navy"
            >
              {CATS_FIXOS.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              type="text"
              placeholder="0,00"
              defaultValue={row.valor > 0 ? String(row.valor) : ""}
              onBlur={e => onUpdate(row.id, "valor", parseBrl(e.target.value))}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-mono text-[13px] text-right bg-bg text-apptext w-full outline-none focus:border-navy focus:bg-white transition-colors"
            />
            <select
              defaultValue={row.pago}
              onChange={e => onUpdate(row.id, "pago", e.target.value as StatusPago)}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-sans text-[13px] bg-bg text-apptext w-full outline-none focus:border-navy"
            >
              {STATUS_PAGO.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => onDelete(row.id)} className="text-[#ccc] hover:text-vermelho text-sm flex items-center justify-center transition-colors">✕</button>
          </div>
        ))}
        <div className="flex justify-between items-center bg-[#EEF2FA] px-3 py-2 border-t-[1.5px] border-border">
          <span className="text-xs font-bold text-navy">Subtotal</span>
          <span className="font-mono text-sm font-bold text-navy">{brl(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
