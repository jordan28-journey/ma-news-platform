@AGENTS.md

# M&A News Platform

UK Accounting M&A Tracker — built with Next.js 16, SQLite (better-sqlite3), and Tailwind CSS v4.

## Architecture

- **Database:** SQLite at `data/deals.db` with two tables: `deals` and `ads`
- **Auth:** Simple password-based admin auth via cookie session (`ADMIN_PASSWORD` in `.env.local`)
- **Styling:** Tailwind CSS v4 with custom navy/primary/accent theme tokens

## Key Files

### Data Layer
- `src/lib/db.ts` — SQLite connection, creates `deals` and `ads` tables
- `src/lib/deals.ts` — Deal CRUD: getAllDeals, getDealBySlug, createDeal, toggleDealPublished, deleteDeal, importDealsFromCSV
- `src/lib/ads.ts` — Ad CRUD: getAllAds, getActiveAd(slot), createAd, updateAd, toggleAdActive, deleteAd

### API Routes
- `/api/auth` — POST login, exports `isAuthenticated()` helper
- `/api/deals` — GET/PATCH/DELETE deal management (authenticated)
- `/api/upload` — POST CSV import (authenticated)
- `/api/ads` — GET/POST/PATCH/DELETE ad management (authenticated)
- `/api/ads/upload` — POST image file upload, saves to `public/ads/`

### Pages
- `/` — Homepage: hero, featured deal + sidebar ad (300px wide), deals grid with filters & pagination (12/page), leaderboard ad
- `/deals/[slug]` — Individual deal page with leaderboard ad
- `/admin` — Login page
- `/admin/dashboard` — Deal Manager table + Ad Manager (create/edit/toggle/delete ads with file upload)
- `/admin/upload` — CSV import with drag-and-drop

### Components
- `Header.tsx` — Minimal header with AO logo (not sticky)
- `Footer.tsx` — Copyright and tagline
- `DealCard.tsx` — Individual deal card for the grid
- `DealsFilter.tsx` — Deals grid with firm/value/date dropdown filters and paginated display (12 per page, truncated page numbers)

## Ad System

Two ad slots managed from the admin dashboard:
- **Sidebar (300px wide)** — Displayed next to the featured deal on the homepage, stretches to match deal card height
- **Leaderboard (728x90)** — Displayed below pagination on homepage and at the bottom of individual deal pages
- Ads are uploaded as image files via the admin panel (stored in `public/ads/`)
- Each ad has: slot, label, image_url, link_url, active status
- Only the most recently created active ad per slot is shown (`getActiveAd`)
- Ad spaces are hidden when no active ad exists for that slot

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
