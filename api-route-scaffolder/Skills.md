# API Route Scaffolder Skill

Use this skill when generating API Route Handlers (`src/app/api/*/route.ts`).

---

## Route Handler vs Server Action

| Approach | When to use |
|---|---|
| **Server Action** (`features/*/actions.ts`) | **Preferred** for form mutations, tight integration with UI, revalidation needs |
| **Route Handler** (`src/app/api/*/route.ts`) | External API consumption, webhooks, mobile app backends, third-party integrations |

See `architecture.md` for more detail on data flow.

---

## File Conventions

```
src/app/api/
├── symptoms/
│   ├── route.ts              # GET (list), POST (create)
│   ├── [id]/
│   │   └── route.ts          # GET (single), PUT, PATCH, DELETE
│   └── validation.ts          # Zod schemas (co-located or in features/)
├── auth/
│   └── route.ts
├── users/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
└── webhooks/
    └── route.ts
```

- Each route folder contains `route.ts` (Next.js convention)
- Validation schemas co-located in `validation.ts` within the same folder, or imported from `features/*/validation.ts`
- Service calls delegate to `services/*.service.ts`

---

## Standard Route Template

```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { MySchema } from "./validation"
import { myService } from "@/services/my-service"

// ── GET ──────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = MyQuerySchema.safeParse(searchParams)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message, code: "VALIDATION_ERROR" }, { status: 400 })
    }

    const data = await myService.getAll(session.user.id, parsed.data)
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

// ── POST ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = MyBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message, code: "VALIDATION_ERROR" }, { status: 400 })
    }

    const data = await myService.create(session.user.id, parsed.data)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}

// ── PUT ──────────────────────────────────────────
export async function PUT(request: NextRequest) { /* same pattern as POST */ }

// ── PATCH ────────────────────────────────────────
export async function PATCH(request: NextRequest) { /* same pattern as POST */ }

// ── DELETE ───────────────────────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    await myService.delete(session.user.id, params.id)
    return NextResponse.json({ data: null }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 })
  }
}
```

---

## Standard Response Format

All API responses follow a consistent shape:

```typescript
// Success (single or list)
{ "data": T | T[] }

// Success (created)
{ "data": T } // status 201

// Success (no content — rare; use 200 with null)
{ "data": null }

// Error
{ "error": string, "code": string }
```

### HTTP Status Code Conventions

| Scenario | Status |
|---|---|
| Successful GET (list or single) | `200` |
| Successful POST (resource created) | `201` |
| Successful PUT/PATCH/DELETE | `200` |
| Validation failure (Zod) | `400` |
| Authentication missing | `401` |
| Authorization failure (wrong user) | `403` |
| Resource not found | `404` |
| Conflict (duplicate) | `409` |
| Rate limited | `429` |
| Unhandled server error | `500` |

---

## Auth & Authorization Pattern

Authentication and authorization are checked in **every** Route Handler — never delegated to the service layer for auth checks.

```typescript
// ✅ Correct — auth in handler, data filter in service
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }
  const data = await myService.getAll(session.user.id)  // service filters by userId
  return NextResponse.json({ data })
}

// ❌ Wrong — no auth check
export async function GET(request: NextRequest) { ... }
```

---

## Validation Pattern

Use Zod schemas imported from `validation.ts`. Validate with `safeParse` (never `parse` — don't throw on bad input):

```typescript
// validation.ts
import { z } from "zod"

export const MyBodySchema = z.object({
  severity: z.number().min(1).max(10),
  type: z.enum(["hot_flash", "fatigue", "mood_swing", "other"]),
  notes: z.string().max(500).optional(),
})

export const MyQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  from: z.string().optional(),
  to: z.string().optional(),
})
```

---

## Error Handling

- Every Route Handler wraps its logic in `try/catch`
- Never expose internal error details to the client — return a generic message
- Log unexpected errors using `lib/logger.ts` (never log health data, PII, or tokens)
- Validation errors return the Zod error message directly (safe — schema messages contain no secrets)

---

## Pagination Pattern

For list endpoints, use cursor-based pagination:

```typescript
// Request:  GET /api/symptoms?cursor=abc&limit=20
// Response:
{
  "data": [ ... ],
  "nextCursor": "xyz",     // null if no more pages
  "total": 150             // optional, for UI display
}
```

Offset-based pagination (page/limit) is acceptable for small datasets (< 1000 records).

---

## Testing Pattern

Test files co-located next to the route handler:

```typescript
// src/app/api/symptoms/route.test.ts
import { GET, POST } from "./route"

describe("GET /api/symptoms", () => {
  it("returns 401 without auth", async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const response = await GET(new NextRequest("http://localhost/api/symptoms"))
    expect(response.status).toBe(401)
  })

  it("returns symptoms for authenticated user", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1" } })
    vi.mocked(myService.getAll).mockResolvedValue([mockSymptom])
    const response = await GET(new NextRequest("http://localhost/api/symptoms"))
    const body = await response.json()
    expect(body.data).toHaveLength(1)
  })
})
```

---

## Cross-References

- `architecture.md` — folder structure, data flow, service layer
- `security.md` — authentication, authorization, rate limiting, logging rules
- `code-style.md` — naming conventions, file organization, TypeScript strictness
- `workflows/new-api-route.md` — 12-step process for creating a new API route
