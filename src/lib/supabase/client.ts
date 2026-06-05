import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (typeof window !== "undefined") {
  if (!SUPABASE_URL || SUPABASE_URL.includes("placeholder")) {
    console.error("[Supabase] NEXT_PUBLIC_SUPABASE_URL não configurada:", SUPABASE_URL);
  }
  if (!SUPABASE_KEY || SUPABASE_KEY.includes("placeholder")) {
    console.error("[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada");
  }
}

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
