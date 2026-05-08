-- ══════════════════════════════════════════════════════
--  SkillBridge — Fix SQL (run this if 001 errored)
--  Paste into: Supabase Dashboard → SQL Editor → Run
-- ══════════════════════════════════════════════════════

-- Step 1: Add any missing columns to users (safe, won't fail if they exist)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_online BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS area TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_pic TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Step 2: Drop the view if it exists, then recreate cleanly
DROP VIEW IF EXISTS public.worker_profiles;

CREATE VIEW public.worker_profiles AS
SELECT
  u.id,
  s.id              AS service_id,
  u.name,
  u.phone,
  u.area,
  u.location_lat,
  u.location_lng,
  u.is_online,
  u.verified,
  s.category,
  s.daily_rate,
  s.bio,
  s.experience_years,
  COALESCE(ROUND(AVG(r.rating)::NUMERIC, 1), 0) AS avg_rating,
  COUNT(r.id)                                    AS review_count
FROM public.users u
JOIN public.services s ON s.worker_id = u.id
LEFT JOIN public.reviews r ON r.worker_id = u.id
WHERE u.role = 'worker'
GROUP BY u.id, s.id;

-- Step 3: Remaining indexes (safe if tables exist)
CREATE INDEX IF NOT EXISTS idx_services_worker_id  ON public.services(worker_id);
CREATE INDEX IF NOT EXISTS idx_services_category   ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_gigs_customer_id    ON public.gigs(customer_id);
CREATE INDEX IF NOT EXISTS idx_gigs_worker_id      ON public.gigs(worker_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status         ON public.gigs(status);
CREATE INDEX IF NOT EXISTS idx_reviews_worker_id   ON public.reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_users_role          ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_online     ON public.users(is_online);

-- Step 4: Enable RLS (idempotent)
ALTER TABLE public.users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews  ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies (drop first to avoid duplicates)
DO $$ BEGIN
  -- USERS
  DROP POLICY IF EXISTS "Anyone can view user profiles" ON public.users;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
  -- SERVICES
  DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
  DROP POLICY IF EXISTS "Workers can create their own service" ON public.services;
  DROP POLICY IF EXISTS "Workers can update their own service" ON public.services;
  DROP POLICY IF EXISTS "Workers can delete their own service" ON public.services;
  -- GIGS
  DROP POLICY IF EXISTS "Customer or worker can view their gigs" ON public.gigs;
  DROP POLICY IF EXISTS "Authenticated customers can create gigs" ON public.gigs;
  DROP POLICY IF EXISTS "Customer or worker can update gig" ON public.gigs;
  -- REVIEWS
  DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
  DROP POLICY IF EXISTS "Customers can submit reviews" ON public.reviews;
END $$;

CREATE POLICY "Anyone can view user profiles"
  ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view services"
  ON public.services FOR SELECT USING (true);
CREATE POLICY "Workers can create their own service"
  ON public.services FOR INSERT WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "Workers can update their own service"
  ON public.services FOR UPDATE USING (auth.uid() = worker_id);
CREATE POLICY "Workers can delete their own service"
  ON public.services FOR DELETE USING (auth.uid() = worker_id);

CREATE POLICY "Customer or worker can view their gigs"
  ON public.gigs FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = worker_id);
CREATE POLICY "Authenticated customers can create gigs"
  ON public.gigs FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customer or worker can update gig"
  ON public.gigs FOR UPDATE
  USING (auth.uid() = customer_id OR auth.uid() = worker_id);

CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can submit reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- ── Verify everything is set up correctly ─────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
