"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mesLabel } from "@/lib/utils";

export interface MesHistorico {
  key: string;
  label: string;
  rec: number;
  gas: number;
  res: number;
  gfx: number;
  gvr: number;
}

export function useDashboard() {
  const supabase = createClient();
  const [historico, setHistorico] = useState<MesHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [fx, vr, en] = await Promise.all([
      supabase.from("gastos_fixos").select("mes_ano,valor"),
      supabase.from("gastos_variados").select("mes_ano,valor"),
      supabase.from("entradas").select("mes_ano,valor"),
    ]);

    const mesSet = new Set([
      ...(fx.data ?? []).map((r: { mes_ano: string }) => r.mes_ano),
      ...(vr.data ?? []).map((r: { mes_ano: string }) => r.mes_ano),
      ...(en.data ?? []).map((r: { mes_ano: string }) => r.mes_ano),
    ]);

    const result: MesHistorico[] = Array.from(mesSet).sort().map(key => {
      const gfx = (fx.data ?? []).filter((r: { mes_ano: string }) => r.mes_ano === key)
        .reduce((s: number, r: { valor: number }) => s + Number(r.valor), 0);
      const gvr = (vr.data ?? []).filter((r: { mes_ano: string }) => r.mes_ano === key)
        .reduce((s: number, r: { valor: number }) => s + Number(r.valor), 0);
      const rec = (en.data ?? []).filter((r: { mes_ano: string }) => r.mes_ano === key)
        .reduce((s: number, r: { valor: number }) => s + Number(r.valor), 0);
      const gas = gfx + gvr;
      return { key, label: mesLabel(key), rec, gas, res: rec - gas, gfx, gvr };
    }).filter(d => d.rec > 0 || d.gas > 0);

    setHistorico(result);
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return { loading, historico };
}
