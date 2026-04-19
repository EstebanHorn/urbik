# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Development server with Turbopack
npm run build      # prisma generate + next build (Turbopack)
npm run start      # Production server
npm run lint       # ESLint
npx prisma studio  # Visual DB browser
npx prisma migrate dev --name <name>  # Create and apply a migration
```

No test suite is configured.

## Architecture

**Urbik** is a Spanish-language real estate listing platform. Stack: Next.js 16 App Router, React 19, TypeScript, Prisma + PostgreSQL, NextAuth v4, Tailwind CSS v4.

### Routing & Pages (`src/app/`)

Pages map to user-facing routes. Feature-heavy pages pull their components from `src/features/<page>/` rather than colocating them. API routes live in `src/app/api/` and use the Next.js route handler pattern (`route.ts`).

Key page groups:
- `/` — Landing (home features)
- `/properties`, `/property/[id]` — Listing browse and detail
- `/map` — Interactive Leaflet map with real-time bounds querying
- `/dashboard` — Agency/agent dashboard (role-gated)
- `/profile` — User profile management
- `/administrate` — Admin panel (ADMIN role only)
- `/help` — Markdown-driven help articles (gray-matter)

### Feature Modules (`src/features/`)

Domain-scoped component folders: `home/`, `dashboard/`, `property/`, `properties/`, `map/`, `profile/`, `register/`, `login/`, `administrate/`, `help/`. These components are imported by the corresponding page but kept separate to avoid bloating `app/`.

### Shared Components (`src/components/`)

- `Footer&Navbar/` — Site-wide navigation
- `SmartZone/` — AI-powered UI widgets
- Misc utilities: image uploader, modals, search bar

### Data Layer

Prisma ORM with PostgreSQL. Client singleton at `src/libs/db.ts`.

Key models:
- `AllUsers` — Auth table with `Role` enum: `USER | REALESTATE | ADMIN | AGENT`
- `User` / `RealEstate` — Profile extensions linked to `AllUsers`
- `Property` — Listings with images (Cloudinary), location, pricing, type
- `Favorite`, `Inquiry`, `Alert` — User interactions
- `Account`, `Session` — NextAuth adapter tables

### Authentication (`src/auth.ts`, `src/middleware.ts`)

NextAuth v4 with JWT strategy. Providers: credentials (bcryptjs) + Google OAuth. The middleware enforces role-based route protection — check `src/middleware.ts` for the protected path matrix. A `BASIC_AUTH` env var enables HTTP Basic auth for staging.

### API Routes (`src/app/api/`)

- `/api/auth/[...nextauth]` — NextAuth handlers
- `/api/property` / `/api/properties/*` — Property CRUD, favorites, map-bounds queries
- `/api/smart-zone/*` — Groq LLM (Llama 3.1 8B) for AI descriptions, area analysis, comparisons
- `/api/search/*` — Full-text DB search + Nominatim geocoding
- `/api/user` — Profile GET/PUT, password change
- `/api/register` — User and agency registration
- `/api/administrate/*` — Admin user management
- `/api/parcels/*` — Parcel/land polygon data

### Key Libraries

| Purpose | Library |
|---|---|
| Maps | Leaflet + React Leaflet, Mapbox GL, Turf.js |
| Forms | React Hook Form |
| Animation | Framer Motion |
| Charts | Recharts |
| Images | next-cloudinary |
| AI | groq-sdk (Groq API) |
| Icons | Lucide React |

### Styling

Tailwind CSS v4. Custom theme colors: `urbik` palette using cyan, emerald, and rose shades — defined in `tailwind.config.js`.

### Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `GROQ_API_KEY`
- `BASIC_AUTH` (optional, staging only)
