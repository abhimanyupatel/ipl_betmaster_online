# IPL Betmaster Production Pack

This starter pack turns the uploaded prototype into a Supabase-backed app.

## What is included

### Frontend
- Vite + React frontend
- Supabase Auth login flow
- Profile bootstrap flow
- Match list, pick submission, results view, standings view
- Hooks for matches, picks, standings, and auth
- Styling inspired by the original single-file prototype

### Supabase
- schema migration
- baseline RLS policies
- RPC functions:
  - `ensure_profile`
  - `submit_pick`
  - `lock_missing_picks`
  - `settle_match`
- views:
  - `standings_view`
  - `match_picks_view`

### Scripts
- `seedProfiles.mjs`
- `importSchedule.mjs`
- `settleMatch.mjs`

### Edge Functions
- `sync-results`
- `admin-import-schedule`
- `sync-knockout-matches`

## What changed from the prototype

The uploaded UI prototype kept:
- matches in a hardcoded client array
- users, votes, and results in local/shared storage
- browser-side result fetching

Those patterns were replaced with:
- Supabase `matches`, `profiles`, `bets`
- Supabase Auth
- RPC-based pick submission
- standings from a database view
- server-side result settlement

## Quick start

1. Create a Supabase project
2. Copy `.env.example` to `.env`
3. Fill in your keys
4. Apply the SQL migrations in `supabase/migrations/`
5. Run:
   - `npm install`
   - `npm run seed:profiles`
   - `npm run import:schedule`
   - `npm run dev`

## Suggested order

1. Apply migrations
2. Seed profiles
3. Import the schedule CSV
4. Start the frontend
5. Test auth
6. Test picks
7. Test manual settlement
8. Add real result sync later

## Important note about auth

This pack expects:
- Supabase Auth for login
- one `profiles` row per auth user
- the frontend to call `ensure_profile(...)` after sign in if needed

## Files you will most likely edit first

- `src/App.jsx`
- `src/components/AuthGate.jsx`
- `src/components/MatchCard.jsx`
- `src/lib/api.js`
- `supabase/migrations/0003_rpc_functions.sql`
- `supabase/migrations/0004_views.sql`
- `supabase/functions/sync-results/index.ts`
