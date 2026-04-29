-- Enums
CREATE TYPE public.harassment_type AS ENUM (
  'scolaire', 'professionnel', 'sexuel', 'moral', 'cyber', 'discriminatoire', 'familial', 'autre'
);
CREATE TYPE public.report_status AS ENUM ('draft', 'submitted', 'in_progress', 'closed');
CREATE TYPE public.action_level AS ENUM ('temoignage', 'accompagnement', 'dossier');

-- Reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recovery_code TEXT NOT NULL UNIQUE,
  harassment_type public.harassment_type,
  description TEXT,
  incident_date DATE,
  location TEXT,
  aggressor_info TEXT,
  action_level public.action_level DEFAULT 'temoignage',
  status public.report_status NOT NULL DEFAULT 'draft',
  structuration_score INT DEFAULT 0,
  ai_summary TEXT,
  user_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_code ON public.reports(recovery_code);

-- Evidences
CREATE TABLE public.report_evidences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI messages
CREATE TABLE public.report_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_report ON public.report_messages(report_id, created_at);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_reports_updated
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: locked down. All access goes through edge functions using service role + recovery code.
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_messages ENABLE ROW LEVEL SECURITY;

-- Optional: authenticated user with linked user_id can see their own
CREATE POLICY "Owner can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Owner can update own reports" ON public.reports
  FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Owner can view own evidences" ON public.report_evidences
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.reports r WHERE r.id = report_id AND r.user_id = auth.uid()));
CREATE POLICY "Owner can view own messages" ON public.report_messages
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.reports r WHERE r.id = report_id AND r.user_id = auth.uid()));

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('evidences', 'evidences', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: only authenticated owner can read; uploads via edge function (service role)
CREATE POLICY "Owners can read their evidences"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'evidences'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.reports r
    WHERE r.user_id = auth.uid()
      AND position(r.id::text in name) > 0
  )
);