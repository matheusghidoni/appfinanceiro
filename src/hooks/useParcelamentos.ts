"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Parcelamento } from "@/types";

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

  async function add(payload: Omit<Parcelamento, "id" | "user_id" | "created_at" | "updated_at">) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("parcelamentos")
      .insert({ ...payload, user_id: user.id })
      .select().single();
    if (data) setParcelas(prev => [data as Parcelamento, ...prev]);
  }

  async function update(id: string, payload: Partial<Parcelamento>) {
    setParcelas(prev => prev.map(p => p.id === id ? { ...p, ...payload } : p));
    await supabase.from("parcelamentos").update(payload).eq("id", id);
  }

  async function remove(id: string) {
    setParcelas(prev => prev.filter(p => p.id !== id));
    await supabase.from("parcelamentos").delete().eq("id", id);
  }

  return { loading, parcelas, add, update, remove };
}
