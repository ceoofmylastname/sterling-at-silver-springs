-- ============================================================
-- STERLING AT SILVER SPRINGS — CMS DATABASE SCHEMA
-- Run this in Supabase SQL Editor after creating your project
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SITE SETTINGS (key/value store for global site config)
-- ============================================================
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  label TEXT,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings
INSERT INTO site_settings (key, value, label, category) VALUES
  ('community_name', 'Sterling at Silver Springs', 'Community Name', 'branding'),
  ('property_manager_name', '[Manager Name]', 'Property Manager Name', 'contacts'),
  ('property_manager_email', '[manager@email.com]', 'Property Manager Email', 'contacts'),
  ('property_manager_phone', '[Phone]', 'Property Manager Phone', 'contacts'),
  ('property_manager_hours', '[Days/Times]', 'Property Manager Hours', 'contacts'),
  ('property_manager_company', '[Company Name]', 'Management Company', 'contacts'),
  ('emergency_phone', '[Emergency Phone]', 'Emergency After-Hours Phone', 'contacts'),
  ('hoa_email', '[community@email.com]', 'HOA Email', 'contacts'),
  ('total_homes', '150', 'Total Homes', 'stats'),
  ('established_year', '2026', 'Established Year', 'stats'),
  ('board_member_count', '5', 'Board Member Count', 'stats'),
  ('footer_tagline', 'Sterling at Silver Springs is a welcoming residential community dedicated to maintaining high standards and fostering neighborhood connection.', 'Footer Tagline', 'branding'),
  ('alert_banner_active', 'false', 'Emergency Alert Active', 'alerts'),
  ('alert_banner_text', '', 'Emergency Alert Text', 'alerts'),
  ('newsletter_subscribe_email', '[community@email.com]', 'Newsletter Subscribe Email', 'general');

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  badge TEXT DEFAULT 'new' CHECK (badge IN ('new', 'updated', 'urgent', 'none')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENTS / CALENDAR
-- ============================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location TEXT,
  category TEXT DEFAULT 'community' CHECK (category IN ('board', 'committee', 'community', 'maintenance', 'deadline')),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REGULAR ACTIVITIES
-- ============================================================
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  schedule TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO activities (name, schedule, location, sort_order) VALUES
  ('Pool Hours', '[Season/Times]', 'Community Pool', 1),
  ('Clubhouse Reservations', 'By Appointment', 'Clubhouse', 2),
  ('Community Walk Group', '[Day/Time]', '[Meeting Spot]', 3);

-- ============================================================
-- BOARD MEETINGS
-- ============================================================
CREATE TABLE board_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_date DATE NOT NULL,
  meeting_time TIME NOT NULL DEFAULT '19:00',
  location TEXT,
  virtual_link TEXT,
  agenda_url TEXT,
  minutes_url TEXT,
  notes TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  auto_expire BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOARD MEMBERS / CONTACTS
-- ============================================================
CREATE TABLE board_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '[Name]',
  email TEXT,
  phone TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO board_members (role, name, sort_order) VALUES
  ('President', '[Name]', 1),
  ('Vice President', '[Name]', 2),
  ('Secretary', '[Name]', 3),
  ('Treasurer', '[Name]', 4),
  ('Member-at-Large', '[Name]', 5);

-- ============================================================
-- EMERGENCY / UTILITY CONTACTS
-- ============================================================
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO emergency_contacts (service, phone, notes, sort_order) VALUES
  ('911 — Emergency', '911', 'Fire, Police, Medical Emergency', 1),
  ('Police Non-Emergency', '[Local Number]', 'Noise, non-urgent reports', 2),
  ('Water/Sewer', '[Provider]', 'Outages, billing, leaks', 3),
  ('Electric', '[Provider]', 'Outages, billing', 4),
  ('Gas', '[Provider]', 'Gas leaks: call 911 first', 5),
  ('HOA After-Hours', '[Number]', 'Property emergencies only', 6),
  ('Poison Control', '1-800-222-1222', '24/7 nationwide', 7);

-- ============================================================
-- NEWSLETTERS
-- ============================================================
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  topic TEXT,
  audience TEXT,
  description TEXT,
  keywords TEXT,
  ai_content JSONB,         -- stores structured AI-generated content
  hero_image_url TEXT,      -- Kie.ai generated image
  extra_image_urls TEXT[],  -- additional generated images
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FAQ
-- ============================================================
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO faqs (question, answer, category, sort_order) VALUES
  ('What day is trash and recycling pickup?', '[Trash: Day. Recycling: Day. Bulk pickup: schedule/info. Provider: Name, phone.]', 'Living Here', 1),
  ('What are the community quiet hours?', '[Quiet hours are from X PM to X AM. Noise complaints can be submitted via the Submit a Request form.]', 'Living Here', 2),
  ('What is the pet policy?', '[Summary of pet rules — leash requirements, breed restrictions, waste cleanup, number of pets allowed.]', 'Living Here', 3),
  ('Where can I park? Are there visitor parking rules?', '[Resident parking rules, visitor locations, overnight guest policies, towing info.]', 'Living Here', 4),
  ('How do I request an exterior modification?', 'Submit a request through the Submit a Request form. Select "Architectural" from the topic dropdown. Include a description and photos/plans.', 'Your Home', 5),
  ('What exterior paint colors are approved?', '[Reference the approved color palette document in Resources.]', 'Your Home', 6),
  ('Who is responsible for landscaping?', '[Explain which areas the HOA maintains vs. homeowner responsibility.]', 'Your Home', 7),
  ('How much are HOA dues and when are they due?', '[Amount, frequency, due date, late fee info.]', 'Finances', 8),
  ('How do I pay my HOA dues?', '[Payment methods — online portal, check, auto-pay. Include links.]', 'Finances', 9),
  ('What do my HOA dues cover?', '[Common area maintenance, landscaping, insurance, reserves, amenities, etc.]', 'Finances', 10),
  ('When and where are board meetings held?', '[Regular schedule — see the Meetings page for specific dates and agendas.]', 'Governance', 11),
  ('How do I submit something for the board meeting agenda?', 'Use the Submit a Request form and select "Administrative". Note in your description that you''d like to add an agenda item.', 'Governance', 12),
  ('What are the pool hours and rules?', '[Season dates, hours, guest policy, capacity limits.]', 'Common Areas & Amenities', 13),
  ('How do I reserve the clubhouse?', '[Reservation process, fees, availability, contact.]', 'Common Areas & Amenities', 14),
  ('Who do I contact about a common area maintenance issue?', 'Use the Submit a Request form and select "Maintenance". For urgent safety hazards, call the property manager directly.', 'Common Areas & Amenities', 15);

-- ============================================================
-- NEW RESIDENT CHECKLIST
-- ============================================================
CREATE TABLE new_resident_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO new_resident_checklist (title, description, sort_order) VALUES
  ('Set Up Utilities', 'Electric, Water/Sewer, Gas, Trash/Recycling, Internet', 1),
  ('Contact the Property Manager', 'Introduce yourself, get mailbox key / gate access', 2),
  ('Review Community Documents', 'CC&Rs, Rules & Regulations, Architectural Guidelines', 3),
  ('Register Your Vehicle(s)', 'Parking registration, decals if applicable', 4),
  ('Register Pets', 'Pet registration, leash rules, waste stations', 5),
  ('Update Your Mailing Address', 'USPS, voter registration, driver''s license', 6),
  ('Join the Community', 'Bookmark this website, check Activities, subscribe to newsletter', 7);

-- ============================================================
-- NEW RESIDENT CONTACTS TABLE
-- ============================================================
CREATE TABLE new_resident_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  need TEXT NOT NULL,
  contact TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO new_resident_contacts (need, contact, sort_order) VALUES
  ('Dues, billing, account setup', 'Property Manager', 1),
  ('Exterior modification approval', 'Submit a Request → "Architectural"', 2),
  ('Maintenance issue in common area', 'Submit a Request → "Maintenance"', 3),
  ('Gate access, key, or fob', 'Submit a Request → "Key/Fob" or "Gates/Security"', 4),
  ('Neighbor concern or rule violation', 'Submit a Request → "Violations"', 5),
  ('Everything else', 'Submit a Request — we''ll route it!', 6);

-- ============================================================
-- DOCUMENTS (Governing Docs, Forms, Templates)
-- ============================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  file_url TEXT,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'governing' CHECK (category IN ('governing', 'forms', 'templates', 'other')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SERVICE PROVIDERS
-- ============================================================
CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO service_providers (service, company, phone, sort_order) VALUES
  ('Plumbing', '[Company]', '[Phone]', 1),
  ('Electrical', '[Company]', '[Phone]', 2),
  ('Landscaping', '[Company]', '[Phone]', 3),
  ('HVAC', '[Company]', '[Phone]', 4),
  ('Pest Control', '[Company]', '[Phone]', 5);

-- ============================================================
-- RESIDENT REQUESTS (from Submit a Request form)
-- ============================================================
CREATE TABLE resident_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  topic TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_method TEXT DEFAULT 'Email',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUGGESTIONS BOX
-- ============================================================
CREATE TABLE suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  category TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  wants_response BOOLEAN DEFAULT FALSE,
  email TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'implemented', 'declined')),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUICK LINKS (admin can customize home page quick links)
-- ============================================================
CREATE TABLE quick_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  page TEXT NOT NULL,
  icon_name TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO quick_links (label, page, icon_name, sort_order) VALUES
  ('Submit a Request', 'request', 'mail', 1),
  ('Community Calendar', 'activities', 'calendar', 2),
  ('Newsletters', 'newsletters', 'newsletter', 3),
  ('Governing Docs', 'resources', 'docs', 4),
  ('Contact the Board', 'contact', 'phone', 5),
  ('FAQ & Resources', 'resources', 'question', 6);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_resident_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_resident_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE resident_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (residents can read published content)
CREATE POLICY "Public can read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can read active announcements" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active events" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active activities" ON activities FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read published meetings" ON board_meetings FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read active board members" ON board_members FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active emergency contacts" ON emergency_contacts FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read published newsletters" ON newsletters FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read active faqs" ON faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read new resident checklist" ON new_resident_checklist FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read new resident contacts" ON new_resident_contacts FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active documents" ON documents FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active providers" ON service_providers FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active quick links" ON quick_links FOR SELECT USING (is_active = true);

-- PUBLIC INSERT (residents can submit requests/suggestions)
CREATE POLICY "Anyone can submit a request" ON resident_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit a suggestion" ON suggestions FOR INSERT WITH CHECK (true);

-- ADMIN FULL ACCESS policies (authenticated users = admin)
CREATE POLICY "Admin full access site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access announcements" ON announcements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access events" ON events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access activities" ON activities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access meetings" ON board_meetings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access board members" ON board_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access emergency contacts" ON emergency_contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access newsletters" ON newsletters FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access faqs" ON faqs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access checklist" ON new_resident_checklist FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access nr contacts" ON new_resident_contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access documents" ON documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access providers" ON service_providers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access requests" ON resident_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access suggestions" ON suggestions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access quick links" ON quick_links FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- REALTIME (enable all tables for live updates)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE board_meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE newsletters;

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON board_meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON board_members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON newsletters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON resident_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON suggestions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
