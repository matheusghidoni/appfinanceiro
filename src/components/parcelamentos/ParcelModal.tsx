"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { STATUS_PARC } from "@/lib/constants";
import { parseBrl } from "@/lib/utils";
import type { Parcelamento, StatusParc } from "@/types";

interface Props {
  open: boolean;
  initial: Parcelamento | null;
  onSave: (payload: Omit<Parcelamento, "id"|"user_id"|"created_at"|"updated_at">) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function ParcelModal({ open, initial, onSave, onDelete, onClose }: Props) {
  const [cliente, setCliente] = useState("");
  const [desc, setDesc] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [numParcelas, setNumParcelas] = useState(1);
  const [parcelasPagas, setParcelasPagas] = useState(0);
  const [situacao, setSituacao] = useState<StatusParc>("Ativo");

  useEffect(() => {
    if (initial) {
      setCliente(initial.cliente);
      setDesc(initial.desc);
      setValorTotal(String(initial.valor_total));
      setNumParcelas(initial.num_parcelas);
      setParcelasPagas(initial.parcelas_pagas);
      setSituacao(initial.situacao);
    } else {
      setCliente(""); setDesc(""); setValorTotal("");
      setNumParcelas(1); setParcelasPagas(0); setSituacao("Ativo");
    }
  }, [initial, open]);

  function handleSave() {
    if (!cliente.trim()) return;
    const n = numParcelas || 1;
    const pg = Math.min(parcelasPagas, n);
    const sit: StatusParc = pg === n && n > 0 ? "Concluído" : situacao;
    onSave({ cliente: cliente.trim(), desc, valor_total: parseBrl(valorTotal), num_parcelas: n, parcelas_pagas: pg, situacao: sit });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="text-base font-bold text-heading mb-5">{initial ? "Editar Parcelamento" : "Novo Parcelamento"}</h3>
      <div className="space-y-2.5">
        {[
          { label: "Cliente", el: <input value={cliente} onChange={e => setCliente(e.target.value)} className={fieldCls} /> },
          { label: "Descrição", el: <input value={desc} onChange={e => setDesc(e.target.value)} className={fieldCls} /> },
          { label: "Valor Total", el: <input value={valorTotal} onChange={e => setValorTotal(e.target.value)} placeholder="0,00" className={fieldCls} /> },
          { label: "Nº Parcelas", el: <input type="number" min={1} value={numParcelas} onChange={e => setNumParcelas(parseInt(e.target.value)||1)} className={fieldCls} /> },
          { label: "Parcelas Pagas", el: <input type="number" min={0} value={parcelasPagas} onChange={e => setParcelasPagas(parseInt(e.target.value)||0)} className={fieldCls} /> },
          { label: "Situação", el: (
            <select value={situacao} onChange={e => setSituacao(e.target.value as StatusParc)} className={fieldCls}>
              {STATUS_PARC.map(s => <option key={s}>{s}</option>)}
            </select>
          )},
        ].map(({ label, el }) => (
          <div key={label} className="grid grid-cols-[130px_1fr] items-center gap-2">
            <label className="text-[13px] font-medium">{label}</label>
            {el}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-5">
        {onDelete ? (
          <button onClick={onDelete} className="bg-vermelho text-white rounded-lg px-4 py-2 text-[13px] font-sans cursor-pointer">
            Remover
          </button>
        ) : <span />}
        <div className="flex gap-2">
          <button onClick={onClose} className="border-[1.5px] border-border rounded-lg px-4 py-2 text-[13px] font-sans cursor-pointer bg-none">
            Cancelar
          </button>
          <button onClick={handleSave} className="bg-ent text-white rounded-lg px-4 py-2 text-[13px] font-semibold cursor-pointer hover:opacity-90">
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
}

const fieldCls = "border-[1.5px] border-border rounded-lg px-2.5 py-2 font-sans text-[13px] bg-bg text-apptext outline-none w-full focus:border-accent";
