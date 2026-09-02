# Batch A Preflight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or inline execution task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing application source buildable and lint-clean without changing any business contract or behavior.

**Architecture:** Keep the current NestJS/Next.js module structure. This batch only repairs compilation, test setup and static-analysis defects; it does not expose, add, remove or redefine an API operation, DTO field, state transition, token behavior, RikuOp mechanism, or database schema.

**Tech Stack:** NestJS 12, TypeScript ESM, Vitest 4, Next.js 16, React 19, ESLint.

## Global Constraints

- Source priority remains `Rakusai-System-Database-Design.md` over `RULE.md`.
- Do not implement a tracker atom marked `BLOCKED` in `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`.
- Do not modify Prisma schema, migrations, controllers, routes, DTO wire fields, business state transitions, token behavior, queue behavior or frontend business requests in this batch.
- Use `npm.cmd` from PowerShell because the environment blocks `npm.ps1`.
- Do not commit; the user explicitly deferred commits.

---

### Task 1: Backend ESM compilation repair

**Files:**

- Modify: backend source files that import a local TypeScript module without the ESM output extension.
- Test: backend build output.

**Interfaces:**

- Consumes: current `backend/tsconfig.json` and `backend/package.json` module settings.
- Produces: import specifiers resolvable by TypeScript and emitted Node ESM output.

- [x] Establish RED evidence by running `npm.cmd run build` and retain the TS2307 module-resolution result.
- [x] Add or update a focused static assertion that rejects extensionless relative imports in `backend/src` when the project uses Node ESM resolution.
- [x] Run the focused assertion and confirm it fails on the current source.
- [x] Change only the relative local module specifiers needed to make the assertion pass; preserve package imports and public route strings.
- [x] Run the focused assertion and `npm.cmd run build`; both must pass.

### Task 2: Backend test composition repair

**Files:**

- Modify: backend module test files under `backend/src/**/**.spec.ts`.
- Test: `npm.cmd test`.

**Interfaces:**

- Consumes: constructor dependencies in existing controllers/services.
- Produces: test modules whose providers/guards/queues are explicit and whose assertions execute a behavior rather than only checking construction.

- [x] Establish RED evidence by running `npm.cmd test` and retain the 16 failing dependency-resolution tests.
- [x] For each repaired test module, add the smallest provider or override required by its constructor dependency; queue and JWT dependencies are mocked only at the boundary.
- [x] Replace the `should be defined` assertion only where the test can exercise a safe existing behavior without changing contract.
- [x] Run each modified test file first, then `npm.cmd test`; all existing tests must pass.

### Task 3: Frontend lint repair

**Files:**

- Modify: frontend files reported as lint errors only.
- Test: `npm.cmd run lint` in `frontend`.

**Interfaces:**

- Consumes: current UI behavior and Next.js 16/React 19 lint rules.
- Produces: lint-clean source without changing business-request behavior.

- [x] Establish RED evidence by running `npm.cmd run lint` and retain the eight errors.
- [x] Read the relevant local Next.js 16 documentation before changing frontend source.
- [x] Replace unsafe TypeScript `any` with local structural error types; do not redefine API contract types.
- [x] Move render/effect violations into event or effect cleanup paths without changing visible business behavior.
- [x] Escape the reported JSX apostrophe and remove only unused imports/variables touched by error fixes.
- [x] Run `npm.cmd run lint` and require exit code 0.

### Task 4: Verification and tracking

**Files:**

- Modify: DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md.
- Test: build/test/lint commands from Tasks 1–3.

**Interfaces:**

- Consumes: command output and changed-file paths.
- Produces: checked tracker atoms only when their acceptance and evidence conditions are met.

- [x] Record command, result, timestamp and source/test paths in the evidence registry.
- [x] Mark `BLD-BE-BE-01`, `TST-BE-QA-01` and `IMPL-FE-QA-01` `DONE` only when their stated acceptance passes.
- [x] Leave all business atoms `BLOCKED`; record any remaining environment-only frontend build condition separately.
- [x] Recheck unique IDs, valid statuses and unchecked blocked tasks.
