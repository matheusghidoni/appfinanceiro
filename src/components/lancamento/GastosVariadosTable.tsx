"use client";

import { brl, parseBrl } from "@/lib/utils";
import { CATS_VAR, STATUS_PAGO } from "@/lib/constants";
import type { GastoVariado, StatusPago } from "@/types";
import MobileItemCard, { CardField, FIELD_CLS, FIELD_MONO_CLS, toneForPago } from "@/components/ui/MobileItemCard";

interface Props {
  rows: GastoVariado[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof GastoVariado, value: unknown) => void;
  onDelete: (id: string) => void;
}

export default function GastosVariadosTable({ rows, onAdd, onUpdate, onDelete }: Props) {
  const subtotal = rows.reduce((s, it) => s + Number(it.valor), 0);

  function cyclePago(row: GastoVariado) {
    const next = STATUS_PAGO[(STATUS_PAGO.indexOf(row.pago) + 1) % STATUS_PAGO.length];
    onUpdate(row.id, "pago", next);
  }

  return (
    <div>
      <div className="bg-var rounded-t-lg px-4 py-2.5 flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-[.5px]">Gastos Variados</h3>
        <button onClick={onAdd} className="bg-white/20 hover:bg-white/35 text-white text-xs font-semibold px-2.5 py-1 rounded-md transition-colors">
          + Adicionar
        </button>
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block bg-card border border-border border-t-0 rounded-b-lg overflow-hidden">
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_32px] bg-thead border-b border-border px-3 py-1.5">
          {["Descrição","Categoria","Valor (R$)","Pago?",""].map((h, i) => (
            <span key={i} className="text-[10px] font-bold text-muted uppercase tracking-[.4px]">{h}</span>
          ))}
        </div>
        {rows.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted text-center">Nenhum item. Clique em + Adicionar.</div>
        )}
        {rows.map(row => (
          <div
            key={row.id}
            className="grid grid-cols-[2fr_1.2fr_1fr_1fr_32px] px-3 py-2 items-center gap-2 border-b border-border last:border-0 odd:bg-card even:bg-roweven hover:bg-rowhover"
          >
            <input
              key={"d" + row.desc}
              type="text"
              placeholder="Descrição"
              defaultValue={row.desc}
              onBlur={e => onUpdate(row.id, "desc", e.target.value)}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-sans text-[13px] bg-bg text-apptext w-full outline-none focus:border-accent focus:bg-card transition-colors"
            />
            <select
              key={"c" + row.cat}
              defaultValue={row.cat}
              onChange={e => onUpdate(row.id, "cat", e.target.value)}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-sans text-[13px] bg-bg text-apptext w-full outline-none focus:border-accent"
            >
              {CATS_VAR.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              key={"v" + row.valor}
              type="text"
              placeholder="0,00"
              defaultValue={row.valor > 0 ? String(row.valor) : ""}
              onBlur={e => onUpdate(row.id, "valor", parseBrl(e.target.value))}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-mono text-[13px] text-right bg-bg text-apptext w-full outline-none focus:border-accent focus:bg-card transition-colors"
            />
            <select
              key={"p" + row.pago}
              defaultValue={row.pago}
              onChange={e => onUpdate(row.id, "pago", e.target.value as StatusPago)}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-sans text-[13px] bg-bg text-apptext w-full outline-none focus:border-accent"
            >
              {STATUS_PAGO.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => onDelete(row.id)} className="text-[#ccc] dark:text-[#4A5568] hover:text-vermelho dark:hover:text-vermelho text-sm flex items-center justify-center transition-colors">✕</button>
          </div>
        ))}
        <div className="flex justify-between items-center bg-subtotal px-3 py-2 border-t-[1.5px] border-border">
          <span className="text-xs font-bold text-heading">Subtotal</span>
          <span className="font-mono text-sm font-bold text-heading">{brl(subtotal)}</span>
        </div>
      </div>

      {/* Mobile: cards expansíveis com swipe para excluir */}
      <div className="md:hidden bg-thead border border-border border-t-0 rounded-b-lg p-2 space-y-2">
        {rows.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted text-center">Nenhum item. Toque em + Adicionar.</div>
        )}
        {rows.map(row => (
          <MobileItemCard
            key={row.id}
            title={row.desc}
            subtitle={row.cat}
            value={brl(Number(row.valor))}
            chip={row.pago}
            chipTone={toneForPago(row.pago)}
            onChipTap={() => cyclePago(row)}
            onDelete={() => onDelete(row.id)}
          >
            <CardField label="Descrição">
              <input
                key={"d" + row.desc}
                type="text"
                placeholder="Descrição"
                defaultValue={row.desc}
                onBlur={e => onUpdate(row.id, "desc", e.target.value)}
                className={FIELD_CLS}
              />
            </CardField>
            <CardField label="Categoria">
              <select
                key={"c" + row.cat}
                defaultValue={row.cat}
                onChange={e => onUpdate(row.id, "cat", e.target.value)}
                className={FIELD_CLS}
              >
                {CATS_VAR.map(c => <option key={c}>{c}</option>)}
              </select>
            </CardField>
            <CardField label="Valor (R$)">
              <input
                key={"v" + row.valor}
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                defaultValue={row.valor > 0 ? String(row.valor).replace(".", ",") : ""}
                onBlur={e => onUpdate(row.id, "valor", parseBrl(e.target.value))}
                className={FIELD_MONO_CLS}
              />
            </CardField>
            <CardField label="Pago?">
              <select
                key={"p" + row.pago}
                defaultValue={row.pago}
                onChange={e => onUpdate(row.id, "pago", e.target.value as StatusPago)}
                className={FIELD_CLS}
              >
                {STATUS_PAGO.map(s => <option key={s}>{s}</option>)}
              </select>
            </CardField>
          </MobileItemCard>
        ))}
        <div className="flex justify-between items-center bg-subtotal rounded-lg px-3.5 py-2.5">
          <span className="text-xs font-bold text-heading">Subtotal</span>
          <span className="font-mono text-sm font-bold text-heading">{brl(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
