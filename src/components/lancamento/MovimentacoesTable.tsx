"use client";

import { brl, parseBrl } from "@/lib/utils";
import { TIPOS_MOV } from "@/lib/constants";
import type { Movimentacao, TipoMov } from "@/types";
import MobileItemCard, { CardField, FIELD_CLS, FIELD_MONO_CLS } from "@/components/ui/MobileItemCard";

interface Props {
  rows: Movimentacao[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Movimentacao, value: unknown) => void;
  onDelete: (id: string) => void;
}

export default function MovimentacoesTable({ rows, onAdd, onUpdate, onDelete }: Props) {
  return (
    <div>
      <div className="bg-mov rounded-t-lg px-4 py-2.5 flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-[.5px]">Movimentações de Reserva</h3>
        <button onClick={onAdd} className="bg-white/20 hover:bg-white/35 text-white text-xs font-semibold px-2.5 py-1 rounded-md transition-colors">
          + Adicionar
        </button>
      </div>
      <div className="text-[11px] text-muted italic px-3 py-1.5 bg-[#FFF8E1] dark:bg-amarelo/10 border-l-[3px] border-amarelo">
        ⚠ Movimentações não entram no cálculo do resultado.
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block bg-card border border-border border-t-0 rounded-b-lg overflow-hidden">
        <div className="grid grid-cols-[2fr_1.2fr_1fr_32px] bg-thead border-b border-border px-3 py-1.5">
          {["Descrição","Tipo","Valor (R$)",""].map((h, i) => (
            <span key={i} className="text-[10px] font-bold text-muted uppercase tracking-[.4px]">{h}</span>
          ))}
        </div>
        {rows.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted text-center">Nenhuma movimentação.</div>
        )}
        {rows.map(row => (
          <div
            key={row.id}
            className="grid grid-cols-[2fr_1.2fr_1fr_32px] px-3 py-2 items-center gap-2 border-b border-border last:border-0 odd:bg-card even:bg-roweven hover:bg-rowhover"
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
              key={"t" + row.tipo}
              defaultValue={row.tipo}
              onChange={e => onUpdate(row.id, "tipo", e.target.value as TipoMov)}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-sans text-[13px] bg-bg text-apptext w-full outline-none focus:border-accent"
            >
              {TIPOS_MOV.map(t => <option key={t}>{t}</option>)}
            </select>
            <input
              key={"v" + row.valor}
              type="text"
              placeholder="0,00"
              defaultValue={row.valor > 0 ? String(row.valor) : ""}
              onBlur={e => onUpdate(row.id, "valor", parseBrl(e.target.value))}
              className="border-[1.5px] border-border rounded-md px-2 py-1.5 font-mono text-[13px] text-right bg-bg text-apptext w-full outline-none focus:border-accent focus:bg-card transition-colors"
            />
            <button onClick={() => onDelete(row.id)} className="text-[#ccc] dark:text-[#4A5568] hover:text-vermelho dark:hover:text-vermelho text-sm flex items-center justify-center transition-colors">✕</button>
          </div>
        ))}
      </div>

      {/* Mobile: cards expansíveis com swipe para excluir */}
      <div className="md:hidden bg-thead border border-border border-t-0 rounded-b-lg p-2 space-y-2">
        {rows.length === 0 && (
          <div className="px-3 py-4 text-sm text-muted text-center">Nenhuma movimentação.</div>
        )}
        {rows.map(row => (
          <MobileItemCard
            key={row.id}
            title={row.desc}
            subtitle={row.tipo}
            value={brl(Number(row.valor))}
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
            <CardField label="Tipo">
              <select
                key={"t" + row.tipo}
                defaultValue={row.tipo}
                onChange={e => onUpdate(row.id, "tipo", e.target.value as TipoMov)}
                className={FIELD_CLS}
              >
                {TIPOS_MOV.map(t => <option key={t}>{t}</option>)}
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
          </MobileItemCard>
        ))}
      </div>
    </div>
  );
}
