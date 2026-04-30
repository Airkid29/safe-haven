-- Enrich Togo directory entries provided by product requirements.
-- Idempotent upsert-by-(country,name) to avoid duplicates across environments.

DO $$
BEGIN
  -- GF2D
  UPDATE public.specialists
  SET
    type = 'helpline',
    city = 'Lomé',
    phone = '+228 93 96 89 89 / +228 22 61 49 25',
    description = 'Ligne d''écoute GF2D (WhatsApp disponible) pour violences domestiques et sexuelles, avec soutien psychologique. Horaires: lun-ven 8h-17h30. Service gratuit et confidentiel.',
    is_free = true,
    is_24_7 = false,
    is_verified = true,
    is_published = true,
    source_url = NULL
  WHERE country = 'TG' AND name = 'GF2D (Groupe de réflexion et d''action Femme, Démocratie et Développement)';
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, city, phone, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('GF2D (Groupe de réflexion et d''action Femme, Démocratie et Développement)', 'helpline', 'TG', 'Lomé', '+228 93 96 89 89 / +228 22 61 49 25', 'Ligne d''écoute GF2D (WhatsApp disponible) pour violences domestiques et sexuelles, avec soutien psychologique. Horaires: lun-ven 8h-17h30. Service gratuit et confidentiel.', true, false, true, true);
  END IF;

  -- RAPAA
  UPDATE public.specialists
  SET
    type = 'helpline',
    phone = '+228 90 70 50 82 / +228 99 40 71 13',
    description = 'RAPAA: écoute psychologique, trauma et addictions. Horaires: lun-sam. Service gratuit.',
    is_free = true,
    is_24_7 = false,
    is_verified = true,
    is_published = true
  WHERE country = 'TG' AND name = 'RAPAA (Recherche Action Prévention Accompagnement des Addictions)';
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, phone, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('RAPAA (Recherche Action Prévention Accompagnement des Addictions)', 'helpline', 'TG', '+228 90 70 50 82 / +228 99 40 71 13', 'RAPAA: écoute psychologique, trauma et addictions. Horaires: lun-sam. Service gratuit.', true, false, true, true);
  END IF;

  -- SMVM
  UPDATE public.specialists
  SET
    type = 'health',
    city = 'Lomé',
    phone = '+228 90 47 44 95',
    description = 'SMVM (Santé Meilleure Vie Meilleure): prise en charge des victimes de violences sexuelles.',
    is_free = true,
    is_verified = true,
    is_published = true
  WHERE country = 'TG' AND name = 'SMVM (Santé Meilleure Vie Meilleure)';
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, city, phone, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('SMVM (Santé Meilleure Vie Meilleure)', 'health', 'TG', 'Lomé', '+228 90 47 44 95', 'SMVM (Santé Meilleure Vie Meilleure): prise en charge des victimes de violences sexuelles.', true, false, true, true);
  END IF;

  -- ASVITTO
  UPDATE public.specialists
  SET
    type = 'association',
    phone = '+228 99 67 81 30',
    description = 'ASVITTO: accompagnement des victimes de torture et violences institutionnelles.',
    is_free = true,
    is_verified = true,
    is_published = true
  WHERE country = 'TG' AND name = 'ASVITTO (Association des Victimes de la Torture au Togo)';
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, phone, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('ASVITTO (Association des Victimes de la Torture au Togo)', 'association', 'TG', '+228 99 67 81 30', 'ASVITTO: accompagnement des victimes de torture et violences institutionnelles.', true, false, true, true);
  END IF;

  -- AVA-TOGO
  UPDATE public.specialists
  SET
    type = 'legal',
    phone = '+228 90 03 25 48',
    description = 'AVA-TOGO: réinsertion des victimes (trauma, accidents), accompagnement social et juridique.',
    is_free = true,
    is_verified = true,
    is_published = true
  WHERE country = 'TG' AND name = 'AVA-TOGO (Association des Victimes d''Accidents)';
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, phone, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('AVA-TOGO (Association des Victimes d''Accidents)', 'legal', 'TG', '+228 90 03 25 48', 'AVA-TOGO: réinsertion des victimes (trauma, accidents), accompagnement social et juridique.', true, false, true, true);
  END IF;

  -- CACIT
  UPDATE public.specialists
  SET
    type = 'legal',
    phone = '+228 22 21 70 29',
    description = 'CACIT: assistance juridique, judiciaire et psychologique. Structure clé pour le pont vers la justice.',
    is_free = true,
    is_verified = true,
    is_published = true
  WHERE country = 'TG' AND name = 'CACIT (Collectif des Associations Contre l''Impunité au Togo)';
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, phone, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('CACIT (Collectif des Associations Contre l''Impunité au Togo)', 'legal', 'TG', '+228 22 21 70 29', 'CACIT: assistance juridique, judiciaire et psychologique. Structure clé pour le pont vers la justice.', true, false, true, true);
  END IF;

  -- WILDAF-Togo (normalize existing and keep legal focus)
  UPDATE public.specialists
  SET
    type = 'legal',
    name = 'WILDAF-Togo (Women in Law and Development in Africa)',
    description = 'WILDAF-Togo: accompagnement des violences basées sur le genre, assistance juridique et centre d''écoute digitalisé.',
    is_free = true,
    is_verified = true,
    is_published = true
  WHERE country = 'TG' AND name IN (
    'WiLDAF Togo — Femmes, Droit et Développement',
    'WILDAF-Togo (Women in Law and Development in Africa)'
  );
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, city, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('WILDAF-Togo (Women in Law and Development in Africa)', 'legal', 'TG', 'Lomé', 'WILDAF-Togo: accompagnement des violences basées sur le genre, assistance juridique et centre d''écoute digitalisé.', true, false, true, true);
  END IF;

  -- ASDEF
  UPDATE public.specialists
  SET
    type = 'association',
    phone = '+228 90 12 23 23',
    description = 'ASDEF: protection des jeunes filles et prévention des violences.',
    is_free = true,
    is_verified = true,
    is_published = true
  WHERE country = 'TG' AND name = 'ASDEF (Association de Soutien au Développement et à l''Éducation de la Jeune Fille)';
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, phone, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('ASDEF (Association de Soutien au Développement et à l''Éducation de la Jeune Fille)', 'association', 'TG', '+228 90 12 23 23', 'ASDEF: protection des jeunes filles et prévention des violences.', true, false, true, true);
  END IF;

  -- Required emergency records
  UPDATE public.specialists
  SET
    type = 'authority',
    phone = '117',
    description = 'Police nationale togolaise - numéro d''urgence national.',
    is_24_7 = true,
    is_free = true,
    is_verified = true,
    is_published = true
  WHERE country = 'TG' AND name = 'Police nationale — Urgences';
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, phone, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('Police nationale — Urgences', 'authority', 'TG', '117', 'Police nationale togolaise - numéro d''urgence national.', true, true, true, true);
  END IF;

  UPDATE public.specialists
  SET
    type = 'authority',
    phone = '172',
    description = 'Gendarmerie nationale togolaise - numéro d''urgence national.',
    is_24_7 = true,
    is_free = true,
    is_verified = true,
    is_published = true
  WHERE country = 'TG' AND name = 'Gendarmerie nationale — Urgences';
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, phone, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('Gendarmerie nationale — Urgences', 'authority', 'TG', '172', 'Gendarmerie nationale togolaise - numéro d''urgence national.', true, true, true, true);
  END IF;

  UPDATE public.specialists
  SET
    type = 'health',
    description = 'Centres hospitaliers d''urgence (Togo). Contactez d''abord le service local le plus proche ou la police/gendarmerie en cas de danger immédiat.',
    is_24_7 = true,
    is_free = true,
    is_verified = true,
    is_published = true
  WHERE country = 'TG' AND name = 'Centres hospitaliers (urgences)';
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('Centres hospitaliers (urgences)', 'health', 'TG', 'Centres hospitaliers d''urgence (Togo). Contactez d''abord le service local le plus proche ou la police/gendarmerie en cas de danger immédiat.', true, true, true, true);
  END IF;

  UPDATE public.specialists
  SET
    type = 'authority',
    description = 'Services sociaux / action sociale (Togo) pour orientation, protection et prise en charge sociale.',
    is_24_7 = false,
    is_free = true,
    is_verified = true,
    is_published = true
  WHERE country = 'TG' AND name = 'Services sociaux / action sociale';
  IF NOT FOUND THEN
    INSERT INTO public.specialists (name, type, country, description, is_free, is_24_7, is_verified, is_published)
    VALUES ('Services sociaux / action sociale', 'authority', 'TG', 'Services sociaux / action sociale (Togo) pour orientation, protection et prise en charge sociale.', true, false, true, true);
  END IF;
END
$$;
