# Task 3 Report — Inject Prisma into every application consumer

## RED baseline

The Task 3 brief records the pre-change boundary scan RED evidence: 15 application consumers directly imported and constructed `PrismaClient`.

## Files changed

### Application consumers

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

### Service specs

- `backend/src/modules/auth/auth.service.spec.ts`
- `backend/src/modules/candidates/candidates.service.spec.ts`
- `backend/src/modules/job-requirements/job-requirements.service.spec.ts`
- `backend/src/modules/notifications/notifications.service.spec.ts`
- `backend/src/modules/reminders/reminders.service.spec.ts`
- `backend/src/modules/rikuop-outbound/rikuop-outbound.service.spec.ts`
- `backend/src/modules/schedules/schedules.service.spec.ts`
- `backend/src/modules/slots/slots.service.spec.ts`
- `backend/src/modules/surveys/surveys.service.spec.ts`
- `backend/src/modules/tokens/tokens.service.spec.ts`

## Changes

- Removed direct `PrismaClient` imports and module-level `new PrismaClient()` construction from the 15 listed consumers.
- Imported `PrismaService` through `.js` relative paths, injected it into each class constructor, and changed only `prisma.` receivers to `this.prisma.`.
- Appended the injected dependency after existing service dependencies; worker processors inject it and call `super()`.
- Removed `@prisma/client` constructor interception from the ten affected service specs and supplied each Nest test module with `{ provide: PrismaService, useValue: prisma }`.
- Preserved query objects, transaction callbacks, return values, types/enums, and test behavior. No seed CLI, schema, migration, route, controller, DTO, queue behavior, Task 1 file, tracker, plan, or spec was changed.

## Verification

From `backend`:

| Command | Result |
| --- | --- |
| `npm.cmd test -- src/modules/auth/auth.service.spec.ts src/modules/candidates/candidates.service.spec.ts src/modules/job-requirements/job-requirements.service.spec.ts src/modules/notifications/notifications.service.spec.ts src/modules/reminders/reminders.service.spec.ts src/modules/rikuop-outbound/rikuop-outbound.service.spec.ts src/modules/schedules/schedules.service.spec.ts src/modules/slots/slots.service.spec.ts src/modules/surveys/surveys.service.spec.ts src/modules/tokens/tokens.service.spec.ts` | PASS — 10 files, 10 tests |
| `npm.cmd test` | PASS — 24 files, 24 tests |
| `npm.cmd run build` | PASS |
| `rg -n "new PrismaClient|PrismaClient" src` | PASS — only `src/infrastructure/prisma/prisma.service.ts:2` import and `:6` `extends PrismaClient` remain |

## Self-review

- Confirmed constructor injection in all 15 listed consumers, including `super()` in all three BullMQ processors.
- Confirmed all ten affected service specs use the injected `PrismaService` test double and contain no `vi.mock('@prisma/client', ...)` interception.
- Confirmed no direct `PrismaClient` construction remains under `backend/src` outside the global infrastructure service.

## Concerns

- Vitest emits an existing `vite-tsconfig-paths` deprecation warning; it does not affect this task's passing test results.
