
-- Create update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Batiments table
CREATE TABLE public.batiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  adresse TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.batiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read batiments" ON public.batiments FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage batiments" ON public.batiments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  icone TEXT NOT NULL DEFAULT '📦',
  ordre INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage services" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Annonces table
CREATE TABLE public.annonces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT,
  type_espace TEXT NOT NULL DEFAULT 'Bureau privatif',
  surface NUMERIC,
  prix_mensuel NUMERIC,
  charges TEXT DEFAULT 'incluses',
  disponibilite TEXT DEFAULT 'Disponible immédiatement',
  statut TEXT NOT NULL DEFAULT 'brouillon',
  batiment_id UUID REFERENCES public.batiments(id) ON DELETE SET NULL,
  conditions_duree TEXT,
  conditions_preavis TEXT,
  conditions_bail TEXT,
  conditions_garantie TEXT,
  conditions_notes TEXT,
  mise_en_avant BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.annonces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published annonces" ON public.annonces FOR SELECT USING (statut = 'publiee' OR (SELECT auth.uid()) IS NOT NULL);
CREATE POLICY "Authenticated can manage annonces" ON public.annonces FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Annonce_services junction table
CREATE TABLE public.annonce_services (
  annonce_id UUID NOT NULL REFERENCES public.annonces(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (annonce_id, service_id)
);
ALTER TABLE public.annonce_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read annonce_services" ON public.annonce_services FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage annonce_services" ON public.annonce_services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Medias table
CREATE TABLE public.medias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  annonce_id UUID NOT NULL REFERENCES public.annonces(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'photo',
  url TEXT NOT NULL,
  ordre INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.medias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read medias" ON public.medias FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage medias" ON public.medias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- About page content table
CREATE TABLE public.page_content (
  id TEXT PRIMARY KEY DEFAULT 'about',
  titre TEXT,
  description TEXT,
  chiffres JSONB DEFAULT '{}',
  avantages JSONB DEFAULT '[]',
  photos JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read page_content" ON public.page_content FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage page_content" ON public.page_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket for medias
INSERT INTO storage.buckets (id, name, public) VALUES ('medias', 'medias', true);
CREATE POLICY "Public can read media files" ON storage.objects FOR SELECT USING (bucket_id = 'medias');
CREATE POLICY "Authenticated can upload media files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'medias');
CREATE POLICY "Authenticated can update media files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'medias');
CREATE POLICY "Authenticated can delete media files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'medias');

-- Triggers for updated_at
CREATE TRIGGER update_batiments_updated_at BEFORE UPDATE ON public.batiments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_annonces_updated_at BEFORE UPDATE ON public.annonces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_page_content_updated_at BEFORE UPDATE ON public.page_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
