---
trigger: always_on
---

# Security Rules

Menopause data is sensitive health information. Treat all symptom logs, stage data, and health insights as protected health data. These rules are mandatory — no exceptions.

---

## Authentication

- **Provider:** Auth.js (NextAuth.js) with JWT session strategy
- **Middleware:** `src/middleware.ts` protects `(auth)/*` route group — redirects unauthenticated users to `/auth/login`
- **Session storage:** JWT stored in HTTP-only, Secure, SameSite=Lax cookies
- **Session timeout:** 24 hours (configurable via `auth.ts`)
- **Password policy:** Minimum 8 characters; hashed with bcrypt (cost factor 12) — never stored in plain text
- **Account lockout:** 5 failed attempts → 15-minute cooldown (enforced at application level)
- **OAuth providers:** Google / GitHub OAuth scopes must be minimal (email, name only — no access to contacts, repos, etc.)

Routes requiring authentication:
- Dashboard (`/dashboard`)
- Symptom logs (`/symptoms/*`)
- Insights (`/insights/*`)
- Community participation (`/community/*`)
- User profile (`/profile/*`)
- Notifications (`/notifications/*`)

---

## Authorization (Row-Level Security)

Users can only access their own health records. Enforce this in every database query:

```typescript
// ✅ Correct — every service function filters by session userId
export async function getSymptomLogs(userId: string) {
  return prisma.symptomLog.findMany({
    where: { userId } // always filter by authenticated user
  })
}

// ❌ Never — no userId filter
export async function getSymptomLogs() { ... }
```

**Rules:**
- Every service function that returns user data **must** accept `userId` and filter by it
- Never accept a `userId` from client-side request body — derive it from the server-side session
- Server Actions call `auth()` to get the session; never trust client-supplied IDs
- API routes call `auth()` in the handler before processing

---

## Session & Cookie Security

| Setting | Value |
|---|---|
| `httpOnly` | `true` |
| `secure` | `true` (production) |
| `sameSite` | `lax` |
| `maxAge` | 24 hours |
| `path` | `/` |

Configuration in `src/lib/auth.ts`. Never expose session tokens to client-side JavaScript.

---

## CSRF Protection

- **Server Actions:** Protected by Next.js built-in CSRF via SameSite cookies (no additional action needed)
- **API Routes (Route Handlers):** Use custom CSRF token for state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`)
  - Generate token server-side, include in response
  - Client sends token in `X-CSRF-Token` header
  - Validate on the server before processing
- **CORS:** API routes that accept cross-origin requests (webhooks) must validate the `Origin` header against an allowlist

---

## Rate Limiting

Apply rate limiting to all state-changing endpoints:

| Endpoint | Limit | Window |
|---|---|---|
| Login attempts (per IP) | 5 | 15 minutes |
| Symptom log creation (per user) | 60 | 1 hour |
| Community post creation (per user) | 10 | 1 hour |
| Comment creation (per user) | 30 | 1 hour |
| AI insight requests (per user) | 20 | 1 hour |
| Profile updates (per user) | 10 | 1 hour |

Implementation via `lib/rate-limiter.ts` (in-memory for single instance; Redis for production).

---

## Security Headers

Applied in `next.config.js` via `headers()` function:

```typescript
// Required headers
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Encryption

- **In transit:** All traffic enforces HTTPS — redirect HTTP to 301 HTTPS (handled by Next.js/Vercel)
- **At rest:** Database encrypted at platform level (RDS / Azure DB encryption); sensitive columns (symptom notes) should use application-level encryption via `lib/encryption.ts`
- **API keys:** OpenAI key stored in environment variable, never in code or client-side bundles
- **Connection strings:** `DATABASE_URL` in environment variable only; never committed to version control

---

## GDPR & Data Privacy Compliance

- **Data retention:** Symptom logs retained for 3 years after last activity; user can request deletion at any time
- **Data export:** Users can download all their data as JSON from `/profile/export` — includes symptoms, insights, community posts
- **Account deletion:** `/profile/delete` deletes the user and all associated data within 48 hours
- **Right to be forgotten:** Deletion must cascade to all tables (`onDelete: Cascade` in Prisma schema)
- **Data Processing Agreement (DPA):** Required if using third-party processors (OpenAI, cloud provider)
- **Age gate:** Minimum age 18 enforced at registration

---

## Input Validation

- **Library:** Zod (all schemas in `features/*/validation.ts` or `lib/validation.ts`)
- **Forms:** Validate on client (instant feedback) and server (enforcement)
- **API requests:** Every Route Handler validates the request body with Zod before processing
- **Query parameters:** Validate `searchParams` with Zod in Server Components and API routes
- **Server Actions:** Validate input with Zod in the action before delegating to service
- **Sanitization:** All user-generated text (community posts, comments) is sanitized — strip HTML tags on server side
- **Output encoding:** React's JSX auto-escapes by default; for `dangerouslySetInnerHTML`, sanitize with DOMPurify on the server
- **SQL injection:** Prevented by Prisma's parameterized queries — never use `$queryRawUnsafe` with user input

---

## AI Safety

**AI must never:**
- Diagnose a medical condition
- Prescribe treatment or medication
- Recommend specific medications or dosages
- Claim to be a doctor or medical professional
- Provide emergency medical advice

**Every AI-generated health response must include:**
> "This information is educational and not medical advice."

**Prompt injection prevention:**
- System prompt is fixed and immutable (never modified by user input)
- User input is inserted into a template string, never concatenated directly
- Output is validated against safety rules before returning to the client
- Strip any PII (name, email, location, date of birth) from data sent to OpenAI — use only anonymized symptom data

**Implementation:**
- All OpenAI calls go through `integrations/openai/client.ts`
- Never import OpenAI SDK outside `integrations/openai/`
- Never call AI from Client Components — always via Server Actions
- Every AI response parsed and validated before returning to user

---

## Audit Logging

Log security events only — never log health data, PII, or session tokens.

**Events to log (via `lib/logger.ts`):**
- Successful login + user ID
- Failed login attempt + IP address (no password)
- Account deletion request
- Data export request
- Password change
- Community content report
- Rate limit exceeded (anonymized)

**Events never to log:**
- Symptom log contents or severity
- Stage identification results
- AI insight content
- User's email address, name, or date of birth
- Session tokens or JWT payloads

---

## Database Security

- **Prisma:** All queries use Prisma's parameterized query builder — no raw SQL with string interpolation
- **Connection pooling:** Use Prisma's built-in connection management; never open raw connections
- **Least privilege:** Database user has only the permissions needed (SELECT, INSERT, UPDATE, DELETE on app tables — no schema migrations in production)
- **Backups:** Automated daily backups with 30-day retention; encrypted at rest
- **Migrations:** Run via `prisma migrate deploy` in CI/CD — never manually

---

## API Security

- **CORS:** Only `NEXT_PUBLIC_APP_URL` is allowed for browser requests; webhook origins are allowlisted
- **API keys:** Never expose API keys to client-side code; access via `process.env` in server-only contexts
- **Webhook verification:** Incoming webhooks (if any) verify signature against a shared secret
- **Response headers:** Every API response includes `X-Content-Type-Options: nosniff`

---

## Dependency Security

- **Vulnerability scanning:** Run `npm audit` in CI — fail build on critical/moderate severity
- **Dependabot:** Enable automated pull requests for dependency updates
- **Pin versions:** Use exact versions in `package.json` (no `^` or `~`) for production dependencies
- **Review:** Manually review major version bumps before merging

---

## Community Protection

- **Content reporting:** Every post and comment has a "Report" button — sends notification to moderation system
- **Abuse prevention:** Rate-limited posting (see Rate Limiting section); automated keyword filtering for hate speech and harassment
- **Spam protection:** CAPTCHA on registration; URL detection in posts (flag new-user posts with links)
- **Moderation:** Reported content is hidden until reviewed; repeat offenders are suspended
- **Data minimization:** Community display name is optional; real name is never shown

---

## Incident Response

1. **Detection:** Monitor for unusual patterns (mass data access, failed login spikes, unexpected API errors)
2. **Containment:** Rotate all secrets (database credentials, API keys, Auth.js secret); suspend affected accounts
3. **Investigation:** Review audit logs (no health data accessed); determine scope of breach
4. **Notification:** Notify affected users within 72 hours per GDPR; document the incident in `.agents/decisions/`
5. **Remediation:** Fix the vulnerability; add regression test; update these security rules if needed

---

## OWASP & Security Testing

- **OWASP Top 10:** Review against all categories before production release
- **Penetration testing:** Conduct before major releases; document findings
- **Automated scanning:** Integrate `zap` or similar DAST tool in CI/CD pipeline
- **Dependency scanning:** `npm audit` + Snyk (or equivalent) in CI
- **Secret scanning:** Prevent committing secrets (use `.gitignore` + pre-commit hooks with `secretlint`)

---

## Environment & Secrets

- **`.env.example`:** Document all required environment variables with dummy values (never real secrets)
- **`.env`:** Never committed to version control — always in `.gitignore`
- **`NEXT_PUBLIC_*`:** Only non-sensitive values exposed to client — never API keys, tokens, or database URLs
- **Validation:** `lib/env.ts` validates all environment variables at startup using Zod — app fails to boot if required vars are missing
- **Secrets rotation:** Rotate `AUTH_SECRET`, `DATABASE_URL`, and `OPENAI_API_KEY` every 90 days
