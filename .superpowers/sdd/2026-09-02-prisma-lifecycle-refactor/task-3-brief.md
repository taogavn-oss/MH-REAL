# Task 3 brief — Inject Prisma into every application consumer

## Context and RED evidence

Task 1 provides the global `PrismaService` at `backend/src/infrastructure/prisma/prisma.service.ts`. Boundary scan RED evidence shows 15 application consumers still import/construct `PrismaClient` directly.

## Production scope

Modify exactly these consumers:

- `backend/src/common/guards/scope.guard.ts`
- `backend/src/common/interceptors/audit.interceptor.ts`
- `backend/src/workers/inactivity.processor.ts`
- `backend/src/workers/notification.processor.ts`
- `backend/src/workers/rikuop-outbound.processor.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/candidates/candidates.service.ts`
- `backend/src/modules/job-requirements/job-requirements.service.ts`
- `backend/src/modules/notifications/notifications.service.ts`
- `backend/src/modules/reminders/reminders.service.ts`
- `backend/src/modules/rikuop-outbound/rikuop-outbound.service.ts`
- `backend/src/modules/schedules/schedules.service.ts`
- `backend/src/modules/slots/slots.service.ts`
- `backend/src/modules/surveys/surveys.service.ts`
- `backend/src/modules/tokens/tokens.service.ts`

For each file: remove only `PrismaClient` from `@prisma/client` imports, remove the module-level `const prisma = new PrismaClient()`, import `PrismaService` through a `.js` relative path, inject it through the constructor, and replace only `prisma.` receivers with `this.prisma.`. Preserve query objects, transaction callbacks, return values, enums/types, error behavior and every non-wiring statement.

Constructor rules:

- Classes without dependencies receive `constructor(private readonly prisma: PrismaService) {}`.
- Append Prisma after existing dependencies for Auth, Notifications, Reminders, RikuopOutbound, Surveys and Tokens services.
- BullMQ processor constructors use `constructor(private readonly prisma: PrismaService) { super(); }`.

## Test scope

Update affected service specs for auth, candidates, job-requirements, notifications, reminders, rikuop-outbound, schedules, slots, surveys and tokens:

- remove module-level `vi.mock('@prisma/client', ...)` constructor interception;
- import `PrismaService` with `.js` path;
- provide `{ provide: PrismaService, useValue: prisma }` in Nest testing modules;
- preserve current behavior assertions and complete mock return structures;
- ensure no real DB/Redis/network connection occurs.

If common/worker classes have no existing tests, do not create business-behavior tests in this wiring-only task. Their DI resolution is covered by final build and reviewer inspection.

## Verification

Run focused affected specs first, then:

```powershell
npm.cmd test
npm.cmd run build
rg -n "new PrismaClient|PrismaClient" src
```

Expected: tests/build pass; final scan shows `PrismaClient` only in `src/infrastructure/prisma/prisma.service.ts` (two lines: import and extends). Do not change seed CLI.

## Constraints and report

- No schema/migration/API/DTO/controller/route/business/queue behavior change.
- Do not edit tracker, plan, spec or Task 1 files.
- Use apply_patch for edits.
- Do not commit.
- Write full report to `.superpowers/sdd/2026-09-02-prisma-lifecycle-refactor/task-3-report.md`: exact files, RED baseline reference, changes, commands/results, self-review, concerns.
