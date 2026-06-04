"use client";

import { useState } from "react";
import { MESES } from "@/lib/constants";
import { brl } from "@/lib/utils";
import { useLancamento } from "@/hooks/useLancamento";
import { ToastProvider } from "@/components/ui/Toast";
import GastosFixosTable from "./GastosFixosTable";
import GastosVariadosTable from "./GastosVariadosTable";
import EntradasTable from "./EntradasTable";
import MovimentacoesTable from "./MovimentacoesTable";

export default function LancamentoScreen() {
  const now = new Date();
  const [mes, setMes] = useState(MESES[now.getMonth()]);
  const [ano, setAno] = useState(now.getFullYear());

  const {
    loading,
    fixos, addFixo, updateFixo, deleteFixo,
    variados, addVariado, updateVariado, deleteVariado,
    entradas, addEntrada, updateEntrada, deleteEntrada,
    movs, addMov, updateMov, deleteMov,
  } = useLancamento(mes, ano);

  const totalReceita = entradas.reduce((s, it) => s + Number(it.valor), 0);
  const totalGastos = [...fixos, ...variados].reduce((s, it) => s + Number(it.valor), 0);
  const resultado = totalReceita - totalGastos;
  const positive = resultado >= 0;

  const curAno = now.getFullYear();
  const anos = Array.from({ length: 8 }, (_, i) => curAno - 3 + i);

  return (
    <ToastProvider>
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 h-[60px] flex items-center justify-between flex-shrink-0">
          <h1 className="text-[17px] font-bold text-navy">Lançamento Mensal</h1>
          <div className="flex items-center gap-2.5">
            <select
              value={mes}
              onChange={e => setMes(e.target.value)}
              className="border-[1.5px] border-border rounded-lg px-2.5 py-1.5 font-sans text-[13px] font-medium bg-bg text-apptext cursor-pointer outline-none focus:border-navy"
            >
              {MESES.map(m => <option key={m}>{m}</option>)}
            </select>
            <select
              value={ano}
              onChange={e => setAno(parseInt(e.target.value))}
              className="border-[1.5px] border-border rounded-lg px-2.5 py-1.5 font-sans text-[13px] font-medium bg-bg text-apptext cursor-pointer outline-none focus:border-navy"
            >
              {anos.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Summary Bar */}
        <div className="bg-card border-b border-border px-6 py-3 flex gap-3 flex-shrink-0 flex-wrap">
          <SumCard label="Receita Real" value={brl(totalReceita)} color="bg-ent" />
          <SumCard label="Total Gastos" value={brl(totalGastos)} color="bg-var" />
          <SumCard
            label="Resultado"
            value={brl(resultado)}
            color={positive ? "bg-[#2d6a1f]" : "bg-vermelho"}
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 pb-8 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted text-sm">
              Carregando…
            </div>
          ) : (
            <div className="space-y-5">
              <GastosFixosTable rows={fixos} onAdd={addFixo} onUpdate={updateFixo} onDelete={deleteFixo} />
              <GastosVariadosTable rows={variados} onAdd={addVariado} onUpdate={updateVariado} onDelete={deleteVariado} />
              <EntradasTable rows={entradas} onAdd={addEntrada} onUpdate={updateEntrada} onDelete={deleteEntrada} />
              <MovimentacoesTable rows={movs} onAdd={addMov} onUpdate={updateMov} onDelete={deleteMov} />
            </div>
          )}
        </div>
      </div>
    </ToastProvider>
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
