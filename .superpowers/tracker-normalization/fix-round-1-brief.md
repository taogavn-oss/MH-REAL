# Fix round 1 — tracker summary reconciliation

## Scope

Modify only `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md` and `.superpowers/tracker-normalization/final-validation.md`. Do not change application source, tests, schema or migrations. Use `apply_patch`; do not commit.

## Required fixes

1. Replace the stale §1 baseline sentence with a current statement: workspace contains source, Prisma migration and tests, but tracker progress was normalized on 2026-09-02 and only evidence-backed atoms are DONE. Do not claim source is absent.
2. Set all eight phase-overview rows (Phase 0–7) to `BLOCKED`, because no phase exit condition has every required atom evidence-backed DONE.
3. In the Phase task registry:
   - change `P0-01`, `P0-02`, `P0-03` from `DONE` to `IN_PROGRESS` because documentation artifacts exist but no Evidence Registry row;
   - change every remaining phase task currently marked `DONE` (`P0-04…P7-01`) to `BLOCKED`, because its dependency/exit gate is not evidence-backed DONE.
   - Preserve pre-existing blocked phase rows as BLOCKED.
4. Update §12 and §15 summaries to the current verification state documented by the audit reports:
   - backend build PASS;
   - backend unit tests FAIL 7/24;
   - backend lint exit 0 with 12 warnings;
   - frontend lint FAIL 2 errors, 22 warnings;
   - frontend build PASS;
   - source has `backend/prisma/migrations/20260902150620_init/migration.sql`, but clean-PostgreSQL migration verification remains unproven.
5. Replace §15.1 wording that says source artifacts do not change status delivery with wording that says status is governed by evidence normalization. Replace outdated “backend build fail” and “no migration” table claims.
6. Update §15.2 verification rows to the same current results. Update §15.4 to list all four retained evidence-backed DONE atoms: `BLD-BE-BE-01`, `TST-BE-QA-01`, `IMPL-FE-QA-01`, `P1-PRISMA-BE-01`; state all other atoms remain IN_PROGRESS or BLOCKED after audit.
7. Append to `final-validation.md`: `READY = 0`, `Technical queue = empty`, and `Dependency-reference validation = incomplete; SCOPE-QA-01 remains BLOCKED`. This must not claim full dependency integrity.
8. Append an execution log row for this fix round, citing `.superpowers/tracker-normalization/final-validation.md` and the reconciliation report.

## Verification

Run the integrity validation from `final-validation.md`'s predecessor command: unique declared task IDs, unique evidence IDs, checkbox/status alignment and DONE evidence references. Confirm there are no `| ... | DONE |` phase-table rows left. Report exact commands/results in `.superpowers/tracker-normalization/fix-round-1-report.md`.
