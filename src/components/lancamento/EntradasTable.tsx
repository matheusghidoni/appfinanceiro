"use client";

import { brl, parseBrl } from "@/lib/utils";
import { TIPOS_ENT, STATUS_RECEB, TIPO_PARCELAMENTO } from "@/lib/constants";
import type { Entrada, StatusRecebido } from "@/types";
import MobileItemCard, { CardField, FIELD_CLS, FIELD_MONO_CLS, toneForPago } from "@/components/ui/MobileItemCard";

interface Props {
  rows: Entrada[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Entrada, value: unknown) => void;
  onDelete: (id: string) => void;
}

export default function EntradasTable({ rows, onAdd, onUpdate, onDelete }: Props) {
  const subtotal = rows.reduce((s, it) => s + Number(it.valor), 0);

  function cycleRecebido(row: Entrada) {
    const next = STATUS_RECEB[(STATUS_RECEB.indexOf(row.recebido) + 1) % STATUS_RECEB.length];
    onUpdate(row.id, "recebido", next);
  }

  return (
    <div>
      <div className="bg-ent rounded-t-lg px-4 py-2.5 flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-[.5px]">Entradas — Receita do Trabalho</h3>
        <button onClick={onAdd} className="bg-white/20 hover:bg-white/35 text-white text-xs font-semibold px-2.5 py-1 rounded-md transition-colors">
          + Adicionar
        </button>
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block bg-card border border-border border-t-0 rounded-b-lg overflow-hidden">
        <div className="grid grid-cols-[1.8fr_1.3fr_.7fr_.9fr_.9fr_32px] bg-thead border-b border-border px-3 py-1.5">
          {["Descrição / Cliente","Tipo","Parcela","Valor (R$)","Recebido?",""].map((h, i) => (
            <span key={i} className="text-[10px] font-bold text-muted uppercase tracking-[.4px]">{h}</span>
          ))}
        </div>
        {rows.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted text-center">Nenhuma entrada. Clique em + Adicionar.</div>
        )}
        {rows.map(row => (
          <div
            key={row.id}
            className="grid grid-cols-[1.8fr_1.3fr_.7fr_.9fr_.9fr_32px] px-3 py-2 items-center gap-2 border-b border-border last:border-0 odd:bg-card even:bg-roweven hover:bg-rowhover"
          >
            <input
              key={"d" + row.desc}
              type="text"
              placeholder="Cliente / Descrição"
              defaultValue={row.desc}
              onBlur={e => onUpdate(row.id, "desc", e.target.value)}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-sans text-[13px] bg-bg text-apptext w-full outline-none focus:border-accent focus:bg-card transition-colors"
            />
            <select
              key={"t" + row.tipo}
              defaultValue={row.tipo}
              onChange={e => onUpdate(row.id, "tipo", e.target.value)}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-sans text-[13px] bg-bg text-apptext w-full outline-none focus:border-accent"
            >
              {TIPOS_ENT.map(t => <option key={t}>{t}</option>)}
            </select>
            {row.tipo === TIPO_PARCELAMENTO ? (
              <input
                key={"pc" + row.parcela}
                type="text"
                placeholder="5/10"
                defaultValue={row.parcela ?? ""}
                onBlur={e => onUpdate(row.id, "parcela", e.target.value)}
                className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-mono text-[13px] text-center bg-bg text-apptext w-full outline-none focus:border-accent focus:bg-card transition-colors"
              />
            ) : (
              <span className="text-center text-[13px] text-muted/50 select-none">—</span>
            )}
            <input
              key={"v" + row.valor}
              type="text"
              placeholder="0,00"
              defaultValue={row.valor > 0 ? String(row.valor) : ""}
              onBlur={e => onUpdate(row.id, "valor", parseBrl(e.target.value))}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-mono text-[13px] text-right bg-bg text-apptext w-full outline-none focus:border-accent focus:bg-card transition-colors"
            />
            <select
              key={"r" + row.recebido}
              defaultValue={row.recebido}
              onChange={e => onUpdate(row.id, "recebido", e.target.value as StatusRecebido)}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-sans text-[13px] bg-bg text-apptext w-full outline-none focus:border-accent"
            >
              {STATUS_RECEB.map(s => <option key={s}>{s}</option>)}
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
          <div className="px-3 py-4 text-sm text-muted text-center">Nenhuma entrada. Toque em + Adicionar.</div>
        )}
        {rows.map(row => {
          const isParc = row.tipo === TIPO_PARCELAMENTO;
          const subtitle = isParc && row.parcela
            ? `${row.tipo} · ${row.parcela}`
            : row.tipo;
          return (
            <MobileItemCard
              key={row.id}
              title={row.desc}
              titlePlaceholder="Sem cliente / descrição"
              subtitle={subtitle}
              value={brl(Number(row.valor))}
              chip={row.recebido}
              chipTone={toneForPago(row.recebido)}
              onChipTap={() => cycleRecebido(row)}
              onDelete={() => onDelete(row.id)}
            >
              <CardField label="Descrição / Cliente">
                <input
                  key={"d" + row.desc}
                  type="text"
                  placeholder="Cliente / Descrição"
                  defaultValue={row.desc}
                  onBlur={e => onUpdate(row.id, "desc", e.target.value)}
                  className={FIELD_CLS}
                />
              </CardField>
              <CardField label="Tipo">
                <select
                  key={"t" + row.tipo}
                  defaultValue={row.tipo}
                  onChange={e => onUpdate(row.id, "tipo", e.target.value)}
                  className={FIELD_CLS}
                >
                  {TIPOS_ENT.map(t => <option key={t}>{t}</option>)}
                </select>
              </CardField>
              {isParc && (
                <CardField label="Parcela (ex: 5/10)">
                  <input
                    key={"pc" + row.parcela}
                    type="text"
                    placeholder="5/10"
                    defaultValue={row.parcela ?? ""}
                    onBlur={e => onUpdate(row.id, "parcela", e.target.value)}
                    className={FIELD_MONO_CLS}
                  />
                </CardField>
              )}
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
              <CardField label="Recebido?">
                <select
                  key={"r" + row.recebido}
                  defaultValue={row.recebido}
                  onChange={e => onUpdate(row.id, "recebido", e.target.value as StatusRecebido)}
                  className={FIELD_CLS}
                >
                  {STATUS_RECEB.map(s => <option key={s}>{s}</option>)}
                </select>
              </CardField>
            </MobileItemCard>
          );
        })}
        <div className="flex justify-between items-center bg-subtotal rounded-lg px-3.5 py-2.5">
          <span className="text-xs font-bold text-heading">Subtotal</span>
          <span className="font-mono text-sm font-bold text-heading">{brl(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
