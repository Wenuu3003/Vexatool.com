-- SEO Growth System (re-trigger, idempotent).

CREATE TABLE IF NOT EXISTS public.programmatic_seo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  parent_tool_slug text,
  preset_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_title text NOT NULL,
  meta_description text NOT NULL,
  h1 text NOT NULL,
  intro_md text NOT NULL,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  internal_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  breadcrumbs jsonb NOT NULL DEFAULT '[]'::jsonb,
  canonical_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pseo_pages_published ON public.programmatic_seo_pages (is_published);
CREATE INDEX IF NOT EXISTS idx_pseo_pages_category ON public.programmatic_seo_pages (category);
GRANT SELECT ON public.programmatic_seo_pages TO anon;
GRANT SELECT ON public.programmatic_seo_pages TO authenticated;
GRANT ALL ON public.programmatic_seo_pages TO service_role;
ALTER TABLE public.programmatic_seo_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published pseo pages" ON public.programmatic_seo_pages;
CREATE POLICY "Public read published pseo pages"
  ON public.programmatic_seo_pages FOR SELECT
  TO anon, authenticated
  USING (is_published = true);
DROP POLICY IF EXISTS "Admins manage pseo pages" ON public.programmatic_seo_pages;
CREATE POLICY "Admins manage pseo pages"
  ON public.programmatic_seo_pages FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
DROP TRIGGER IF EXISTS trg_pseo_pages_updated_at ON public.programmatic_seo_pages;
CREATE TRIGGER trg_pseo_pages_updated_at
  BEFORE UPDATE ON public.programmatic_seo_pages
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS public.seo_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  period_start date,
  period_end date,
  summary text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  sheet_url text
);
CREATE INDEX IF NOT EXISTS idx_seo_reports_type_date ON public.seo_reports (report_type, generated_at DESC);
GRANT SELECT ON public.seo_reports TO authenticated;
GRANT ALL ON public.seo_reports TO service_role;
ALTER TABLE public.seo_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read seo reports" ON public.seo_reports;
CREATE POLICY "Admins read seo reports"
  ON public.seo_reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins manage seo reports" ON public.seo_reports;
CREATE POLICY "Admins manage seo reports"
  ON public.seo_reports FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.seo_blog_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  target_keyword text,
  status text NOT NULL DEFAULT 'draft',
  title text,
  slug text,
  meta_description text,
  outline jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_md text,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  internal_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  research_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  google_doc_id text,
  google_doc_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blog_drafts_status ON public.seo_blog_drafts (status, created_at DESC);
GRANT SELECT ON public.seo_blog_drafts TO authenticated;
GRANT ALL ON public.seo_blog_drafts TO service_role;
ALTER TABLE public.seo_blog_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage blog drafts" ON public.seo_blog_drafts;
CREATE POLICY "Admins manage blog drafts"
  ON public.seo_blog_drafts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
DROP TRIGGER IF EXISTS trg_blog_drafts_updated_at ON public.seo_blog_drafts;
CREATE TRIGGER trg_blog_drafts_updated_at
  BEFORE UPDATE ON public.seo_blog_drafts
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TABLE IF NOT EXISTS public.seo_audit_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid REFERENCES public.seo_reports(id) ON DELETE CASCADE,
  url text NOT NULL,
  issue_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  detail text,
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_audit_findings_open ON public.seo_audit_findings (resolved, severity);
GRANT SELECT ON public.seo_audit_findings TO authenticated;
GRANT ALL ON public.seo_audit_findings TO service_role;
ALTER TABLE public.seo_audit_findings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage audit findings" ON public.seo_audit_findings;
CREATE POLICY "Admins manage audit findings"
  ON public.seo_audit_findings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
