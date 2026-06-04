"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-lg text-center">
          <div className="text-4xl mb-3">✉️</div>
          <h2 className="text-lg font-bold text-navy mb-2">Verifique seu e-mail</h2>
          <p className="text-sm text-muted">
            Enviamos um link de confirmação para <strong>{email}</strong>.<br/>
            Confirme para ativar sua conta.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-navy font-semibold hover:underline">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-lg">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💰</div>
          <h1 className="text-xl font-bold text-navy">Criar conta</h1>
          <p className="text-sm text-muted mt-1">Comece a controlar suas finanças</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border-[1.5px] border-border rounded-lg px-3 py-2 text-sm font-sans outline-none focus:border-navy bg-bg"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border-[1.5px] border-border rounded-lg px-3 py-2 text-sm font-sans outline-none focus:border-navy bg-bg"
              placeholder="mínimo 6 caracteres"
            />
          </div>

          {error && (
            <p className="text-vermelho text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ent text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Cadastrando…" : "Cadastrar"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-navy font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
