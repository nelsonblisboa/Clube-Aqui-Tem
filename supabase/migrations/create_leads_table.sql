-- Criar tabela leads com estrutura correta
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índice no email
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção anônima (para captura de leads)
CREATE POLICY "Allow anonymous insert on leads" ON public.leads
  FOR INSERT
  WITH CHECK (true);

-- Política para admin visualizar todos os leads
CREATE POLICY "Allow authenticated select on leads" ON public.leads
  FOR SELECT
  USING (auth.role() = 'authenticated');
