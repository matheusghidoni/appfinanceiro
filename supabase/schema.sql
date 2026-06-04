-- Enable RLS on all tables. Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS gastos_fixos (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes_ano    TEXT NOT NULL,
  desc       TEXT NOT NULL DEFAULT '',
  cat        TEXT NOT NULL DEFAULT 'Outros',
  valor      NUMERIC(12,2) NOT NULL DEFAULT 0,
  pago       TEXT NOT NULL DEFAULT 'Pendente',
  ordem      INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gastos_variados (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes_ano    TEXT NOT NULL,
  desc       TEXT NOT NULL DEFAULT '',
  cat        TEXT NOT NULL DEFAULT 'Outros',
  valor      NUMERIC(12,2) NOT NULL DEFAULT 0,
  pago       TEXT NOT NULL DEFAULT 'Pendente',
  ordem      INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entradas (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes_ano    TEXT NOT NULL,
  desc       TEXT NOT NULL DEFAULT '',
  tipo       TEXT NOT NULL DEFAULT 'Outros',
  valor      NUMERIC(12,2) NOT NULL DEFAULT 0,
  recebido   TEXT NOT NULL DEFAULT 'Pendente',
  ordem      INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movimentacoes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes_ano    TEXT NOT NULL,
  desc       TEXT NOT NULL DEFAULT '',
  tipo       TEXT NOT NULL DEFAULT 'Retirada da reserva',
  valor      NUMERIC(12,2) NOT NULL DEFAULT 0,
  ordem      INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parcelamentos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente         TEXT NOT NULL DEFAULT '',
  desc            TEXT NOT NULL DEFAULT '',
  valor_total     NUMERIC(12,2) NOT NULL DEFAULT 0,
  num_parcelas    INTEGER NOT NULL DEFAULT 1,
  parcelas_pagas  INTEGER NOT NULL DEFAULT 0,
  situacao        TEXT NOT NULL DEFAULT 'Ativo',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gastos_fixos_user_mes    ON gastos_fixos(user_id, mes_ano);
CREATE INDEX IF NOT EXISTS idx_gastos_variados_user_mes ON gastos_variados(user_id, mes_ano);
CREATE INDEX IF NOT EXISTS idx_entradas_user_mes        ON entradas(user_id, mes_ano);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_user_mes   ON movimentacoes(user_id, mes_ano);
CREATE INDEX IF NOT EXISTS idx_parcelamentos_user       ON parcelamentos(user_id);

-- Row Level Security
ALTER TABLE gastos_fixos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_variados ENABLE ROW LEVEL SECURITY;
ALTER TABLE entradas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelamentos   ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see/modify their own rows
CREATE POLICY "owner_gastos_fixos"    ON gastos_fixos    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "owner_gastos_variados" ON gastos_variados FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "owner_entradas"        ON entradas        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "owner_movimentacoes"   ON movimentacoes   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "owner_parcelamentos"   ON parcelamentos   FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at on parcelamentos
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_parcelamentos_updated_at
  BEFORE UPDATE ON parcelamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
