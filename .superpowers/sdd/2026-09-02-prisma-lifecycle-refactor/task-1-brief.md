# Task 1 brief — Prisma lifecycle infrastructure

## Requirements

Create `backend/src/infrastructure/prisma/prisma.service.ts`, `prisma.module.ts`, and `prisma.service.spec.ts`; modify `backend/src/app.module.ts`.

`PrismaService` must extend `PrismaClient`, implement `OnModuleInit` and `OnModuleDestroy`, call `$connect()` during init and `$disconnect()` during destroy. `PrismaModule` must be `@Global()`, provide/export `PrismaService`, and be imported once by `AppModule` before feature modules. Relative imports use `.js`.

## TDD sequence

1. Create the lifecycle spec before production files.
2. Run `npx.cmd vitest run src/infrastructure/prisma/prisma.service.spec.ts` and capture expected RED caused by missing production module.
3. Implement the minimal service/module and register the module.
4. Re-run focused test and `npm.cmd run build`; both must pass.

## Test behavior

Instantiate the real `PrismaService`, spy/mock only its external `$connect`/`$disconnect` methods, call lifecycle hooks, and assert each external boundary is invoked once. The test must not connect to a real DB.

## Constraints

- No Prisma schema/migration/API/DTO/controller/route/business/queue changes.
- Do not edit consumers yet; those belong to Task 3.
- Do not edit tracker or plan.
- Do not commit.
- Write the full report to `.superpowers/sdd/2026-09-02-prisma-lifecycle-refactor/task-1-report.md`, including files, RED output, GREEN output, self-review, and concerns.
