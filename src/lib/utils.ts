import { MESES } from "./constants";

export function mesKey(mes: string, ano: number): string {
  return String(MESES.indexOf(mes) + 1).padStart(2, "0") + "-" + ano;
}

export function parseMesKey(key: string): { mes: string; ano: number } {
  const [mn, an] = key.split("-");
  return { mes: MESES[parseInt(mn) - 1], ano: parseInt(an) };
}

export function mesLabel(key: string): string {
  const [mn, an] = key.split("-");
  return MESES[parseInt(mn) - 1].slice(0, 3) + "/" + an.slice(2);
}

export function brl(value: number): string {
  return "R$ " + value.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parseBrl(s: string | number | null | undefined): number {
  if (typeof s === "number") return s;
  const str = String(s ?? "").trim().replace("R$", "").replace(/\s/g, "");
  let cleaned = str;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    cleaned = cleaned.replace(",", ".");
  }
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}
