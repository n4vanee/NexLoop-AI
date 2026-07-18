/*
# NexLoop AI — Core Schema

## Purpose
Industrial Symbiosis platform: industries list surplus waste, an AI engine matches
it with industries that can reuse it as raw material. Roles: guest, citizen,
industry, municipality, administrator.

## Tables
1. profiles — extends auth.users with role, org, circularity score, leaderboard points
2. waste_listings — surplus material listings (scrap metal, plastic, textile, e-waste, food/agro)
3. matches — AI-generated waste-to-resource matches between supplier and receiver
4. bookmarks — users can bookmark listings
5. notifications — in-app notifications (match alerts, system, reports)
6. activity_logs — recent activity feed
7. reports — AI-generated ESG / sustainability PDF reports
8. chat_messages — AI assistant conversation history

## Security
- All tables have RLS enabled.
- profiles: readable by all authenticated, editable by owner
- waste_listings: readable by all authenticated, editable by owner
- matches: readable by all authenticated, editable by participants
- bookmarks: owner-scoped only
- notifications: owner-scoped only
- activity_logs: readable by all authenticated, insert by authenticated
- reports: owner-scoped
- chat_messages: owner-scoped

## Notes
1. Owner columns default to auth.uid() so inserts omitting user_id pass RLS.
2. Separate CRUD policies per verb — no FOR ALL.
3. Uses DROP POLICY IF EXISTS for idempotency.
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen','industry','municipality','administrator')),
  organization text,
  avatar_url text,
  phone text,
  city text,
  country text DEFAULT 'India',
  circularity_score integer NOT NULL DEFAULT 0 CHECK (circularity_score >= 0 AND circularity_score <= 100),
  total_diverted_kg numeric NOT NULL DEFAULT 0,
  total_co2_saved_kg numeric NOT NULL DEFAULT 0,
  total_matches integer NOT NULL DEFAULT 0,
  leaderboard_points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============ WASTE_LISTINGS ============
CREATE TABLE IF NOT EXISTS waste_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  owner_name text NOT NULL,
  owner_org text,
  owner_role text NOT NULL DEFAULT 'industry',
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('scrap_metal','plastic','textile','e_waste','food_agro')),
  material_subtype text NOT NULL DEFAULT 'general',
  quantity_kg numeric NOT NULL DEFAULT 0,
  unit_price_per_kg numeric NOT NULL DEFAULT 0,
  quality_grade text NOT NULL DEFAULT 'B' CHECK (quality_grade IN ('A','B','C')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','matched','in_transit','completed','expired')),
  image_url text,
  latitude numeric,
  longitude numeric,
  city text,
  country text DEFAULT 'India',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waste_listings_category ON waste_listings(category);
CREATE INDEX IF NOT EXISTS idx_waste_listings_status ON waste_listings(status);
CREATE INDEX IF NOT EXISTS idx_waste_listings_owner ON waste_listings(owner_id);

ALTER TABLE waste_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "listings_select_all" ON waste_listings;
CREATE POLICY "listings_select_all" ON waste_listings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "listings_insert_own" ON waste_listings;
CREATE POLICY "listings_insert_own" ON waste_listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "listings_update_own" ON waste_listings;
CREATE POLICY "listings_update_own" ON waste_listings FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "listings_delete_own" ON waste_listings;
CREATE POLICY "listings_delete_own" ON waste_listings FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- ============ MATCHES ============
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES waste_listings(id) ON DELETE CASCADE,
  listing_title text NOT NULL,
  supplier_name text NOT NULL,
  supplier_id uuid NOT NULL,
  receiver_name text NOT NULL,
  receiver_id uuid NOT NULL,
  category text NOT NULL,
  quantity_kg numeric NOT NULL DEFAULT 0,
  recommended_price_per_kg numeric NOT NULL DEFAULT 0,
  total_value numeric NOT NULL DEFAULT 0,
  confidence text NOT NULL DEFAULT 'medium' CHECK (confidence IN ('high','medium','low')),
  confidence_score numeric NOT NULL DEFAULT 0,
  co2_saved_kg numeric NOT NULL DEFAULT 0,
  landfill_diverted_kg numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','in_transit','completed')),
  match_reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_supplier ON matches(supplier_id);
CREATE INDEX IF NOT EXISTS idx_matches_receiver ON matches(receiver_id);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_select_all" ON matches;
CREATE POLICY "matches_select_all" ON matches FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "matches_insert_own" ON matches;
CREATE POLICY "matches_insert_own" ON matches FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = supplier_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "matches_update_participant" ON matches;
CREATE POLICY "matches_update_participant" ON matches FOR UPDATE
  TO authenticated USING (auth.uid() = supplier_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = supplier_id OR auth.uid() = receiver_id);

-- ============ BOOKMARKS ============
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES waste_listings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookmarks_select_own" ON bookmarks;
CREATE POLICY "bookmarks_select_own" ON bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_insert_own" ON bookmarks;
CREATE POLICY "bookmarks_insert_own" ON bookmarks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_delete_own" ON bookmarks;
CREATE POLICY "bookmarks_delete_own" ON bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'system' CHECK (type IN ('match','alert','system','report','message')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ ACTIVITY_LOGS ============
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  user_name text NOT NULL,
  action text NOT NULL,
  detail text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_select_all" ON activity_logs;
CREATE POLICY "activity_select_all" ON activity_logs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "activity_insert_own" ON activity_logs;
CREATE POLICY "activity_insert_own" ON activity_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ REPORTS ============
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  report_type text NOT NULL DEFAULT 'esg' CHECK (report_type IN ('esg','sustainability','impact','circularity')),
  period text NOT NULL,
  summary text NOT NULL DEFAULT '',
  co2_saved_kg numeric NOT NULL DEFAULT 0,
  waste_diverted_kg numeric NOT NULL DEFAULT 0,
  circularity_score integer NOT NULL DEFAULT 0,
  matches_count integer NOT NULL DEFAULT 0,
  file_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_select_own" ON reports;
CREATE POLICY "reports_select_own" ON reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "reports_insert_own" ON reports;
CREATE POLICY "reports_insert_own" ON reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reports_delete_own" ON reports;
CREATE POLICY "reports_delete_own" ON reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ CHAT_MESSAGES ============
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_select_own" ON chat_messages;
CREATE POLICY "chat_select_own" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_insert_own" ON chat_messages;
CREATE POLICY "chat_insert_own" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_delete_own" ON chat_messages;
CREATE POLICY "chat_delete_own" ON chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
