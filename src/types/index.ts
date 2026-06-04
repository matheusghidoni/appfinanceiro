export type StatusPago = "OK" | "Pendente" | "Não pagou";
export type StatusRecebido = "OK" | "Pendente" | "Inadimplente";
export type StatusParc = "Ativo" | "Concluído" | "Inadimplente" | "Suspenso";
export type TipoMov = "Retirada da reserva" | "Depósito na reserva" | "Aporte externo";

export interface GastoFixo {
  id: string;
  user_id: string;
  mes_ano: string;
  desc: string;
  cat: string;
  valor: number;
  pago: StatusPago;
  ordem: number;
}

export interface GastoVariado {
  id: string;
  user_id: string;
  mes_ano: string;
  desc: string;
  cat: string;
  valor: number;
  pago: StatusPago;
  ordem: number;
}

export interface Entrada {
  id: string;
  user_id: string;
  mes_ano: string;
  desc: string;
  tipo: string;
  valor: number;
  recebido: StatusRecebido;
  ordem: number;
}

export interface Movimentacao {
  id: string;
  user_id: string;
  mes_ano: string;
  desc: string;
  tipo: TipoMov;
  valor: number;
  ordem: number;
}

export interface Parcelamento {
  id: string;
  user_id: string;
  cliente: string;
  desc: string;
  valor_total: number;
  num_parcelas: number;
  parcelas_pagas: number;
  situacao: StatusParc;
  created_at: string;
  updated_at: string;
}

export interface MesData {
  gastos_fixos: GastoFixo[];
  gastos_variados: GastoVariado[];
  entradas: Entrada[];
  movimentacoes: Movimentacao[];
}
