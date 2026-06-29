"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FIXOS_PADRAO } from "@/lib/constants";
import { mesKey } from "@/lib/utils";
import type { GastoFixo, GastoVariado, Entrada, Movimentacao } from "@/types";

export function useLancamento(mes: string, ano: number) {
  const supabase = createClient();
  const key = mesKey(mes, ano);

  const [fixos, setFixos] = useState<GastoFixo[]>([]);
  const [variados, setVariados] = useState<GastoVariado[]>([]);
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [movs, setMovs] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [f, v, e, m] = await Promise.all([
      supabase.from("gastos_fixos").select("*").eq("mes_ano", key).order("ordem"),
      supabase.from("gastos_variados").select("*").eq("mes_ano", key).order("ordem"),
      supabase.from("entradas").select("*").eq("mes_ano", key).order("ordem"),
      supabase.from("movimentacoes").select("*").eq("mes_ano", key).order("ordem"),
    ]);
    setFixos((f.data as GastoFixo[]) ?? []);
    setVariados((v.data as GastoVariado[]) ?? []);
    setEntradas((e.data as Entrada[]) ?? []);
    setMovs((m.data as Movimentacao[]) ?? []);
    setLoading(false);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Seed default fixed expenses for a new month
  const seedFixos = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const rows = FIXOS_PADRAO.map((it, i) => ({
      user_id: user.id,
      mes_ano: key,
      desc: it.desc,
      cat: it.cat,
      valor: 0,
      pago: "Pendente" as const,
      ordem: i,
    }));
    await supabase.from("gastos_fixos").insert(rows);
    await load();
  }, [key, load]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load().then(() => {
      // If no fixos exist yet for this month, seed defaults
      setFixos(prev => {
        if (prev.length === 0) { seedFixos(); }
        return prev;
      });
    });
  }, [load, seedFixos]);

  // -- Gastos Fixos --
  async function addFixo() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ordem = fixos.length;
    const { data } = await supabase
      .from("gastos_fixos")
      .insert({ user_id: user.id, mes_ano: key, desc: "", cat: "Moradia", valor: 0, pago: "Pendente", ordem })
      .select().single();
    if (data) setFixos(prev => [...prev, data as GastoFixo]);
  }

  async function updateFixo(id: string, field: keyof GastoFixo, value: unknown) {
    setFixos(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    await supabase.from("gastos_fixos").update({ [field]: value }).eq("id", id);
  }

  async function deleteFixo(id: string) {
    setFixos(prev => prev.filter(r => r.id !== id));
    await supabase.from("gastos_fixos").delete().eq("id", id);
  }

  // -- Gastos Variados --
  async function addVariado() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ordem = variados.length;
    const { data } = await supabase
      .from("gastos_variados")
      .insert({ user_id: user.id, mes_ano: key, desc: "", cat: "Alimentação", valor: 0, pago: "Pendente", ordem })
      .select().single();
    if (data) setVariados(prev => [...prev, data as GastoVariado]);
  }

  async function updateVariado(id: string, field: keyof GastoVariado, value: unknown) {
    setVariados(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    await supabase.from("gastos_variados").update({ [field]: value }).eq("id", id);
  }

  async function deleteVariado(id: string) {
    setVariados(prev => prev.filter(r => r.id !== id));
    await supabase.from("gastos_variados").delete().eq("id", id);
  }

  // -- Entradas --
  async function addEntrada() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ordem = entradas.length;
    const { data } = await supabase
      .from("entradas")
      .insert({ user_id: user.id, mes_ano: key, desc: "", tipo: "Honorário – processo", valor: 0, recebido: "Pendente", parcela: "", parcelamento_id: null, parcela_num: null, ordem })
      .select().single();
    if (data) setEntradas(prev => [...prev, data as Entrada]);
  }

  // Mantém parcelas_pagas/situacao do parcelamento em sincronia com os "recebido" das parcelas.
  async function syncParcelamentoProgress(parcelamentoId: string) {
    const { count } = await supabase
      .from("entradas")
      .select("id", { count: "exact", head: true })
      .eq("parcelamento_id", parcelamentoId)
      .eq("recebido", "OK");
    const pagas = count ?? 0;
    const { data: parc } = await supabase
      .from("parcelamentos").select("num_parcelas,situacao").eq("id", parcelamentoId).single();
    const num = (parc as { num_parcelas?: number } | null)?.num_parcelas ?? 0;
    const patch: { parcelas_pagas: number; situacao?: string } = { parcelas_pagas: pagas };
    // Conclui automaticamente quando todas recebidas; reabre se voltar a faltar parcela.
    if (num > 0 && pagas >= num) patch.situacao = "Concluído";
    else if ((parc as { situacao?: string } | null)?.situacao === "Concluído") patch.situacao = "Ativo";
    await supabase.from("parcelamentos").update(patch).eq("id", parcelamentoId);
  }

  async function updateEntrada(id: string, field: keyof Entrada, value: unknown) {
    setEntradas(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    await supabase.from("entradas").update({ [field]: value }).eq("id", id);
    if (field === "recebido") {
      const ent = entradas.find(e => e.id === id);
      if (ent?.parcelamento_id) await syncParcelamentoProgress(ent.parcelamento_id);
    }
  }

  async function deleteEntrada(id: string) {
    setEntradas(prev => prev.filter(r => r.id !== id));
    await supabase.from("entradas").delete().eq("id", id);
  }

  // -- Movimentações --
  async function addMov() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ordem = movs.length;
    const { data } = await supabase
      .from("movimentacoes")
      .insert({ user_id: user.id, mes_ano: key, desc: "", tipo: "Retirada da reserva", valor: 0, ordem })
      .select().single();
    if (data) setMovs(prev => [...prev, data as Movimentacao]);
  }

  async function updateMov(id: string, field: keyof Movimentacao, value: unknown) {
    setMovs(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    await supabase.from("movimentacoes").update({ [field]: value }).eq("id", id);
  }

  async function deleteMov(id: string) {
    setMovs(prev => prev.filter(r => r.id !== id));
    await supabase.from("movimentacoes").delete().eq("id", id);
  }

  return {
    loading,
    fixos, addFixo, updateFixo, deleteFixo,
    variados, addVariado, updateVariado, deleteVariado,
    entradas, addEntrada, updateEntrada, deleteEntrada,
    movs, addMov, updateMov, deleteMov,
  };
}
