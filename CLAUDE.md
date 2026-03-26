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
