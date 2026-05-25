# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Development server with Turbopack
npm run build      # prisma generate + next build (Turbopack)
npm run start      # Production server
npm run lint       # ESLint
```

No test suite is configured.

## Architecture

**Urbik** is a Spanish-language real estate listing platform. Stack: Next.js 16 App Router, React 19, TypeScript, Supabase (auth + DB), Tailwind CSS v4.

### Routing & Pages (`src/app/`)

Route groups organize layouts: `(public)/` and `(dashboard)/`. API routes use the Next.js route handler pattern (`route.ts`).

Key pages:
- `(public)/` — Landing
- `(public)/map` — Interactive Leaflet map with real-time bounds querying
- `(public)/property/[id]` — Listing detail
- `(dashboard)/dashboard` — Agency/agent dashboard (role-gated)
- `(dashboard)/profile` — User profile management
- `(dashboard)/administrate` — Admin panel (ADMIN role only)
- `auth/login`, `auth/register` — Auth pages
- `realestate/[id]` — Public agency profile
- `saved`, `settings`, `help`, `legal/[slug]`, `about-us`, `contact`

### Components (`src/components/`)

Domain-scoped folders mirror the pages: `home/`, `dashboard/`, `property/`, `map/`, `profile/`, `search/`, `smart-zone/`, `administrate/`, `layout/` (Navbar + Footer), `ui/` (shared primitives).

### Services (`src/services/`)

Client-side data-fetching helpers: `properties.ts`, `propertyService.ts`, `search.ts`. These wrap `fetch()` calls to the API routes.

### Shared Lib (`src/lib/`)

- `supabase/client.ts` / `supabase/server.ts` — Supabase client factories (browser vs server)
- `types.ts` — All shared TypeScript types and enums (Role, PropertyType, OperationType, PropertyStatus, Currency, Property interface)
- `utils.ts`, `jurisdictions.ts`, `getHelpData.ts`, `getLegalData.ts`

### Data Layer

**Supabase** is the database and auth layer. All DB access uses `@supabase/supabase-js` query builders (`.from().select().eq()` etc.). No Prisma schema exists; the `prisma generate` in the build script is for Prisma Accelerate connection pooling only.

Key Supabase tables:
- `profiles` — Auth user records with `role` field (`USER | REALESTATE | ADMIN | AGENT`)
- `user_profiles` / `real_estates` — Profile extension rows
- `real_estate_licenses`, `real_estate_offices` — Agency sub-entities
- `properties` — Listings with images (Cloudinary URLs), location, pricing, amenity booleans

Columns are `snake_case` in DB; API routes map them to `camelCase` in responses.

### Authentication (`src/lib/supabase/`, `src/middleware.ts`)

Supabase Auth with Google OAuth and email/password. The OAuth callback is at `/api/auth/callback` (exchanges code for session via `supabase.auth.exchangeCodeForSession`). `next-auth` remains as a dependency but Supabase Auth is the active provider.

Middleware checks `supabase.auth.getUser()` then queries `profiles.role` for protected paths:
- `/dashboard` — requires `ADMIN | AGENT | REALESTATE`
- `/administrate` — requires `ADMIN`
- Unauthenticated users redirect to `/auth/login`; wrong role redirects to `/unauthorized`

Staging uses HTTP Basic Auth via `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` env vars (checked first in middleware before Supabase auth).

### API Routes (`src/app/api/`)

- `/api/auth/callback` — OAuth code exchange
- `/api/auth/register` — User and agency registration (creates profile + role-specific rows)
- `/api/property` / `/api/property/[id]` — Property CRUD
- `/api/property/parcel` — Attach parcel geometry to a property
- `/api/properties/search` — Filtered property search (builds Supabase query chains)
- `/api/properties/in-bounds` / `/api/properties/map` — Map viewport queries
- `/api/properties/favorite` / `/api/properties/favorites` — Favorites management
- `/api/properties/featured` — Featured listings
- `/api/inquiries` / `/api/inquiries/[id]` — Contact inquiries
- `/api/smart-zone/[action]` — Groq LLM actions: `description` (llama-3.1-8b-instant), `area` (llama-3.1-8b-instant), `compare` (llama-3.1-8b-instant), `smart-view` (llama-3.3-70b)
- `/api/search` / `/api/search/parse` — Full-text DB search + Nominatim geocoding
- `/api/administrate` — Admin user management
- `/api/parcels` / `/api/parcels/rio-negro` — Land parcel polygon data

### Key Libraries

| Purpose | Library |
|---|---|
| Database / Auth | @supabase/supabase-js, @supabase/ssr |
| Maps | Leaflet + React Leaflet, Mapbox GL + react-map-gl, Turf.js, flatbush |
| Forms | React Hook Form |
| Animation | Framer Motion |
| Charts | Recharts |
| Images | next-cloudinary |
| AI | groq-sdk (Groq API) |
| Icons | Lucide React |

### Map Architecture

The map page uses layered rendering: React Leaflet for the base interactive map, Mapbox GL (via `react-map-gl`) for vector tile parcels. `MapSettingsProvider` is the only global React context. Parcel layers have optimized variants (`ParcelsLayerOptimized`, `StaticParcelsLayer`) to handle large polygon counts.

### Styling

Tailwind CSS v4. Custom theme colors: `urbik` palette using cyan, emerald, and rose shades — defined in `tailwind.config.js`.

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project (anon key, browser-safe)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key, usado en API routes para operaciones que requieren bypassear RLS (ej: registro de usuarios)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Image hosting
- `GROQ_API_KEY` — LLM API
- `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD` — Optional staging HTTP Basic auth
