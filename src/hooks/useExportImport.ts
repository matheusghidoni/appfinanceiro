"use client";

import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import { MESES } from "@/lib/constants";
import { mesLabel } from "@/lib/utils";

export function useExportImport() {
  const supabase = createClient();

  async function fetchAll() {
    const [fx, vr, en, mv, pr] = await Promise.all([
      supabase.from("gastos_fixos").select("*").order("mes_ano").order("ordem"),
      supabase.from("gastos_variados").select("*").order("mes_ano").order("ordem"),
      supabase.from("entradas").select("*").order("mes_ano").order("ordem"),
      supabase.from("movimentacoes").select("*").order("mes_ano").order("ordem"),
      supabase.from("parcelamentos").select("*").order("created_at"),
    ]);
    return {
      fixos:    (fx.data ?? []) as Record<string, unknown>[],
      variados: (vr.data ?? []) as Record<string, unknown>[],
      entradas: (en.data ?? []) as Record<string, unknown>[],
      movs:     (mv.data ?? []) as Record<string, unknown>[],
      parcelas: (pr.data ?? []) as Record<string, unknown>[],
    };
  }

  async function exportarExcel() {
    const { fixos, variados, entradas, movs, parcelas } = await fetchAll();
    const wb = XLSX.utils.book_new();

    const mesSet = new Set([
      ...fixos.map(r => r.mes_ano as string),
      ...variados.map(r => r.mes_ano as string),
      ...entradas.map(r => r.mes_ano as string),
    ]);

    for (const key of Array.from(mesSet).sort()) {
      const [mn, an] = key.split("-");
      const nome = MESES[parseInt(mn) - 1].slice(0, 3) + "-" + an.slice(2);

      const fx = fixos.filter(r => r.mes_ano === key);
      const vr = variados.filter(r => r.mes_ano === key);
      const en = entradas.filter(r => r.mes_ano === key);
      const mv = movs.filter(r => r.mes_ano === key);

      const tFx = fx.reduce((s, r) => s + Number(r.valor), 0);
      const tVr = vr.reduce((s, r) => s + Number(r.valor), 0);
      const tEn = en.reduce((s, r) => s + Number(r.valor), 0);

      const rows: unknown[][] = [];
      rows.push([`${MESES[parseInt(mn) - 1]} / ${an}`, "", "", ""]);
      rows.push([]);
      rows.push(["GASTOS FIXOS", "", "", ""]);
      rows.push(["Descrição", "Categoria", "Valor (R$)", "Status"]);
      fx.forEach(r => rows.push([r.desc, r.cat, Number(r.valor), r.pago]));
      rows.push(["Subtotal", "", tFx, ""]); rows.push([]);
      rows.push(["GASTOS VARIADOS", "", "", ""]);
      rows.push(["Descrição", "Categoria", "Valor (R$)", "Status"]);
      vr.forEach(r => rows.push([r.desc, r.cat, Number(r.valor), r.pago]));
      rows.push(["Subtotal", "", tVr, ""]); rows.push([]);
      rows.push(["ENTRADAS", "", "", ""]);
      rows.push(["Descrição", "Tipo", "Valor (R$)", "Status"]);
      en.forEach(r => rows.push([r.desc, r.tipo, Number(r.valor), r.recebido]));
      rows.push(["Total Receita Real", "", tEn, ""]); rows.push([]);
      rows.push(["MOVIMENTAÇÕES", "", "", ""]);
      mv.forEach(r => rows.push([r.desc, r.tipo, Number(r.valor), ""]));
      rows.push([]); rows.push(["RESULTADO DO MÊS", "", tEn - tFx - tVr, ""]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [{ wch: 32 }, { wch: 18 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws, nome);
    }

    // Dashboard
    const dRows: unknown[][] = [["DASHBOARD HISTÓRICO"], []];
    dRows.push(["Mês", "Receita Real", "Total Gastos", "Resultado", "% Gasto/Receita", "Gastos Fixos", "Gastos Variados"]);
    for (const key of Array.from(mesSet).sort()) {
      const rec = entradas.filter(r => r.mes_ano === key).reduce((s, r) => s + Number(r.valor), 0);
      const gfx = fixos.filter(r => r.mes_ano === key).reduce((s, r) => s + Number(r.valor), 0);
      const gvr = variados.filter(r => r.mes_ano === key).reduce((s, r) => s + Number(r.valor), 0);
      dRows.push([mesLabel(key), rec, gfx + gvr, rec - gfx - gvr, rec ? (gfx + gvr) / rec : 0, gfx, gvr]);
    }
    const wd = XLSX.utils.aoa_to_sheet(dRows);
    wd["!cols"] = [{wch:12},{wch:14},{wch:14},{wch:14},{wch:16},{wch:14},{wch:14}];
    XLSX.utils.book_append_sheet(wb, wd, "DASHBOARD");

    // Parcelamentos
    const pRows: unknown[][] = [["CONTROLE DE PARCELAMENTOS"], []];
    pRows.push(["Cliente","Descrição","Valor Total","Parcelas","Pagas","Restantes","R$/Parcela","Recebido","A Receber","Situação"]);
    parcelas.forEach(p => {
      const vp = Number(p.valor_total) / (Number(p.num_parcelas) || 1);
      const rst = Math.max(0, Number(p.num_parcelas) - Number(p.parcelas_pagas));
      pRows.push([p.cliente, p.desc, p.valor_total, p.num_parcelas, p.parcelas_pagas, rst, vp, vp * Number(p.parcelas_pagas), vp * rst, p.situacao]);
    });
    const wp = XLSX.utils.aoa_to_sheet(pRows);
    wp["!cols"] = [{wch:22},{wch:22},{wch:14},{wch:10},{wch:10},{wch:10},{wch:14},{wch:14},{wch:14},{wch:14}];
    XLSX.utils.book_append_sheet(wb, wp, "PARCELAMENTOS");

    XLSX.writeFile(wb, `Controle_Financeiro_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function exportarJSON() {
    const all = await fetchAll();
    const backup = { version: 2, exportado_em: new Date().toISOString(), ...all };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_financeiro_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function restaurarJSON(file: File) {
    const text = await file.text();
    const backup = JSON.parse(text);

    const reqs = ["fixos","variados","entradas","movs","parcelas"];
    if (!reqs.every(k => Array.isArray(backup[k]))) throw new Error("Arquivo de backup inválido");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    await Promise.all([
      supabase.from("gastos_fixos").delete().eq("user_id", user.id),
      supabase.from("gastos_variados").delete().eq("user_id", user.id),
      supabase.from("entradas").delete().eq("user_id", user.id),
      supabase.from("movimentacoes").delete().eq("user_id", user.id),
      supabase.from("parcelamentos").delete().eq("user_id", user.id),
    ]);

    const remap = (rows: Record<string, unknown>[]) =>
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      rows.map(({ id: _id, user_id: _uid, created_at: _ca, updated_at: _ua, ...rest }) => ({
        ...rest, user_id: user.id,
      }));

    await Promise.all([
      backup.fixos.length    && supabase.from("gastos_fixos").insert(remap(backup.fixos)),
      backup.variados.length && supabase.from("gastos_variados").insert(remap(backup.variados)),
      backup.entradas.length && supabase.from("entradas").insert(remap(backup.entradas)),
      backup.movs.length     && supabase.from("movimentacoes").insert(remap(backup.movs)),
      backup.parcelas.length && supabase.from("parcelamentos").insert(remap(backup.parcelas)),
    ]);
  }

  async function apagarTudo() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await Promise.all([
      supabase.from("gastos_fixos").delete().eq("user_id", user.id),
      supabase.from("gastos_variados").delete().eq("user_id", user.id),
      supabase.from("entradas").delete().eq("user_id", user.id),
      supabase.from("movimentacoes").delete().eq("user_id", user.id),
      supabase.from("parcelamentos").delete().eq("user_id", user.id),
    ]);
  }

  return { exportarExcel, exportarJSON, restaurarJSON, apagarTudo };
}
