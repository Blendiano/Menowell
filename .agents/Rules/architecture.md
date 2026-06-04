---
trigger: always_on
---

# Architecture Rules

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Database ORM | Prisma |
| Database | PostgreSQL (via Prisma) |
| UI Library | React 18+ Server & Client Components |
| Styling | CSS Custom Properties (design tokens in `Tokens/tokens.css`) |
| AI Integration | OpenAI API |
| Authentication | NextAuth.js / Auth.js |
| Testing | Vitest (unit/integration) + Playwright (e2e) |
| Package Manager | npm |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router (routes & pages)
│   ├── (auth)/                   # Authentication-required layout group
│   │   ├── dashboard/
│   │   ├── symptoms/
│   │   ├── insights/
│   │   └── community/
│   ├── auth/                     # Public auth pages (login, register)
│   ├── learn/                    # Educational library (public)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing / home page
├── features/                     # Feature modules (co-located by domain)
│   ├── symptoms/
│   │   ├── components/
│   │   ├── actions.ts            # Server Actions
│   │   ├── validation.ts
│   │   └── types.ts
│   ├── community/
│   ├── insights/
│   ├── profile/
│   ├── notifications/
│   └── auth/
├── components/                   # Shared reusable components (see design-system.md)
│   ├── ui/                       # Button, Input, Card, Modal, etc.
│   └── layout/                   # Header, Sidebar, Footer
├── integrations/                 # Third-party service integrations
│   └── openai/
│       ├── client.ts
│       ├── prompts.ts
│       └── types.ts
├── services/                     # Business logic & database access layer
│   ├── symptom.service.ts
│   ├── user.service.ts
│   ├── community.service.ts
│   └── insight.service.ts
├── db/                           # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── lib/                          # Shared utilities & configuration
│   ├── auth.ts                   # Auth.js configuration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── env.ts                    # Environment variable validation
│   └── logger.ts                 # Structured logging
├── hooks/                        # Shared React hooks
├── types/                        # Global TypeScript types
└── utils/                        # Pure utility functions
```

---

## Routing & Navigation

The application uses Next.js App Router with two layout groups:

- **Public routes**: `/`, `/learn/*`, `/auth/*`
- **Authenticated routes** (grouped under `(auth)/`): `/dashboard`, `/symptoms/*`, `/insights/*`, `/community/*`, `/profile/*`, `/notifications/*`

Route design principles:
- Every route file is a Server Component by default
- Client Components are used only when interactivity is needed (forms, real-time updates, client-side state)
- Loading states use `loading.tsx` files per route segment
- Error boundaries use `error.tsx` files per route segment
- Not-found states use `not-found.tsx` per route segment

---

## Data Flow

```
User Interaction
       │
       ▼
┌─────────────────┐     ┌──────────────────┐
│  Server Action   │────►│  Validation      │
│  (features/*/)   │     │  (Zod schema)    │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────────────────────────┐
│  Service Layer (services/*)          │
│  - Business logic                    │
│  - Authorization checks              │
│  - Database queries via Prisma       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────┐
│  Database (PostgreSQL)│
└──────────────────────┘
```

For AI flows:

```
User Request
       │
       ▼
┌─────────────────┐     ┌──────────────────────┐
│  Server Action   │────►│  integrations/openai │
│  (features/*/)   │     │  - Prompt assembly   │
└─────────────────┘     │  - API call           │
                         │  - Response parsing   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Response +           │
                         │  "This information is │
                         │  educational and not  │
                         │  medical advice."     │
                         └──────────────────────┘
```

---

## State Management

| State Type | Strategy |
|---|---|
| Server state (data) | React Server Components + Server Actions with `revalidatePath` / `revalidateTag` |
| Client form state | React `useState` / `useActionState` |
| Transient UI state (modals, toasts) | React context or local state |
| URL state (filters, pagination) | `useSearchParams` / `useRouter` |
| Global auth state | Auth.js session context (Server Component `auth()` / Client Component `useSession()`) |

No global state library (Redux, Zustand). Data fetching uses Server Components with async/await; mutations use Server Actions.

---

## Authentication & Authorization Architecture

- **Auth provider**: Auth.js (NextAuth.js) with credentials or OAuth providers
- **Session strategy**: JWT-based (no database sessions)
- **Middleware**: `src/middleware.ts` protects all `(auth)/*` routes, redirects unauthenticated users to `/auth/login`
- **Data authorization**: Every service function checks that the requesting `userId` owns the requested resource before querying
- **Role model**: Single user role (no admin panel in MVP)

See `security.md` for detailed security rules.

---

## Database Schema (High-Level Entities)

```
User
├── id, email, name, image, dateOfBirth, stage, createdAt

SymptomLog
├── id, userId, type, severity, date, notes, createdAt

Insight
├── id, userId, content, type, createdAt

CommunityPost
├── id, userId, title, content, createdAt, updatedAt

Comment
├── id, postId, userId, content, createdAt

Notification
├── id, userId, type, read, content, createdAt

EducationalArticle
├── id, slug, title, content, category, stage, publishedAt
```

Each entity's Prisma model includes timestamps, foreign keys with `onDelete: Cascade`, and proper indexes.

---

## Component Hierarchy & Composition

```
RootLayout
├── AuthProvider (Session context)
├── ThemeProvider (Dark mode)
└── Page layouts
    ├── PublicLayout (header + footer)
    └── AuthLayout (sidebar + top nav + main content)
        ├── DashboardPage
        │   ├── DashboardHeader
        │   ├── SymptomSummaryCard
        │   ├── StageBadge
        │   ├── InsightPreviewCard
        │   └── RecommendedContentCard
        ├── SymptomLogPage
        │   ├── SymptomForm
        │   ├── SymptomHistoryList
        │   └── SymptomChart
        └── CommunityPage
            ├── PostList
            ├── PostCard
            └── CommentThread
```

Feature components live in `features/*/components/`. Shared components live in `components/ui/` and `components/layout/`.

---

## API Layer

Two approaches for data mutations:

1. **Server Actions** (preferred for form mutations) — co-located in `features/*/actions.ts`
2. **Route Handlers** (for external API consumption, webhooks) — placed in `src/app/api/*/route.ts`

Every API endpoint and Server Action must include:
- Input validation (Zod schema)
- Authentication check
- Authorization check
- Error handling (try/catch with typed responses)
- No direct DB access — delegate to `services/*`

---

## Testing Strategy

| Type | Tool | Scope |
|---|---|---|
| Unit tests | Vitest | Pure functions, validation schemas, services |
| Integration tests | Vitest + Supertest | API routes, Server Actions |
| Component tests | Vitest + React Testing Library | UI components, hooks |
| E2E tests | Playwright | Critical user flows (auth, symptom logging) |
| Accessibility tests | axe-core (via Playwright) | Every page |

Test files are co-located: `*.test.ts` next to the source file.

---

## Error Handling & Logging

- **Client-side errors**: `error.tsx` boundary per route segment + global error boundary
- **Server Action errors**: Return `{ error: string }` shape; never throw uncaught exceptions
- **API route errors**: Return structured JSON `{ error: string, code: string }` with appropriate HTTP status
- **Logging**: Structured JSON logger (`lib/logger.ts`) — never logs health data, tokens, or PII
- **Form validation**: Zod schemas define errors per field; errors are returned from Server Actions and displayed inline

---

## Environment Configuration

All environment variables are validated at startup via `lib/env.ts` using Zod:

```
DATABASE_URL
AUTH_SECRET
AUTH_GITHUB_ID / AUTH_GITHUB_SECRET (if OAuth)
OPENAI_API_KEY
NEXT_PUBLIC_APP_URL
```

Three environments: `development`, `staging`, `production`.

---

## Privacy Architecture

- User data is isolated by `userId` at the database query level
- No PII or health data is ever sent to client-side logs, analytics, or error tracking
- Symptom logs are encrypted at rest (database-level encryption)
- Users can export and delete their data (GDPR compliance path)
- Session tokens are HTTP-only, secure, same-site cookies
- AI prompts never include PII; only anonymized symptom data is sent to OpenAI

See `security.md` for additional security rules.

---

## Accessibility Architecture

- All components must support: keyboard navigation, screen readers (ARIA), high contrast mode, large text (up to 200%), dark mode
- Color contrast ratios follow WCAG 2.1 AA minimum (4.5:1 for text)
- Focus indicators are visible on all interactive elements
- Semantic HTML is used throughout (no div-soup)
- Forms have proper `<label>` associations and error announcements

See `design-system.md` for visual accessibility requirements.

---

## Mobile-First Responsive Design

- All layouts are built mobile-first using CSS custom properties from `Tokens/tokens.css`
- Breakpoints: Mobile (default) → Tablet (768px) → Desktop (1024px)
- Grid system: 4 columns (mobile) / 8 columns (tablet) / 12 columns (desktop)
- Touch targets are minimum 44x44px
- Bottom navigation replaces sidebar on mobile
- Forms are single-column on mobile, multi-column on desktop

---

## Performance Architecture

- Server Components minimize client-side JavaScript
- Images use `next/image` with lazy loading
- API responses are cached with `stale-while-revalidate` where appropriate
- Large lists are paginated (cursor-based)
- AI responses are streamed using `ReadableStream`
- Bundle analysis is checked before production builds

---

## Scalability (Future Extraction Path)

Build MVP as a **modular monolith**. The following modules are designed with clean interfaces so they can be extracted into standalone services:

1. **AI Service** — `integrations/openai/` can become a dedicated microservice behind a REST/gRPC API
2. **Notification Service** — `features/notifications/` can be extracted to handle email, push, and in-app notifications
3. **Analytics Service** — Usage analytics can be extracted into a separate data pipeline

Each extractable module communicates via typed interfaces; no direct imports across service boundaries in the extracted model.

---

## Reusability

- Create a shared component before duplicating UI patterns
- Extract shared business logic into `services/*` before duplicating in features
- Shared types live in `types/`; feature-specific types are co-located
- Custom hooks live in `hooks/` when used by 2+ features
- Pure utility functions live in `utils/`

---

## Feature Boundaries

Each feature in `features/*/` owns:

- **UI** — `components/` subfolder
- **Validation** — `validation.ts` (Zod schemas)
- **Actions** — `actions.ts` (Server Actions)
- **Types** — `types.ts` (feature-specific types)
- **Tests** — `*.test.ts` files (co-located)

Features are independent modules. Cross-feature imports are discouraged; shared logic belongs in `services/`, `lib/`, or `components/`.

---

## Database Access

- Database access must occur through `services/*` or server actions
- Never import `prisma.ts` or run Prisma queries directly inside UI components
- Server Actions in `features/*/actions.ts` delegate to service functions
- Services handle authorization checks before returning data
