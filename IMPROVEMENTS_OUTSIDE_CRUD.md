# Improvements Outside CRUD Refactor Plan

Sorted by category and urgency. Items reference the code locations that motivate the change.

## Security + Privacy

### High
- Remove or gate debug telemetry and fetch interception (PII/session leakage risk, alters fetch behavior)
  - `src/components/ui/navbar.tsx:11`
  - `src/components/ui/navbar.tsx:29`
  - `src/components/providers/SessionProvider.tsx:14`
- Reduce production logging of PII (emails, roles, cookies, session objects)
  - `src/lib/auth.ts:31`
  - `src/app/login/page.tsx:22`
  - `src/app/auth/callback/route.ts:41`

### Medium
- Protect DB health endpoint or limit error detail in production
  - `src/app/api/health/database/route.ts`

## Data Correctness

### High
- Fix user-specific caching to prevent cross-user activity data leakage
  - `src/app/admin/dashboard/activity-content.tsx:7`

## Reliability + Abuse Prevention

### High
- Apply rate limiting to sensitive endpoints (login, password change, upload, recaptcha)
  - `src/lib/rate-limit.ts`
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `src/app/api/user/change-password/route.ts`
  - `src/app/api/upload/route.ts`
  - `src/app/api/verify-recaptcha/route.ts`

## Maintainability + DX

### Medium
- Move backup folder out of `src` or exclude from `tsconfig.json` to avoid typecheck/bundle churn
  - `src/back up  12 09 119pm/*`
  - `tsconfig.json`

### Low
- Remove unused import (reduce bundle noise)
  - `src/lib/cloudinary.ts:2`

## UX + Content Quality

### Medium
- Fix garbled characters in UI and logs
  - `src/app/admin/dashboard/activity-content.tsx:70`
  - `src/app/login/page.tsx:101`
  - `src/components/ui/navbar.tsx:191`
