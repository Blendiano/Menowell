# DB Migration Runner Skill

Use this skill when creating or reviewing Prisma database migrations.

**Tech:** Prisma ORM + PostgreSQL. All migrations live in `prisma/migrations/`.

---

## Prisma CLI Command Reference

| Command | When to Use | Environment |
|---|---|---|
| `npx prisma migrate dev --name <description>` | Create a new migration from schema changes | Development only |
| `npx prisma migrate dev --create-only` | Create empty migration file for custom SQL (data migrations) | Development only |
| `npx prisma migrate deploy` | Apply pending migrations — safe, no side effects | Staging, Production |
| `npx prisma migrate reset` | Drop + recreate DB from migrations — **destroys all data** | Development only |
| `npx prisma db push` | Push schema without creating a migration (prototyping) | Development only |
| `npx prisma generate` | Regenerate Prisma Client after schema changes | All environments |
| `npx prisma db seed` | Run `prisma/seed.ts` with test/development data | Development |
| `npx prisma migrate diff` | Compare two database schemas (for drift detection) | Any |
| `npx prisma db pull` | Introspect existing DB into Prisma schema (reverse-engineering) | Development |
| `npx prisma validate` | Validate the Prisma schema file | CI, Development |

---

## Migration Workflow

### Development
```
1. Edit schema.prisma           # Make schema changes
2. npx prisma migrate dev       # Creates migration, applies it, generates client
      --name add_symptom_type   # Provide a kebab-case description
3. Review the generated .sql    # Verify the SQL is correct
4. npx prisma generate          # Regenerate client (migrate dev does this automatically)
5. Run tests                    # Verify nothing broke
6. Commit migration folder + schema.prisma + generated client
```

### Staging / Preview
```
1. npx prisma migrate deploy    # Applies all pending migrations
2. Run integration tests         # Verify data integrity
3. Manual QA                     # Spot-check critical paths
```

### Production
```
1. Backup database               # Always — see Production Safety below
2. npx prisma migrate deploy     # Applies pending migrations
3. Verify application health     # Check error rates, data integrity
4. Monitor for issues            # Next 30 minutes post-deploy
```

---

## Health Data Rules (Mandatory)

These rules exist because this platform stores menopause health data. Violations are not acceptable:

- **Never drop a column** that contains symptom logs, stage data, or user health records — even if the application no longer reads it. Archive the column with a comment instead.
- **Never `DELETE` or `DROP`** in a migration without explicit approval in the risk assessment
- **Data migrations** (transforming existing health records) must be reviewed by two people before execution
- **Health data columns** must be `NOT NULL` or have a meaningful default — no accidental nulls in symptom severity, dates, or stage
- **User data** must always cascade on delete — `onDelete: Cascade` in all foreign keys referencing `User`
- **Add indexes** to any new column used in `WHERE`, `ORDER BY`, or `GROUP BY` on large tables (`SymptomLog`, `Insight`)

---

## Schema Change Review Checklist

Before creating a migration, audit every change against these criteria:

| Question | Why |
|---|---|
| Is the new column `nullable` or does it need a default? | Existing rows need a value |
| Does this affect existing API responses? | Frontend or mobile clients may break |
| Are there indexes on columns used in queries? | SymptomLog queries need `userId + date` indexes |
| Is the column truly required or can it wait? | Health data should never be rushed |
| Does a rename require a data migration? | Prisma doesn't auto-detect renames |
| Does a type change break existing data? | `String → Int` will fail if data isn't castable |
| Are foreign keys cascading correctly? | Deleting a user must cascade to all health records |
| Does this affect the Prisma Client API? | Old `prisma.symptomLog.findMany()` calls may break |
| Is there a sensitivity concern? | Health data columns need encryption consideration |

---

## Common Migration Patterns

### 1. Adding a Column (Safe)
```prisma
model SymptomLog {
  // new column — nullable so existing rows are unaffected
  durationMinutes Int?
}
```

### 2. Adding a Required Column (Needs Default)
```prisma
model SymptomLog {
  // existing rows get the default value
  timeOfDay String @default("afternoon")
}
```
Migration produces: `ALTER TABLE "SymptomLog" ADD COLUMN "timeOfDay" ... NOT NULL DEFAULT 'afternoon'`

### 3. Renaming a Column (Requires data migration)
Prisma cannot detect renames. Do this manually:

```prisma
model SymptomLog {
  // oldName: String   — commented out, never deleted
  newName   String     @map("new_name")
}
```

Then create a data migration:

```sql
-- In the migration .sql file, before Prisma applies schema changes:
ALTER TABLE "SymptomLog" RENAME COLUMN "old_name" TO "new_name";
```

**Or** use the two-step safe approach:
1. Add the new column (nullable)
2. Data migration: copy values from old to new column
3. Remove the old column (only after verifying data integrity in production)

### 4. Changing a Column Type
```sql
-- Wrap in a transaction:
ALTER TABLE "SymptomLog" ALTER COLUMN "severity" TYPE SMALLINT USING "severity"::integer;
```

### 5. Adding an Index
```prisma
model SymptomLog {
  userId    String
  date      DateTime
  @@index([userId, date])       -- for dashboard queries
  @@index([type, date])         -- for chart/analytics queries
}
```

---

## Data Migration Patterns

When a schema change needs existing data transformed, create an empty migration with `migrate dev --create-only` and add custom SQL:

```sql
-- migrations/20240601_backfill_symptom_type/migration.sql

-- Step 1: Add column as nullable
ALTER TABLE "SymptomLog" ADD COLUMN "category" TEXT;

-- Step 2: Backfill data
UPDATE "SymptomLog"
SET "category" = CASE
  WHEN "type" IN ('hot_flash', 'night_sweat') THEN 'temperature'
  WHEN "type" IN ('fatigue', 'insomnia') THEN 'energy'
  WHEN "type" IN ('anxiety', 'mood_swing') THEN 'mood'
  ELSE 'other'
END;

-- Step 3: Make column required
ALTER TABLE "SymptomLog" ALTER COLUMN "category" SET NOT NULL;
```

**Rules:**
- Always test data migrations against a production-sized copy first
- Batch large updates (`LIMIT 10000` per iteration) to avoid locking the table
- Run data migrations **before** deploying new application code (code first reads old + new format)

---

## Rollback Strategy

Prisma has no native `migrate rollback`. Instead, use one of these:

### Option 1: Revert with a new migration (preferred)
```sql
-- Create a new migration that reverses the previous one
ALTER TABLE "SymptomLog" DROP COLUMN "durationMinutes";
```

### Option 2: `prisma migrate diff` + manual apply
```bash
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script > rollback.sql
```
Review and apply the generated SQL manually.

### Option 3: Database restore
Restore from backup (see Production Safety) — last resort, only for catastrophic failures.

**Every migration must include a rollback plan in its risk assessment:**
> Rollback: Create inverse migration `revert_<description>` that reverses all changes.

---

## Production Safety

| Rule | Detail |
|---|---|
| **Backup first** | Run `pg_dump` or use cloud provider snapshot before any production migration |
| **Maintenance window** | Schedule migrations during lowest-traffic hours (e.g., 2-4 AM local) |
| **Connection draining** | Disable connection pooling before migration; re-enable after |
| **Readiness probe** | Verify app health endpoint returns 200 after migration completes |
| **Shadow database** | `prisma migrate dev` uses a shadow DB — ensure it's configured in `schema.prisma` |
| **Lock timeouts** | Large tables risk lock contention — set `statement_timeout` in PostgreSQL |
| **Zero-downtime** | For critical tables, use `CREATE TABLE ... AS SELECT` + rename pattern |
| **Safe deploy order** | Schema migration first → deploy new app code → data migration (if needed) |

---

## Testing Migrations

```
1. Restore a production-anonymized dump to staging
2. npx prisma migrate deploy
3. Run integration tests (health data queries, auth, community)
4. Verify row counts match pre-migration
5. Spot-check: query 10 random user records end-to-end
6. Test rollback: restore staging DB from pre-migration backup, re-run
```

Automate step 2-3 in CI/CD for staging deploys.

---

## CI/CD Integration

```yaml
# .github/workflows/deploy.yml (example)
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx prisma generate
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**Rules:**
- `prisma migrate deploy` is safe to run in CI — it only applies pending migrations, never creates new ones
- Never run `prisma migrate dev` or `prisma migrate reset` in CI
- Run `npx prisma validate` in CI to catch schema errors early

---

## Migration Conflicts

Two developers changing `schema.prisma` against the same baseline creates a migration history conflict.

```bash
# Detected by:
npx prisma migrate dev
# → Error: A migration history conflict has been detected

# Resolution:
npx prisma migrate resolve --applied <conflicting_migration_name>
# Then recreate your own migration
npx prisma migrate dev --name your_change
```

**Prevention:**
- Pull latest `main` before creating migrations
- Communicate schema changes via the team/agent decision log (`.agents/decisions/`)

---

## Schema Drift

When the database schema doesn't match the migration history:

```bash
# Detect drift:
npx prisma migrate diff --from-migrations prisma/migrations \
  --to-schema-datasource prisma/schema.prisma

# Resolve:
# Option A: Create a new migration to reconcile (preferred)
npx prisma migrate dev --name reconcile_drift

# Option B: Reset (dev only — destroys data)
npx prisma migrate reset
```

---

## Seeding

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create test users (anonymized, no real PII)
  // Create sample symptom logs across all stages
  // Create educational articles
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
```

Configure in `package.json`:
```json
{ "prisma": { "seed": "tsx prisma/seed.ts" } }
```

**Never seed production databases.** Seed data is for development and staging only.

---

## Risk Assessment Template

Every migration output must include a risk assessment:

```markdown
## Risk Assessment
- **Affected tables:** SymptomLog, User
- **Rows affected:** ~50,000 (SymptomLog)
- **Data loss risk:** None (additive change, nullable column)
- **Downtime required:** No
- **Rollback plan:** Create inverse migration `revert_add_duration`
- **Testing:** Verified against staging with 10K anonymized rows
- **Health data impact:** No existing health data modified
```

---

## Cross-References

- `architecture.md` — database entities, service layer, data flow
- `security.md` — encryption at rest, data retention, PII protection
- `code-style.md` — model naming (PascalCase), Prisma schema conventions
- `AGENTS.md` — Definition of Done, quality bar, health data rules
