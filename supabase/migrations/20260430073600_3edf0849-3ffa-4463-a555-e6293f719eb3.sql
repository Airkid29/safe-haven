-- =========================================
-- 1. ROLES & PROFILES
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  country text,
  accepts_contact boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- 2. SPECIALISTS DIRECTORY
-- =========================================
CREATE TYPE public.specialist_type AS ENUM (
  'helpline',         -- ligne d'écoute / numéro vert
  'association',      -- ONG / association
  'authority',        -- police, gendarmerie, ministère
  'legal',            -- avocat, clinique juridique
  'health',           -- centre médical, psychologue
  'shelter'           -- refuge, hébergement d'urgence
);

CREATE TABLE public.specialists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type specialist_type NOT NULL,
  country text NOT NULL,                -- code ISO ex: 'TG','CI','BJ','SN','BF','ML','GH','NE'
  city text,
  phone text,
  email text,
  website text,
  description text,
  languages text[] DEFAULT ARRAY['français'],
  is_free boolean NOT NULL DEFAULT true,
  is_24_7 boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  source_url text,                       -- pour traçabilité
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.specialists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published specialists" ON public.specialists
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins view all specialists" ON public.specialists
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert specialists" ON public.specialists
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update specialists" ON public.specialists
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete specialists" ON public.specialists
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER specialists_set_updated_at
BEFORE UPDATE ON public.specialists
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_specialists_country ON public.specialists(country) WHERE is_published;
CREATE INDEX idx_specialists_type ON public.specialists(type) WHERE is_published;

-- =========================================
-- 3. REPORTS: summary + claim by user
-- =========================================
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS summary_context text,
  ADD COLUMN IF NOT EXISTS last_summarized_at timestamptz,
  ADD COLUMN IF NOT EXISTS message_count integer NOT NULL DEFAULT 0;

-- Allow authenticated user to claim a draft (link user_id) once
CREATE POLICY "Users can claim a report" ON public.reports
  FOR UPDATE USING (auth.uid() IS NOT NULL AND user_id IS NULL)
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports(user_id) WHERE user_id IS NOT NULL;

-- =========================================
-- 4. SEED specialists (West Africa / Togo focus)
-- =========================================
INSERT INTO public.specialists (name, type, country, city, phone, website, description, is_free, is_24_7, is_verified, source_url) VALUES

-- TOGO
('Numéro vert national 1014 — Violences sexuelles', 'helpline', 'TG', NULL, '1014', NULL,
 'Ligne d''écoute gratuite mise en place par le Ministère de la Sécurité et de la Protection civile pour signaler tout cas de viol ou tentative de viol. Prise en charge confidentielle.', true, true, true,
 'https://www.rfi.fr/fr/afrique/20241202-togo-num%C3%A9ro-vert-d%C3%A9noncer-viols'),
('Allô 1011 — Enfants en danger', 'helpline', 'TG', NULL, '1011', NULL,
 'Ligne verte gratuite de la Direction Générale de la Protection de l''Enfant pour signaler maltraitance et abus sur mineurs.', true, true, true, NULL),
('REFED Togo — Réseau des Femmes Engagées pour le Développement', 'association', 'TG', 'Lomé', NULL, 'https://refedtogo.org',
 'Réseau d''associations togolaises agissant contre les violences faites aux femmes et aux filles. Écoute, accompagnement juridique et social.', true, false, true,
 'https://refedtogo.org/agressions-contre-femmes/'),
('WiLDAF Togo — Femmes, Droit et Développement', 'association', 'TG', 'Lomé', '+228 22 20 25 10', 'https://wildaf-ao.org',
 'Antenne togolaise du réseau ouest-africain WiLDAF-AO. Conseil juridique, plaidoyer, accompagnement des victimes de violences basées sur le genre.', true, false, true,
 'https://wildaf-ao.org/'),
('Police nationale — Urgences', 'authority', 'TG', NULL, '117', NULL,
 'Numéro d''urgence de la police nationale togolaise.', true, true, true, NULL),
('Gendarmerie nationale — Urgences', 'authority', 'TG', NULL, '172', NULL,
 'Numéro d''urgence de la gendarmerie nationale togolaise.', true, true, true, NULL),
('Groupe de Réflexion et d''Action Femme, Démocratie et Développement (GF2D)', 'association', 'TG', 'Lomé', '+228 22 26 71 27', NULL,
 'Centre d''écoute, de conseil juridique et d''accompagnement pour femmes victimes de violences.', true, false, true, NULL),

-- CÔTE D'IVOIRE
('Allô Enfant en Détresse — 116', 'helpline', 'CI', NULL, '116', 'https://famille.gouv.ci',
 'Ligne nationale gratuite pour signaler tout enfant en détresse, maltraitance ou abus sexuel. Service du Ministère de la Famille, de la Femme et de l''Enfant.', true, true, true,
 'https://findahelpline.com/fr-FR/countries/ci/topics/sexual-abuse'),
('Plateforme Nationale de Lutte contre les VBG (PNLVBG)', 'association', 'CI', 'Abidjan', NULL, 'https://pnlvbg.ci',
 'Plateforme nationale ivoirienne de coordination de la lutte contre les violences basées sur le genre. Accompagnement, prévention, prise en charge.', true, false, true,
 'https://pnlvbg.ci/'),
('Police secours', 'authority', 'CI', NULL, '110', NULL, 'Police secours Côte d''Ivoire.', true, true, true, NULL),

-- BÉNIN
('Maison MIVO — Soutien aux victimes', 'association', 'BJ', 'Cotonou', NULL, 'https://mivo-benin.org',
 'Espace d''accueil, d''écoute et d''accompagnement des victimes de violences. Tolérance zéro pour les abus et le harcèlement.', true, false, true,
 'https://mivo-benin.org/je-signale/'),
('Ligne Enfance UNICEF Bénin', 'helpline', 'BJ', NULL, '138', NULL,
 'Ligne d''écoute pour enfants victimes de violences et abus, soutenue par l''UNICEF Bénin.', true, true, true,
 'https://findahelpline.com/fr-FR/countries/bj/topics/sexual-abuse'),
('Police républicaine — Urgences', 'authority', 'BJ', NULL, '117', NULL, 'Numéro d''urgence de la Police républicaine du Bénin.', true, true, true, NULL),

-- SÉNÉGAL
('Association des Juristes Sénégalaises (AJS)', 'legal', 'SN', 'Dakar', '+221 33 824 87 47', NULL,
 'Boutique de droit gratuite, accompagnement juridique des femmes victimes de violences.', true, false, true, NULL),
('Police secours', 'authority', 'SN', NULL, '17', NULL, 'Police secours Sénégal.', true, true, true, NULL),
('Samu Social Sénégal', 'health', 'SN', 'Dakar', '+221 33 889 26 26', NULL,
 'Aide médicale et sociale d''urgence, accueil de personnes en grande détresse.', true, true, true, NULL),

-- BURKINA FASO
('Police secours', 'authority', 'BF', NULL, '17', NULL, 'Numéro d''urgence police Burkina Faso.', true, true, true, NULL),
('Allô Enfance', 'helpline', 'BF', NULL, '116', NULL,
 'Ligne nationale gratuite pour les enfants en détresse au Burkina Faso.', true, true, true, NULL),

-- MALI
('Police secours', 'authority', 'ML', NULL, '80 00 11 15', NULL, 'Numéro d''urgence police Mali.', true, true, true, NULL),
('AJM — Association des Juristes Maliennes', 'legal', 'ML', 'Bamako', NULL, NULL,
 'Conseil et accompagnement juridique pour les femmes et enfants victimes de violences.', true, false, true, NULL),

-- GHANA
('DOVVSU — Domestic Violence and Victim Support Unit', 'authority', 'GH', 'Accra', '055 100 0900', NULL,
 'Unité spécialisée de la police ghanéenne dédiée aux victimes de violences domestiques et sexuelles.', true, true, true, NULL),
('Helpline Ghana', 'helpline', 'GH', NULL, '0800 800 800', NULL,
 'Ligne d''assistance nationale gratuite pour les enfants et adultes en détresse.', true, true, true, NULL),

-- INTERNATIONAL / NUMÉRIQUE
('Plateforme PHAROS — Signalement contenus illicites en ligne', 'authority', 'INT', NULL, NULL, 'https://www.internet-signalement.gouv.fr',
 'Plateforme française de signalement des contenus et comportements illicites sur internet (cyberharcèlement, menaces, contenus pédocriminels). Utile depuis tout pays francophone.', true, false, true, NULL),
('Stop Fisha — Lutte contre le cybersexisme', 'association', 'INT', NULL, NULL, 'https://stopfisha.org',
 'Association internationale francophone qui aide les victimes de cyberharcèlement à caractère sexiste et sexuel à supprimer des contenus diffusés sans consentement.', true, false, true, NULL);

-- =========================================
-- 5. ANONYMOUS ADMIN STATS VIEW
-- =========================================
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  date_trunc('month', created_at)::date AS month,
  harassment_type,
  status,
  count(*)::int AS total
FROM public.reports
GROUP BY 1, 2, 3;

-- View permissions handled by underlying RLS; admins query via RPC below.
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(month date, harassment_type harassment_type, status report_status, total int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT month, harassment_type, status, total
  FROM public.admin_stats
  WHERE public.has_role(auth.uid(), 'admin')
$$;