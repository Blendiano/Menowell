# New API Route Workflow

Use this workflow when creating a new API endpoint. Reference `api-route-scaffolder/Skills.md` for code templates and `architecture.md` for data flow decisions.

---

## 1. Choose Route Handler vs Server Action

| Use Route Handler when... | Use Server Action when... |
|---|---|
| External API or mobile app needs the endpoint | Form submission inside a page |
| Webhook receiver | Tight integration with UI revalidation |
| Third-party integration | Data mutation triggered by user interaction |
| You need fine-grained HTTP control (status codes, headers) | You want co-located logic in `features/*/actions.ts` |

**Decision output:** If Route Handler → proceed with this workflow. If Server Action → use `features/*/actions.ts` pattern instead (see `architecture.md` for Server Action template).

---

## 2. Create the Route File

```
src/app/api/
└── symptoms/
    ├── route.ts              # GET (list), POST (create)
    ├── [id]/
    │   └── route.ts          # GET (single), PUT, PATCH, DELETE
    └── validation.ts         # Zod schemas for this endpoint
```

- File: `route.ts` (Next.js convention — lowercase, exact name)
- Folder: kebab-case (`symptom-logs`, not `symptomLogs`)
- Validation: co-located `validation.ts` in the same folder, or import from `features/*/validation.ts`

**Done when:** File exists with `export async function GET/POST` stubs returning 501.

---

## 3. Define the Response Format

All API responses use a consistent shape:

```typescript
// Success
{ "data": T | T[] }           // status 200
{ "data": T }                  // status 201 (created)

// Error
{ "error": string, "code": string }

// Paginated list
{ "data": T[], "nextCursor": string | null, "total"?: number }
```

**Done when:** You've decided the response type (`T`) and verified it matches this format.

---

## 4. Write the Zod Validation Schema

Create or update `validation.ts`:

```typescript
import { z } from "zod"

export const CreateSymptomSchema = z.object({
  severity: z.number().min(1).max(10),
  type: z.enum(["hot_flash", "fatigue", "mood_swing"]),
  notes: z.string().max(500).optional(),
})

export const SymptomQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
```

**Done when:** Schemas exist, use `safeParse` (never `parse`), and cover all request inputs (body, query params, path params).

See `api-route-scaffolder/Skills.md` for the full validation pattern.

---

## 5. Implement Authentication

```typescript
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
  }
  // ...
}
```

**Rules:**
- Call `auth()` in every handler — never skip auth for "internal" routes
- Derive `userId` from the session, never from the request body
- Return `401` for missing auth, `403` for wrong-owner access

**Done when:** Every handler method has an auth check returning `401` for unauthenticated requests.

---

## 6. Implement Authorization

```typescript
// In the service (not the handler):
export async function getSymptomLogs(userId: string) {
  return prisma.symptomLog.findMany({
    where: { userId }  // always filter by authenticated user
  })
}
```

**Rules:**
- Authorization (row-level security) lives in the service layer, not the handler
- Handler extracts `userId` from session and passes it to the service
- Service never accepts `userId` from the client

**Done when:** All service functions filter by `userId` derived from the authenticated session.

---

## 7. Wire the Service Layer

```typescript
import { symptomService } from "@/services/symptom-service"

// In the handler:
const data = await symptomService.getAll(session.user.id, parsed.data)
return NextResponse.json({ data })
```

- Services live in `src/services/` (see `architecture.md`)
- Handlers never access Prisma directly
- Services handle business logic, data access, and authorization filtering

**Done when:** Handler delegates all data access to `services/*` and contains zero Prisma calls.

---

## 8. Implement Error Handling

```typescript
try {
  // handler logic
} catch (error) {
  logger.error("Failed to fetch symptoms", { userId: session?.user?.id })
  return NextResponse.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, { status: 500 })
}
```

**Status codes:**

| Scenario | Code |
|---|---|
| Successful GET | 200 |
| Resource created | 201 |
| Validation failure | 400 |
| Not authenticated | 401 |
| Not authorized (wrong owner) | 403 |
| Not found | 404 |
| Conflict (duplicate) | 409 |
| Rate limited | 429 |
| Unhandled server error | 500 |

**Done when:** Every handler method is wrapped in try/catch, returns typed error responses, and never exposes internal error details to the client.

---

## 9. Add Logging

```typescript
import { logger } from "@/lib/logger"

// Log security events only (no health data):
logger.info("Symptoms fetched", { userId: session.user.id, count: data.length })
```

**Never log:** symptom contents, severity values, stage results, AI insight content, email, name, or tokens.

**Done when:** Security-relevant events are logged; no health data or PII appears in any log statement.

See `security.md` for the full logging rules.

---

## 10. Add Rate Limiting

```typescript
import { rateLimiter } from "@/lib/rate-limiter"

const { success } = await rateLimiter.check(session.user.id, "symptom:create")
if (!success) {
  return NextResponse.json({ error: "Too many requests", code: "RATE_LIMITED" }, { status: 429 })
}
```

**Default limits:** See `security.md` for per-endpoint rate limit table.

**Done when:** State-changing endpoints (POST, PUT, PATCH, DELETE) have rate limiting; read-only GET endpoints do not need it.

---

## 11. Write Tests

Co-locate `route.test.ts` next to `route.ts`:

```typescript
import { GET, POST } from "./route"

describe("GET /api/symptoms", () => {
  it("returns 401 without auth", async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const response = await GET(new NextRequest("http://localhost/api/symptoms"))
    expect(response.status).toBe(401)
  })

  it("returns 400 for invalid query params", async () => { ... })
  it("returns 200 for valid request", async () => { ... })
  it("returns 403 for another user's data", async () => { ... })
})
```

**Test every:** 401 (no auth), 400 (bad input), 200/201 (success), 403 (wrong owner), 404 (not found), 429 (rate limited).

**Done when:** All status code paths have test coverage.

---

## 12. Add Pagination (for list endpoints)

```typescript
// Response shape for paginated endpoints:
{ "data": TSymptom[], "nextCursor": string | null, "total"?: number }

// Request shape:
// GET /api/symptoms?cursor=abc&limit=20
```

Use cursor-based pagination for large datasets, offset-based (page/limit) for small ones (< 1000 records).

**Done when:** List endpoints return paginated responses with a `nextCursor` or implement page/limit.

---

## 13. Review Against Security & Architecture Rules

Before considering the route complete:

- [ ] `security.md` — auth checked in handler? Authorization in service? Rate limiting applied? Logging avoids health data?
- [ ] `architecture.md` — follows folder structure? Delegates to service layer? No direct DB access in handler?
- [ ] `code-style.md` — naming correct? File conventions followed? TypeScript strict?
- [ ] `api-route-scaffolder/Skills.md` — matches the standard template patterns?

**Done when:** All four review checkboxes are checked.
