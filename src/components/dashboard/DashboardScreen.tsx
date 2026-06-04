"use client";

import { brl } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardScreen() {
  const { loading, historico } = useDashboard();

  const n = historico.length;
  const avgR = n ? historico.reduce((s, d) => s + d.rec, 0) / n : 0;
  const avgG = n ? historico.reduce((s, d) => s + d.gas, 0) / n : 0;
  const pos = historico.filter(d => d.res >= 0).length;
  const mx = Math.max(...historico.map(d => Math.max(d.rec, d.gas)), 1);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-card border-b border-border px-6 h-[60px] flex items-center flex-shrink-0">
        <h1 className="text-[17px] font-bold text-navy">Dashboard Histórico</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-muted text-sm">Carregando…</div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
              <DcCard color="bg-ent"         label="Receita Média"    value={n ? brl(avgR) : "—"}       sub="por mês" />
              <DcCard color="bg-var"         label="Gastos Médios"    value={n ? brl(avgG) : "—"}       sub="por mês" />
              <DcCard color="bg-[#1a6b3a]"  label="Resultado Médio"  value={n ? brl(avgR - avgG) : "—"} sub="por mês" />
              <DcCard color="bg-navy"        label="Meses Positivos"  value={n ? `${pos}/${n}` : "—"}   sub="dos lançados" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-4">
              {/* Bar chart */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="text-[13px] font-bold text-navy mb-3.5">Receita vs Gastos por mês</h4>
                {historico.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-muted text-[13px]">Nenhum lançamento ainda.</div>
                ) : (
                  <>
                    <div className="flex items-end gap-1.5 h-40 px-1">
                      {historico.map(d => (
                        <div key={d.key} className="flex-1 flex flex-col items-center">
                          <div className="flex items-end gap-0.5 h-[130px] w-full">
                            <div
                              className="flex-1 bg-verde rounded-t cursor-pointer hover:opacity-75 transition-opacity"
                              style={{ height: `${Math.round(d.rec / mx * 130)}px`, minHeight: 3 }}
                              title={`${d.label} · ${brl(d.rec)}`}
                            />
                            <div
                              className="flex-1 bg-var rounded-t cursor-pointer hover:opacity-75 transition-opacity"
                              style={{ height: `${Math.round(d.gas / mx * 130)}px`, minHeight: 3 }}
                              title={`${d.label} · ${brl(d.gas)}`}
                            />
                          </div>
                          <span className="text-[9px] text-muted text-center mt-1 w-full">{d.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3.5 mt-2.5">
                      <span className="text-[11px] flex items-center gap-1.5 text-muted">
                        <span className="w-2.5 h-2.5 bg-verde rounded-[2px] inline-block" />Receita
                      </span>
                      <span className="text-[11px] flex items-center gap-1.5 text-muted">
                        <span className="w-2.5 h-2.5 bg-var rounded-[2px] inline-block" />Gastos
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* History table */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="text-[13px] font-bold text-navy mb-3.5">Histórico mensal</h4>
                {historico.length === 0 ? (
                  <div className="text-center text-muted text-[12px] py-5">Sem dados</div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {["Mês","Receita","Gastos","Resultado"].map((h, i) => (
                          <th key={h} className={`text-[10px] font-bold text-muted uppercase pb-1.5 border-b-[1.5px] border-border ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...historico].reverse().map(d => (
                        <tr key={d.key} className="hover:bg-[#F0F4FF]">
                          <td className="font-sans font-semibold text-[12px] py-2 pl-1 border-b border-border">{d.label}</td>
                          <td className="font-mono text-[12px] py-2 text-right border-b border-border">{brl(d.rec)}</td>
                          <td className="font-mono text-[12px] py-2 text-right border-b border-border">{brl(d.gas)}</td>
                          <td className={`font-mono text-[12px] py-2 text-right border-b border-border ${d.res >= 0 ? "text-[#15803d]" : "text-vermelho"}`}>{brl(d.res)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DcCard({ color, label, value, sub }: { color: string; label: string; value: string; sub: string }) {
  return (
    <div className={`${color} rounded-xl px-4 py-4 flex flex-col gap-1`}>
      <span className="text-[11px] font-semibold text-white/75">{label}</span>
      <span className="text-[22px] font-bold text-white font-mono">{value}</span>
      <span className="text-[11px] text-white/50 mt-0.5">{sub}</span>
    </div>
  );
}
