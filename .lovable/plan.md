## Status check

Database check shows `pg_cron` and `pg_net` are **not yet enabled** (only `pg_stat_statements` and `pgcrypto` are installed). The "Query succeeded. No rows returned." message likely came from the roles-hardening migration (`20260531010000_harden_roles_and_definers.sql`), not the extensions migration.

## Plan

### 1. Verify / re-apply extensions migration
Re-run `20260531000000_enable_pg_cron.sql` so `pg_cron` and `pg_net` land in the `extensions` schema. On Lovable Cloud these must be enabled before any scheduling SQL will work.

### 2. New migration: schedule SEO cron jobs
Create `supabase/migrations/<ts>_schedule_seo_cron.sql` that uses `cron.schedule` + `net.http_post` to call the existing edge functions on a cadence, authenticated with the `SEO_CRON_SECRET` header:

| Job name | Schedule (UTC) | Function |
|---|---|---|
| `seo-tech-audit-daily` | `0 3 * * *` (03:00 daily) | `seo-tech-audit` |
| `seo-gsc-intelligence-daily` | `15 3 * * *` | `seo-gsc-intelligence` |
| `seo-programmatic-generate-weekly` | `0 4 * * 1` (Mon 04:00) | `seo-programmatic-generate` |
| `seo-blog-draft-weekly` | `30 4 * * 1` | `seo-blog-draft` |
| `indexnow-hourly` | `0 * * * *` | `indexnow` |

Each job posts to `https://mrjefpimgfzzjwoidocf.supabase.co/functions/v1/<fn>` with headers `Authorization: Bearer <SEO_CRON_SECRET>` and `Content-Type: application/json`, body `{}`.

The secret will be read from a Postgres setting written at migration time (so it isn't hardcoded). Approach:
```sql
-- store once in vault-style GUC (set via ALTER DATABASE … SET app.seo_cron_secret = '...')
-- then use current_setting('app.seo_cron_secret') in net.http_post headers
```
Because `ALTER DATABASE` is disallowed in migrations here, the migration will instead reference the secret via a SECURITY DEFINER helper `private.seo_cron_secret()` that returns the literal value. You will be prompted to confirm before the literal is written.

### 3. Verify edge functions accept the secret
Quick read of `seo-tech-audit`, `seo-gsc-intelligence`, `seo-programmatic-generate`, `seo-blog-draft`, `indexnow` to confirm each checks `Authorization: Bearer SEO_CRON_SECRET`. If any don't, add the guard in the same change.

### 4. Smoke test
After apply: `SELECT jobname, schedule, active FROM cron.job;` and trigger one job manually via `SELECT cron.schedule(...)` test, then check `cron.job_run_details` for HTTP 200.

## Open question
Do the schedules above match what you want, or should any job run more/less often (e.g. indexnow every 15 min, blog draft daily)?
