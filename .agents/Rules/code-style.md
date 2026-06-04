---
trigger: always_on
---

# Code Style Rules

## TypeScript Strictness

- `strict: true` in `tsconfig.json` — no exceptions
- No `any` — use `unknown` and narrow with type guards
- No `@ts-ignore` or `@ts-expect-error` — fix the type
- No `as` casts — prefer type guards, Zod parsing, or satisfies
- All functions have explicit return types (no inference for public APIs)
- All function parameters are typed — no implicit `any`

---

## Naming Conventions

| Construct | Convention | Example |
|---|---|---|
| React components | PascalCase | `SymptomTracker.tsx` |
| Next.js reserved files | lowercase | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts` |
| Regular files (utils, services, hooks) | kebab-case | `symptom-service.ts`, `use-auth.ts` |
| Functions / methods | camelCase | `createSymptomLog()` |
| Variables / parameters | camelCase | `symptomList`, `userId` |
| Constants (top-level) | UPPER_SNAKE_CASE | `MAX_SEVERITY`, `DEFAULT_PAGE_SIZE` |
| Types | PascalCase prefixed with `T` | `TUser`, `TSymptomLog` |
| Interfaces | PascalCase | `User`, `SymptomLog` |
| Enums | PascalCase, members UPPER_SNAKE | `Severity { MILD, MODERATE, SEVERE }` |
| Prisma models | PascalCase | `User`, `SymptomLog` |
| Database columns | snake_case (Prisma maps) | `created_at`, `user_id` |
| CSS custom properties | `--sys-*` prefix (see Tokens) | `--sys-color-primary` |
| Environment variables | UPPER_SNAKE | `DATABASE_URL`, `OPENAI_API_KEY` |
| React hooks | `use` + PascalCase | `useSymptoms()`, `useAuth()` |
| Server Actions | camelCase | `createSymptomLog()`, `updateProfile()` |
| API route handlers | `GET`, `POST`, etc. | `export async function GET() {}` |
| Zod schemas | PascalCase + `Schema` | `SymptomLogSchema`, `LoginSchema` |

---

## File & Directory Naming

```
features/symptoms/
├── components/
│   ├── symptom-tracker.tsx          # kebab-case for non-page files
│   ├── symptom-chart.tsx
│   └── severity-badge.tsx
├── actions.ts                       # Server Actions
├── validation.ts                    # Zod schemas
├── types.ts                         # Feature types
├── symptom-service.test.ts          # co-located tests
└── page.tsx                         # Next.js reserved (lowercase)

components/ui/
├── button.tsx
├── input.tsx
├── card.tsx
└── modal.tsx

services/
├── symptom-service.ts               # kebab-case
├── user-service.ts
└── insight-service.ts
```

---

## Imports

Order (separated by blank line):

1. Node built-ins / external packages (`next/*`, `react`, `prisma`, etc.)
2. Project modules (`@/`, `../`, `./`)
3. Type-only imports (grouped last within each section)

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TUser } from "@/types/user";
```

- Prefer `import type` for type-only imports (avoids bundling)
- No barrel files (`index.ts` re-exports) — import directly from the source file

---

## Exports

- **Named exports** always — no `export default` (except Next.js `page.tsx`, `layout.tsx`, etc.)
- Export types alongside values where possible
- One component or concern per file

---

## Type vs Interface

| Use case | Construct |
|---|---|
| Props type | `type` |
| API response shapes | `type` |
| Union / intersection types | `type` |
| Prisma model shapes | `interface` |
| Class contracts | `interface` |
| Declaration merging (rare) | `interface` |

Default to `type` unless you need declaration merging.

---

## Component Patterns

**Server Components (default):**
- No `"use client"` directive unless interactivity is required
- Fetch data directly with async/await
- Use `searchParams` for list filtering / pagination

**Client Components (when needed):**
- Explicit `"use client"` at the top of the file
- Keep client boundaries as small as possible — wrap only the interactive part
- Never import server-only modules (Prisma, `cookies()`, `headers()`) in client files

**Props typing:**
```typescript
type TButtonProps = {
  variant: "primary" | "secondary"
  label: string
  onClick?: () => void
}

export function Button({ variant, label, onClick }: TButtonProps) { ... }
```

- No `React.FC` or `React.FunctionalComponent` — use plain function signatures
- Use `React.ReactNode` for children, default to `ReactNode`
- Boolean props default to `false` — omit `={true}`

---

## Styling

- Use CSS custom properties from `Tokens/tokens.css` exclusively for colors, spacing, typography, and breakpoints
- No Tailwind, no styled-components, no CSS-in-JS
- CSS Modules (`*.module.css`) for component-specific styles
- Use semantic class names, not generated ones
- Responsive via CSS custom property-based media queries

```css
.button {
  background: var(--sys-color-primary);
  padding: var(--sys-spacing-md);
  border-radius: var(--sys-radius-md);
}
```

---

## Custom Hooks

- Prefix with `use` and PascalCase: `useSymptoms`, `useAuth`
- Return a typed object, not a tuple (clearer at call sites)
- Co-locate in `hooks/` when shared; in `features/*/hooks/` when feature-specific
- Each hook handles loading and error states internally

```typescript
export function useSymptoms(userId: string): TUseSymptomsResult {
  // returns { symptoms, isLoading, error }
}
```

---

## Server Actions

- Placed in `features/*/actions.ts`
- Marked with `"use server"`
- Accept and return typed data (never `any`)
- Validate inputs with Zod before processing
- Return `{ data?: T, error?: string }` shape (never throw)
- Call `revalidatePath()` or `revalidateTag()` after mutations

```typescript
"use server"

export async function createSymptomLog(input: TCreateSymptomInput): Promise<TActionResult<TSymptomLog>> {
  const parsed = SymptomLogSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.message }
  // ...
}
```

---

## Forms & Validation

- **Validation library:** Zod
- **Schema naming:** `PascalCase + Schema` — e.g., `SymptomLogSchema`
- **Schema placement:** `features/*/validation.ts` for feature-specific; `lib/validation.ts` for shared
- **Error display:** Errors returned from Server Actions; displayed inline next to each field
- **Loading state:** All submit buttons show a spinner or disabled state while pending
- **Form reset:** Reset form after successful submission

---

## Error Handling

**Components:**
- Every component handles Loading, Empty, Error, and Success states
- Error boundaries (`error.tsx`) per route segment for uncaught errors
- Global error boundary in root `app/error.tsx`

**Server Actions:**
- Return `{ data: T } | { error: string }` — never throw
- Validate input before processing

**API routes:**
```typescript
return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 })
```

**Logging:**
- Use `lib/logger.ts` (structured JSON)
- Never log: health records, PII, auth tokens, session IDs
- Log errors with enough context to debug but no user data

---

## Async / Await

- Always use `async/await` — no raw `.then()` / `.catch()`
- Wrap database and API calls in try/catch
- Use `Promise.all()` for parallel independent requests
- Use `Promise.allSettled()` when partial failure is acceptable

---

## AI Integration Code Rules

- All OpenAI calls go through `integrations/openai/client.ts`
- Never import the OpenAI SDK directly outside `integrations/openai/`
- Never call AI from Client Components — always via Server Actions
- AI prompts never include PII — use anonymized symptom data only
- Every AI response must append: `"This information is educational and not medical advice."`

---

## Environment Variables

- Server-only env vars: accessed via `process.env` (never prefixed `NEXT_PUBLIC_`)
- Client-safe env vars: prefixed `NEXT_PUBLIC_`
- Validated at startup in `lib/env.ts` using Zod
- Never access `process.env` directly in components — use `lib/env.ts` in server code

---

## Comments

- Prefer self-documenting code over comments
- JSDoc for public APIs (services, utils, hooks) — `@param`, `@returns`
- No inline comments explaining "what" (the code says what) — only "why"
- TODO comments: format `// TODO(username): description` — never ship TODOs to production
- No commented-out code — delete it

---

## Testing Conventions

- **Test framework:** Vitest
- **Test file naming:** `*.test.ts` or `*.test.tsx`, co-located with source
- **E2E:** Playwright tests in `tests/e2e/`
- **Describe/it blocks:** describe the component/module, it describes the behavior
- **Mocking:** Use `vi.mock()` at module level; use `vi.spyOn()` for specific functions
- **Prisma mocking:** Use `vitest-environment-prisma` or mock `lib/prisma.ts`
- **Coverage target:** 80%+ for services, 70%+ for components
- **Accessibility testing:** Integrate `axe-core` in Playwright tests

```typescript
describe("SymptomLogSchema", () => {
  it("rejects severity above 10", () => {
    const result = SymptomLogSchema.safeParse({ severity: 11 })
    expect(result.success).toBe(false)
  })
})
```

---

## File Length

- **Maximum:** 300 lines per file
- Split when exceeded — extract utilities, sub-components, or helper functions
- Next.js `page.tsx` files: max 150 lines (should be thin composition)

---

## Accessibility (Code-Level)

- All interactive elements are focusable and keyboard-activatable
- Forms: each input has an associated `<label>` with `htmlFor`
- Images: `next/image` with meaningful `alt` text (never empty for decorative)
- ARIA: use native HTML semantics first; ARIA only when native element is insufficient
- Focus: visible focus indicators on all interactive elements (`:focus-visible`)
- Color: never convey information through color alone (add text, icon, or pattern)
- Motion: respect `prefers-reduced-motion`
- State announcements: use `aria-live` regions for dynamic content changes

---

## Linting & Formatting

- **Linter:** ESLint (config in `eslint.config.js`)
- **Formatter:** Prettier (config in `.prettierrc`)
- **Pre-commit:** Run `npm run lint` and `npm run typecheck` before committing
- **CI:** Lint and typecheck run on every PR
- No `eslint-disable` — if you need it, document why in a comment
