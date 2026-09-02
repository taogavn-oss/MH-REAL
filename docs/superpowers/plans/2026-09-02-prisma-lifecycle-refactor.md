# Prisma Lifecycle Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or inline execution task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn thành `P1-PRISMA-BE-01` bằng một Prisma client duy nhất do NestJS quản lý lifecycle và được inject vào mọi consumer trong `backend/src`.

**Architecture:** `PrismaService extends PrismaClient` là persistence boundary duy nhất trong application source. `PrismaModule` global cung cấp service ở composition root; service, guard, interceptor và BullMQ processor nhận dependency qua constructor injection, giữ nguyên toàn bộ Prisma queries và business behavior hiện tại.

**Tech Stack:** NestJS 12, TypeScript ESM, Prisma 6.19, Vitest 4.

## Global Constraints

- Nguồn task là atom `P1-PRISMA-BE-01` trong `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`.
- Không sửa Prisma schema, migration, API, DTO, controller, route, state transition, queue behavior hoặc logic nghiệp vụ.
- `backend/prisma/seed.ts` là CLI entry point ngoài NestJS lifecycle và không thuộc scope.
- Mọi relative TypeScript import trong `backend/src` phải dùng `.js` theo ESM strategy hiện tại.
- Không kết nối database, Redis hoặc network trong unit tests.
- Không commit theo chỉ dẫn hiện tại của người dùng.

---

### Task 1: Prisma lifecycle infrastructure

**Files:**

- Create: `backend/src/infrastructure/prisma/prisma.service.ts`
- Create: `backend/src/infrastructure/prisma/prisma.module.ts`
- Create: `backend/src/infrastructure/prisma/prisma.service.spec.ts`
- Modify: `backend/src/app.module.ts`

**Interfaces:**

- Produces: injectable `PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy`.
- Produces: global `PrismaModule` exporting `PrismaService`.
- Lifecycle: `onModuleInit(): Promise<void>` calls `$connect()`; `onModuleDestroy(): Promise<void>` calls `$disconnect()`.

- [x] **Step 1: Write the failing lifecycle test**

Create `backend/src/infrastructure/prisma/prisma.service.spec.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  it('connects on module initialization and disconnects on module destruction', async () => {
    const service = new PrismaService();
    const connect = vi.spyOn(service, '$connect').mockResolvedValue();
    const disconnect = vi.spyOn(service, '$disconnect').mockResolvedValue();

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(connect).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run from `backend`:

```powershell
npx.cmd vitest run src/infrastructure/prisma/prisma.service.spec.ts
```

Expected: FAIL because `prisma.service.ts` does not exist.

- [x] **Step 3: Implement `PrismaService`**

Create `backend/src/infrastructure/prisma/prisma.service.ts`:

```ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

- [x] **Step 4: Implement the global module and register it at the composition root**

Create `backend/src/infrastructure/prisma/prisma.module.ts`:

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

In `backend/src/app.module.ts`, import `PrismaModule` from `./infrastructure/prisma/prisma.module.js` and add it once to the `imports` array before feature modules.

- [x] **Step 5: Verify GREEN**

Run:

```powershell
npx.cmd vitest run src/infrastructure/prisma/prisma.service.spec.ts
npm.cmd run build
```

Expected: lifecycle test PASS and Nest build PASS.

---

### Task 2: Capture persistence-boundary RED evidence

**Files:**

- Modify: every production consumer listed in Task 3.

**Interfaces:**

- Consumes: `PrismaService` from Task 1.
- Produces: recorded verification evidence showing the exact application files that violate the approved persistence boundary before refactor.

- [x] **Step 1: Run the boundary scan and record RED evidence**

Run:

```powershell
rg -n "new PrismaClient|PrismaClient" src
```

Expected before refactor: output lists the current service, guard, interceptor and processor files that directly import or construct `PrismaClient`. This is verification evidence, not a source-text unit test, per the user-approved testing-policy resolution on 2026-09-02.

---

### Task 3: Inject Prisma into every application consumer

**Files:**

- Modify: `backend/src/common/guards/scope.guard.ts`
- Modify: `backend/src/common/interceptors/audit.interceptor.ts`
- Modify: `backend/src/workers/inactivity.processor.ts`
- Modify: `backend/src/workers/notification.processor.ts`
- Modify: `backend/src/workers/rikuop-outbound.processor.ts`
- Modify: `backend/src/modules/auth/auth.service.ts`
- Modify: `backend/src/modules/candidates/candidates.service.ts`
- Modify: `backend/src/modules/job-requirements/job-requirements.service.ts`
- Modify: `backend/src/modules/notifications/notifications.service.ts`
- Modify: `backend/src/modules/reminders/reminders.service.ts`
- Modify: `backend/src/modules/rikuop-outbound/rikuop-outbound.service.ts`
- Modify: `backend/src/modules/schedules/schedules.service.ts`
- Modify: `backend/src/modules/slots/slots.service.ts`
- Modify: `backend/src/modules/surveys/surveys.service.ts`
- Modify: `backend/src/modules/tokens/tokens.service.ts`
- Modify: corresponding service specs under `backend/src/modules/**`.

**Interfaces:**

- Consumes: global `PrismaService` provider.
- Constructor rule: preserve existing dependency order and append `private readonly prisma: PrismaService`; classes without a constructor receive one.
- Worker rule: constructors call `super()` before returning.
- Query rule: replace only `prisma.` with `this.prisma.`; preserve all query objects, transaction callbacks, return values and error behavior.

- [x] **Step 1: Refactor guard and interceptor**

Remove the `PrismaClient` import and module-level client. Import `PrismaService` with the correct `.js` relative path, add `constructor(private readonly prisma: PrismaService) {}`, and replace query access with `this.prisma` in:

```text
src/common/guards/scope.guard.ts
src/common/interceptors/audit.interceptor.ts
```

- [x] **Step 2: Refactor BullMQ processors**

For each processor, import `PrismaService`, remove the module-level client and add:

```ts
constructor(private readonly prisma: PrismaService) {
  super();
}
```

Apply to:

```text
src/workers/inactivity.processor.ts
src/workers/notification.processor.ts
src/workers/rikuop-outbound.processor.ts
```

Replace only database receiver expressions with `this.prisma`.

- [x] **Step 3: Refactor services without existing constructor dependencies**

Add `constructor(private readonly prisma: PrismaService) {}` and replace only the Prisma receiver in:

```text
src/modules/candidates/candidates.service.ts
src/modules/job-requirements/job-requirements.service.ts
src/modules/schedules/schedules.service.ts
src/modules/slots/slots.service.ts
```

Keep Prisma enum/type imports such as `Prisma` and `InterviewType`; remove only `PrismaClient` from those imports.

- [x] **Step 4: Refactor services with existing constructor dependencies**

Append `private readonly prisma: PrismaService` to these constructors:

```text
AuthService(JwtService, PrismaService)
NotificationsService(Queue, PrismaService)
RemindersService(NotificationsService, PrismaService)
RikuopOutboundService(Queue, PrismaService)
SurveysService(TokensService, SchedulesService, PrismaService)
TokensService(Queue, PrismaService)
```

Replace only database receiver expressions with `this.prisma` and keep every other statement unchanged.

- [x] **Step 5: Update unit-test composition**

In each affected service spec:

- remove `vi.mock('@prisma/client', ...)` used to intercept module-level construction;
- import `PrismaService` using the correct `.js` path;
- add `{ provide: PrismaService, useValue: prisma }` to `providers`;
- preserve existing behavior assertion and mock return values.

At minimum update specs for auth, candidates, job-requirements, notifications, reminders, rikuop-outbound, schedules, slots, surveys and tokens.

- [x] **Step 6: Verify the boundary and affected unit tests GREEN**

Run:

```powershell
npx.cmd vitest run src/infrastructure/prisma/prisma.service.spec.ts
npm.cmd test
```

Expected: lifecycle focused test and full backend suite PASS without DB, Redis or network calls; the final Task 4 scan enforces the boundary as delivery evidence.

---

### Task 4: Final verification, independent review and tracker evidence

**Files:**

- Modify after review: `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`
- Modify after verification: this plan file, checking completed steps.

**Interfaces:**

- Consumes: complete implementation and verification output.
- Produces: evidence row and `[x][DONE]` only if every acceptance condition passes.

- [x] **Step 1: Run final backend verification**

Run from `backend`:

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run lint
rg -n "new PrismaClient|PrismaClient" src
```

Expected: build/test/lint exit 0; `rg` finds `PrismaClient` only in `src/infrastructure/prisma/prisma.service.ts`.

- [x] **Step 2: Independent review**

Reviewer verifies:

- no API/schema/business/queue behavior change;
- all 15 application consumers use constructor injection;
- Prisma lifecycle is centralized;
- tests use provider mocks and perform no external connection;
- architecture test excludes only the intended infrastructure file.

- [x] **Step 3: Update evidence and task status**

Add one evidence row containing changed source/test paths, exact command results, date and verifier. Change only `P1-PRISMA-BE-01` from `[ ][BLOCKED]` to `[x][DONE]` after confirming its declared dependencies remain `DONE`. Append the status change to the execution log.

- [x] **Step 4: Validate tracker integrity**

Verify declared task IDs remain unique, checked tasks have `DONE`, unchecked tasks are not `DONE`, and all unrelated business atoms remain unchanged.
