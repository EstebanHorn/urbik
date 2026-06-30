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

**Geora** is a Spanish-language real estate listing platform. Stack: Next.js 16 App Router, React 19, TypeScript, Supabase (auth + DB), Tailwind CSS v4.

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

Domain-scoped folders mirror the pages: `home/`, `dashboard/`, `property/`, `map/`, `profile/`, `search/`, `smart-zone/`, `administrate/`, `analytics/`, `chat/`, `google-map/`, `layout/` (Navbar + Footer), `ui/` (shared primitives).

### Services (`src/services/`)

Client-side data-fetching helpers that wrap `fetch()` calls to API routes:
- `propertyService.ts` — `createProperty()`, `updateProperty()`, `deleteProperty()`
- `search.ts` — `getMapSuggestions()` (Nominatim/OSM) + `searchSuggestions()` (combined)
- `reviews.ts` — Agency review service

### Custom Hooks (`src/hooks/`)

- `usePropertyForms.ts` — React Hook Form wrapper for property creation/editing. Handles amenity mapping (Spanish labels → camelCase: `agua → hasWater`), parcel selection state, and `extraData` for type-specific fields (commercial activity, hectares, soil type, etc.).
- `useSearch.ts` — Google Maps Places Autocomplete + `/api/search` + `/api/search/parse` in parallel. Query debounce 300ms, 3-char minimum. Three suggestion types: `ADDRESS` (→ map), `REALESTATE_USER` (→ agency profile), `PROPERTY_SEARCH` (→ filtered results).
- `useChatMessages.ts` / `useChatThreads.ts` — Chat feature hooks.

### Shared Lib (`src/lib/`)

- `supabase/client.ts` — Browser-side `createClient()`
- `supabase/server.ts` — Server-side `createServerClient()` with SSR cookies (for Server Components / middleware)
- `supabase/admin.ts` — `createAdminClient()` with service role key (used in API routes to bypass RLS)
- `types.ts` — All shared TypeScript types and enums (Role, PropertyType, OperationType, PropertyStatus, Currency, Property interface)
- `utils.ts` — `slugify()`, `generateUniqueSlug()` (DB-checking, handles collisions)
- `jurisdictions.ts` — `JURISDICTIONS_BY_PROVINCE`: hardcoded mapping of 23 Argentine provinces, used for real estate license dropdowns
- `rioColoradoIndex.ts` — Flatbush spatial index for Río Colorado land parcels. Loads `riocolorado.geojson` from the Supabase `geojson` storage bucket (via `createAdminClient()`), cached in-memory per server instance.

### Data Layer

**Supabase** is the database and auth layer. All DB access uses `@supabase/supabase-js` query builders (`.from().select().eq()` etc.). No Prisma schema exists; the `prisma generate` in the build script is for Prisma Accelerate connection pooling only.

Key Supabase tables:
- `profiles` — Auth user records with `role` field (`USER | REALESTATE | ADMIN | AGENT`)
- `user_profiles` / `real_estates` — Profile extension rows
- `real_estate_licenses`, `real_estate_offices` — Agency sub-entities (multi-valued: many per agency)
- `properties` — Listings with images (Cloudinary URLs), location (lat/lon), pricing, amenity booleans, parcel data

Columns are `snake_case` in DB; API routes map them to `camelCase` in responses (custom mapper functions, e.g. `mapProperty()`).

Pagination responses follow: `{ items, total, page, pageSize, totalPages }`.

### Authentication (`src/lib/supabase/`, `src/middleware.ts`)

Supabase Auth with Google OAuth and email/password. The OAuth callback is at `/api/auth/callback` (exchanges code for session via `supabase.auth.exchangeCodeForSession`). `next-auth` remains as a dependency but Supabase Auth is the active provider.

Middleware order: HTTP Basic Auth (staging) → Supabase auth → role check.

Protected routes:
- `/dashboard` — requires `ADMIN | AGENT | REALESTATE`
- `/administrate` — requires `ADMIN`
- Unauthenticated users redirect to `/auth/login`; wrong role redirects to `/unauthorized`

Staging uses HTTP Basic Auth via `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` env vars (checked first in middleware before Supabase auth).

### API Routes (`src/app/api/`)

**Auth:**
- `/api/auth/callback` — OAuth code exchange
- `/api/auth/register` — User and agency registration (creates profile + role-specific rows)

**Property CRUD:**
- `/api/property` / `/api/property/[id]` — Property CRUD (checks ownership + role on update/delete)
- `/api/property/parcel` — Attach parcel geometry to a property

**Property Queries:**
- `/api/properties/search` — Filtered search (price range, bedrooms, amenities, radius); builds dynamic Supabase query chains
- `/api/properties/in-bounds` / `/api/properties/map` — Map viewport queries
- `/api/properties/favorite` / `/api/properties/favorites` — Favorites management
- `/api/properties/featured` — Featured listings

**AI / LLM:**
- `/api/smart-zone/[action]` — Groq API actions:
  - `smart-description` — llama-3.1-8b-instant (copywriting)
  - `smart-area` — llama-3.1-8b-instant (location analysis)
  - `smart-compare` — llama-3.1-8b-instant (property comparison)
  - `smart-view` — llama-3.3-70b-versatile (structured JSON output, temp 0.2)
- `/api/search/parse` — NLP extraction of structured filters from natural language queries

**Search & Geocoding:**
- `/api/search` — Full-text DB search + agency suggestions
- `/api/parcels` / `/api/parcels/rio-colorado` — Land parcel polygon data

**Other:**
- `/api/administrate` — Admin user management (ADMIN only)
- `/api/inquiries` / `/api/inquiries/[id]` — Contact inquiries CRUD
- `/api/stats/dashboard`, `/api/stats/agency-view`, `/api/stats/property-view` — Analytics
- `/api/upload` — Cloudinary file uploads
- `/api/user` — User profile management
- `/api/realestate/[id]/reviews` — Agency reviews

API error handling: `try-catch` in all routes. Auth check first (401), then ownership/role (403), then not-found (404), then server errors (500). Error messages are in Spanish.

### Key Libraries

| Purpose | Library |
|---|---|
| Database / Auth | @supabase/supabase-js, @supabase/ssr |
| Maps | Leaflet + React Leaflet, Mapbox GL + react-map-gl, Turf.js, flatbush |
| Google Maps | @vis.gl/react-google-maps |
| Forms | React Hook Form, react-phone-input-2 |
| Animation | Framer Motion |
| Charts | Recharts |
| Images | next-cloudinary |
| AI | groq-sdk (Groq API) |
| Icons | Lucide React |
| Utilities | gray-matter (markdown parsing), bcryptjs |

### Map Architecture

The map page uses layered rendering: React Leaflet for the base interactive map, Mapbox GL (via `react-map-gl`) for vector tile parcels. `MapSettingsProvider` is the only global React context (in `src/app/providers.tsx`). Parcel layers have optimized variants (`ParcelsLayerOptimized`, `StaticParcelsLayer`) to handle large polygon counts. Flatbush provides efficient spatial indexing for boundary queries.

### Styling

Tailwind CSS v4. Custom theme colors: `geora` palette using cyan, emerald, and rose shades — defined in `tailwind.config.js`. Global styles in `src/app/globals.css`.

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project (anon key, browser-safe)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key, usado en API routes para operaciones que requieren bypassear RLS (ej: registro de usuarios)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Image hosting
- `GROQ_API_KEY` — LLM API
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps Places Autocomplete + Geocoding
- `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD` — Optional staging HTTP Basic auth
