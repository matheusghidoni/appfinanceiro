"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TIPO_PARCELAMENTO } from "@/lib/constants";
import { addMonths } from "@/lib/utils";
import type { Parcelamento, Entrada } from "@/types";

// Valores das parcelas em reais; a soma bate exatamente com o total (resto na última).
export function installmentValues(total: number, n: number): number[] {
  if (n <= 0) return [];
  const totalCents = Math.round(Number(total) * 100);
  const base = Math.floor(totalCents / n);
  const out = Array.from({ length: n }, () => base);
  out[n - 1] += totalCents - base * n;
  return out.map(c => c / 100);
}

export function useParcelamentos() {
  const supabase = createClient();
  const [parcelas, setParcelas] = useState<Parcelamento[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("parcelamentos")
      .select("*")
      .order("created_at", { ascending: false });
    setParcelas((data as Parcelamento[]) ?? []);
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  // Cria/atualiza as entradas mensais que representam as parcelas deste parcelamento.
  // Preserva o "recebido" das parcelas já existentes (especialmente as marcadas como OK).
  const syncEntradas = useCallback(async (p: Parcelamento) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !p.mes_inicial || p.num_parcelas < 1) return;

    const values = installmentValues(Number(p.valor_total), p.num_parcelas);
    const descBase = p.desc?.trim() ? `${p.cliente} — ${p.desc}` : p.cliente;

    const { data: existingData } = await supabase
      .from("entradas").select("*").eq("parcelamento_id", p.id);
    const byNum = new Map<number, Entrada>(
      ((existingData as Entrada[]) ?? []).map(e => [e.parcela_num ?? 0, e])
    );

    for (let i = 1; i <= p.num_parcelas; i++) {
      const mes_ano = addMonths(p.mes_inicial, i - 1);
      const valor = values[i - 1];
      const parcela = `${i}/${p.num_parcelas}`;
      const cur = byNum.get(i);
      if (cur) {
        // Atualiza valor/mês/descrição, mas mantém o "recebido" definido pelo usuário.
        await supabase.from("entradas").update({
          mes_ano, desc: descBase, tipo: TIPO_PARCELAMENTO, valor, parcela,
        }).eq("id", cur.id);
        byNum.delete(i);
      } else {
        await supabase.from("entradas").insert({
          user_id: user.id, mes_ano, desc: descBase, tipo: TIPO_PARCELAMENTO,
          valor, recebido: i <= p.parcelas_pagas ? "OK" : "Pendente",
          parcela, parcelamento_id: p.id, parcela_num: i, ordem: 100 + i,
        });
      }
    }

    // Parcelas que sobraram (redução de num_parcelas): apaga as não recebidas,
    // destaca (mantém como lançamento avulso) as já recebidas.
    for (const e of Array.from(byNum.values())) {
      if (e.recebido === "OK") {
        await supabase.from("entradas")
          .update({ parcelamento_id: null, parcela_num: null }).eq("id", e.id);
      } else {
        await supabase.from("entradas").delete().eq("id", e.id);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function add(payload: Omit<Parcelamento, "id" | "user_id" | "created_at" | "updated_at">) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("parcelamentos")
      .insert({ ...payload, user_id: user.id })
      .select().single();
    if (data) {
      setParcelas(prev => [data as Parcelamento, ...prev]);
      await syncEntradas(data as Parcelamento);
    }
  }

  async function update(id: string, payload: Partial<Parcelamento>) {
    setParcelas(prev => prev.map(p => p.id === id ? { ...p, ...payload } : p));
    const { data } = await supabase
      .from("parcelamentos").update(payload).eq("id", id).select().single();
    if (data) await syncEntradas(data as Parcelamento);
  }

  async function remove(id: string) {
    setParcelas(prev => prev.filter(p => p.id !== id));
    // Apaga as parcelas geradas ainda não recebidas; preserva (destaca) as já recebidas.
    await supabase.from("entradas").delete().eq("parcelamento_id", id).neq("recebido", "OK");
    await supabase.from("entradas")
      .update({ parcelamento_id: null, parcela_num: null })
      .eq("parcelamento_id", id).eq("recebido", "OK");
    await supabase.from("parcelamentos").delete().eq("id", id);
  }

  return { loading, parcelas, add, update, remove };
}
