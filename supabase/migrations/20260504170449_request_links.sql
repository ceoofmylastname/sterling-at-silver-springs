-- Request Links — curated external request forms (Google Forms etc.) shown on the public
-- "Submit a Request" page. Each row is a clickable card with admin-defined title, optional
-- description, optional icon, optional category grouping, and sort_order.
-- Replaces the inline form that used to write to resident_requests; that table stays intact
-- as an archive of historical submissions.

CREATE TABLE IF NOT EXISTS request_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE request_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active request links" ON request_links;
CREATE POLICY "Public read active request links" ON request_links FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access request links" ON request_links;
CREATE POLICY "Admin full access request links" ON request_links FOR ALL USING (auth.role() = 'authenticated');

ALTER PUBLICATION supabase_realtime ADD TABLE request_links;

DROP TRIGGER IF EXISTS set_updated_at ON request_links;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON request_links FOR EACH ROW EXECUTE FUNCTION update_updated_at();
