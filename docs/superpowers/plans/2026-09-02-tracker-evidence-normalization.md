# Tracker Evidence Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or inline execution task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa checkbox và status trong tracker về tiến độ có evidence thực, sau đó tạo hàng đợi technical task đáng tin cậy.

**Architecture:** Audit tách thành ba review stream độc lập: requirements/contracts, backend/database/infrastructure và frontend/QA. Main agent chỉ hợp nhất kết quả, áp dụng status transition một lần và chạy integrity validation sau patch.

**Tech Stack:** Markdown, PowerShell, ripgrep, NestJS/Prisma/Next.js source và command evidence hiện có.

## Global Constraints

- Chỉ chỉnh `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md` và audit artifacts dưới `.superpowers/`.
- Không thay production source, API, schema, migrations, route, DTO hoặc business behavior.
- `[x][DONE]` bắt buộc có Evidence Registry row hợp lệ.
- Giữ nguyên `BLD-BE-BE-01`, `TST-BE-QA-01`, `IMPL-FE-QA-01`, `P1-PRISMA-BE-01` vì đã có `EV-20260902-001…004`.
- Không commit theo chỉ dẫn của người dùng.

---

### Task 1: Generate a mechanical tracker baseline

**Files:**

- Create: `.superpowers/tracker-normalization/baseline.md`
- Read: `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`

**Interfaces:**

- Produces: count by status, all checked task IDs, all Evidence IDs, and mismatch list.
- Consumer: review streams use this as fixed baseline rather than relying on current progress wording.

- [ ] Parse only checklist declarations matching `^- \[[ x]\] \``.
- [ ] Execute this read-only validation and place its output in baseline artifact:

```powershell
$lines = Get-Content DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md
$tasks = $lines | Where-Object { $_ -match '^- \[[ x]\] `' }
$tasks.Count
($tasks | Where-Object { $_ -match '^- \[x\]' }).Count
($tasks | Where-Object { $_ -match '\[BLOCKED\]' }).Count
($lines | Where-Object { $_ -match '^\| EV-' }).Count
```

- [ ] Verify RED condition: at least one checked task has no matching Evidence ID in the registry.
- [ ] Do not edit tracker in this task.

---

### Task 2: Independent evidence reviews

**Files:**

- Create: `.superpowers/tracker-normalization/contracts-review.md`
- Create: `.superpowers/tracker-normalization/backend-review.md`
- Create: `.superpowers/tracker-normalization/frontend-qa-review.md`
- Read: root documentation plus scoped source/artifacts.

**Interfaces:**

- Each reviewer emits lines in the exact form: `` `ATOM-ID` | KEEP_DONE / IN_PROGRESS / BLOCKED / READY | artifact or missing-evidence reason ``.
- Each reviewer only covers its assigned groups and never edits the tracker.

- [ ] Contracts reviewer covers `[C]` and `[D]` tasks, decision/contract artifacts and approved-source citations.
- [ ] Backend reviewer covers `[BE]` and `[I]` tasks, backend source, Prisma migrations, build/test artifacts and deployment topology.
- [ ] Frontend/QA reviewer covers `[FE]` and `[QA]` tasks, frontend source, lint/build/test evidence and environment blockers.
- [ ] Each reviewer must list every current `DONE` atom in its scope that lacks direct evidence and recommend a target status.
- [ ] A fourth reconciler checks the three reports for omitted IDs or contradictory recommendations.

---

### Task 3: Reconcile and normalize the tracker

**Files:**

- Modify: `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`
- Create: `.superpowers/tracker-normalization/reconciliation.md`

**Interfaces:**

- Consumes: baseline and three reviewer reports.
- Produces: valid checkbox/status pairs, evidence-backed DONE entries and updated baseline metrics.

- [ ] Preserve the four evidence-backed task entries and their Evidence IDs.
- [ ] For each reviewer recommendation, apply exactly one transition:

```text
checked DONE without evidence → unchecked IN_PROGRESS when an artifact exists but acceptance is unverified
checked DONE without evidence → unchecked BLOCKED when contract/dependency/environment is missing
unchecked task → READY only when every dependency has evidence-backed DONE
```

- [ ] Do not create evidence rows for unverified work.
- [ ] Update baseline counts and append an execution-log entry summarizing how many tasks moved to each status; link the reconciliation artifact.

---

### Task 4: Verify normalized progress and technical queue

**Files:**

- Modify: `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`
- Create: `.superpowers/tracker-normalization/final-validation.md`

**Interfaces:**

- Produces: a list of actual `READY` technical task IDs and reproducible integrity output.

- [ ] Run validation: unique declared IDs, unique Evidence IDs, checkbox/status alignment, and every DONE task references an existing Evidence ID.
- [ ] Confirm no production source changed during this normalization phase.
- [ ] Have an independent final reviewer inspect the reconciliation and validation artifacts.
- [ ] Mark this plan complete only after final reviewer passes; do not tick any application task merely from planning.
