-- ══════════════════════════════════════════════════════
--  SkillBridge — Sample Seed Data (for testing)
--  Run AFTER 001_initial_schema.sql
--  NOTE: These inserts bypass auth — run only from
--        Supabase SQL Editor (service role).
-- ══════════════════════════════════════════════════════

-- Insert seed users directly (bypasses auth.users, use only in dev)
-- In production, users are created via Supabase Auth sign-up.

-- For testing: after creating test accounts via the UI or Auth API,
-- update their UUIDs below and run this file.

-- ─── Sample Worker 1 — Carpenter ──────────────────────
-- INSERT INTO public.users (id, name, email, phone, role, area, location_lat, location_lng, is_online)
-- VALUES (
--   'YOUR-WORKER-UUID-1',
--   'Ramakrishna Shetty',
--   'rk.shetty@example.com',
--   '+91 9876543210',
--   'worker',
--   'Bejai, Mangaluru',
--   12.8714,
--   74.8431,
--   true
-- );

-- INSERT INTO public.services (worker_id, category, daily_rate, bio, experience_years)
-- VALUES (
--   'YOUR-WORKER-UUID-1',
--   'Carpenter',
--   650,
--   'Expert woodworker with 10 years of experience in furniture making and repairs.',
--   10
-- );

-- ─── Sample Worker 2 — Electrician ────────────────────
-- INSERT INTO public.users (id, name, email, phone, role, area, location_lat, location_lng, is_online)
-- VALUES (
--   'YOUR-WORKER-UUID-2',
--   'Suresh Kumar',
--   'suresh.k@example.com',
--   '+91 9123456789',
--   'worker',
--   'Hampankatta, Mangaluru',
--   12.8668,
--   74.8420,
--   true
-- );

-- INSERT INTO public.services (worker_id, category, daily_rate, bio, experience_years)
-- VALUES (
--   'YOUR-WORKER-UUID-2',
--   'Electrician',
--   700,
--   'Certified electrician specializing in home wiring, panel upgrades, and repairs.',
--   7
-- );

-- ─── Sample Worker 3 — Plumber ────────────────────────
-- INSERT INTO public.users (id, name, email, phone, role, area, location_lat, location_lng, is_online)
-- VALUES (
--   'YOUR-WORKER-UUID-3',
--   'Arun Prabhu',
--   'arun.p@example.com',
--   '+91 9988776655',
--   'worker',
--   'Kadri, Mangaluru',
--   12.8780,
--   74.8510,
--   true
-- );

-- INSERT INTO public.services (worker_id, category, daily_rate, bio, experience_years)
-- VALUES (
--   'YOUR-WORKER-UUID-3',
--   'Plumbing',
--   600,
--   'Experienced plumber — pipe fitting, leak repairs, bathroom installations.',
--   5
-- );

-- ─── Quick verification queries ───────────────────────
-- Run these to confirm everything is set up correctly:

-- SELECT * FROM public.users;
-- SELECT * FROM public.services;
-- SELECT * FROM public.worker_profiles;
-- SELECT * FROM public.gigs;
-- SELECT * FROM public.reviews;
