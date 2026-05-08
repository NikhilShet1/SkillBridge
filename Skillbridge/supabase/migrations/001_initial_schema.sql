-- ══════════════════════════════════════════════════════
--  SkillBridge — Full Database Schema Migration
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ══════════════════════════════════════════════════════

-- ─── 1. USERS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'worker')),
  area          TEXT,
  location_lat  DOUBLE PRECISION,
  location_lng  DOUBLE PRECISION,
  profile_pic   TEXT,
  is_online     BOOLEAN NOT NULL DEFAULT false,
  verified      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. SERVICES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category         TEXT NOT NULL CHECK (category IN ('Carpenter','Electrician','Plumbing','Painter','Other')),
  daily_rate       INTEGER NOT NULL CHECK (daily_rate >= 0),
  bio              TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
  certifications   TEXT[],
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. GIGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gigs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  worker_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id          UUID REFERENCES public.services(id) ON DELETE SET NULL,
  status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','accepted','in_progress','completed','cancelled')),
  payment_status      TEXT NOT NULL DEFAULT 'unpaid'
                        CHECK (payment_status IN ('unpaid','paid','refunded')),
  amount              INTEGER,
  description         TEXT,
  scheduled_date      DATE,
  razorpay_payment_id TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. REVIEWS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id      UUID REFERENCES public.gigs(id) ON DELETE SET NULL,
  worker_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 5. WORKER_PROFILES VIEW ──────────────────────────
-- Flat view joining users + services + aggregated reviews.
-- Used by: HomePage, CustomerSearch, WorkerCard, Map markers.
CREATE OR REPLACE VIEW public.worker_profiles AS
SELECT
  u.id,
  s.id              AS service_id,
  u.name,
  u.phone,
  u.area,
  u.location_lat,
  u.location_lng,
  u.is_online,
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

-- ─── 6. AUTO-UPDATE updated_at TRIGGER ───────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER gigs_updated_at
  BEFORE UPDATE ON public.gigs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 7. PERFORMANCE INDEXES ───────────────────────────
CREATE INDEX IF NOT EXISTS idx_services_worker_id  ON public.services(worker_id);
CREATE INDEX IF NOT EXISTS idx_services_category   ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_gigs_customer_id    ON public.gigs(customer_id);
CREATE INDEX IF NOT EXISTS idx_gigs_worker_id      ON public.gigs(worker_id);
CREATE INDEX IF NOT EXISTS idx_gigs_status         ON public.gigs(status);
CREATE INDEX IF NOT EXISTS idx_reviews_worker_id   ON public.reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_users_role          ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_online     ON public.users(is_online);

-- ─── 8. ROW LEVEL SECURITY (RLS) ──────────────────────
ALTER TABLE public.users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews  ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Anyone can view user profiles"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

-- SERVICES
CREATE POLICY "Anyone can view services"
  ON public.services FOR SELECT USING (true);

CREATE POLICY "Workers can create their own service"
  ON public.services FOR INSERT WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can update their own service"
  ON public.services FOR UPDATE USING (auth.uid() = worker_id);

CREATE POLICY "Workers can delete their own service"
  ON public.services FOR DELETE USING (auth.uid() = worker_id);

-- GIGS
CREATE POLICY "Customer or worker can view their gigs"
  ON public.gigs FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = worker_id);

CREATE POLICY "Authenticated customers can create gigs"
  ON public.gigs FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customer or worker can update gig"
  ON public.gigs FOR UPDATE
  USING (auth.uid() = customer_id OR auth.uid() = worker_id);

-- REVIEWS
CREATE POLICY "Anyone can view reviews"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Customers can submit reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
