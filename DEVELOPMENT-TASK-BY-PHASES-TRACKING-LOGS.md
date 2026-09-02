# DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md

## 1. Mục đích và baseline

Theo dõi implementation Rakusai theo dependency và evidence. Workspace hiện có application source, Prisma migration và automated tests; tracker progress đã được evidence-normalize ngày 2026-09-02 và chỉ các atom có Evidence Registry hợp lệ mới ở trạng thái `DONE`.

Nguồn ưu tiên: `Rakusai-System-Database-Design.md` > `RULE.md` > hai Draw.io. Nội dung nguồn thấp hơn chỉ áp dụng khi không mâu thuẫn.

## 2. Namespace và trạng thái canonical

| Loại | Namespace | Ví dụ |
|---|---|---|
| Phase task | `P<phase>-<nn>` | `P4-08` |
| Endpoint có method/path từ nguồn | `EP-<nnn>` | `EP-008` |
| API work package chưa có endpoint contract | `WP-API-<nnn>` | `WP-API-010` |
| Technical work package | `<group>-<nn>` | `OPT-01` |
| Issue ở file khác | `<FILE>::<ID>` | `ISSUES::API-006` |
| Atomic checklist | `<package>-<C|D|BE|I|FE|QA>-<nn>` | `EP-008-C-01` |
| Phase gate | `P<n>` | `P0` = mọi required phase task `DONE` |
| Package gate | `EP-<nnn>`, `WP-API-<nnn>` hoặc technical group | `OPT` = mọi required atom của package `DONE` |
| Category gate | `<package>::<tag>[+<tag>]` | `EP-001::BE+FE` = mọi required BE/FE atom `DONE` |

Không dùng bare `API-###` trong file này. Endpoint `EP-001…012` map theo thứ tự tới registry `API-001…012` trong `API-CONTRACT.md`; issue phải có prefix `ISSUES::`.

| Status | Ý nghĩa |
|---|---|
| `BLOCKED` | Có hard dependency chưa `DONE` hoặc thiếu external decision |
| `READY` | Mọi hard dependency đã `DONE`, chưa bắt đầu |
| `IN_PROGRESS` | Có artifact nhưng chưa đạt acceptance |
| `DONE` | Acceptance pass, evidence hợp lệ, dependency đều `DONE` |
| `STALE` | Evidence từng hợp lệ nhưng upstream contract đã đổi/reopen |

Invariant:

- `[x]` khi và chỉ khi status là `DONE` và có Evidence ID hợp lệ.
- Task `[BE]`, `[FE]`, `[I]`, `[QA]` bị block cho tới mọi `[C]`/`[D]` bắt buộc của package hoàn tất.
- Contract reopen làm downstream `DONE → STALE`, checkbox quay về `[x]`, evidence cũ giữ lại với `Invalidated by`.
- Endpoint ở maturity `ILLUSTRATIVE` chưa mở khóa implementation; chỉ `APPROVED` mới mở gate.
- Không tick phase `DONE` bằng tỷ lệ trung bình; phải đạt exit condition.

## 3. Tổng quan phase

| Phase | Nội dung | Exit condition | Status |
|---|---|---|---|
| 0 | Requirement, decisions, API/schema freeze | Namespace rõ; contract/schema blockers có decision | BLOCKED |
| 1 | Platform foundation | Web/API/PostgreSQL/Redis/worker foundation chạy được | BLOCKED |
| 2 | Identity, Audit, Master Data | Auth/RBAC/scope/audit/import đạt test | BLOCKED |
| 3 | Recruitment Requirement | Versioned approval + history đạt transition/race tests | BLOCKED |
| 4 | Candidate Engagement và RikuOp intake | Intake/token/survey/screening đạt contract tests | BLOCKED |
| 5 | Scheduling và Matching | Availability/preference/booking đạt race/scope tests | BLOCKED |
| 6 | Notification, Reminder, RikuOp outbound | Delivery/sync idempotent và observable | BLOCKED |
| 7 | Hardening, deployment, release | E2E/security/operability pass; cutover được xác nhận | BLOCKED |

## 4. Phase task registry

### Phase 0 — Contract và decision baseline

| ID | Task | Dependencies | Deliverable/Acceptance | Status |
|---|---|---|---|---|
| P0-01 | Source precedence | User confirmation | Design canonical; mobile/RikuOp conflicts recorded | IN_PROGRESS |
| P0-02 | Documentation baseline | Current sources | 9 root documents + plan/spec, traceable, no invented contract | IN_PROGRESS |
| P0-03 | Namespace migration toàn bộ docs | `NS-*` | Endpoint/issue/work-package IDs unique, all references resolve | IN_PROGRESS |
| P0-04 | API contract freeze | All `ISSUES::API-*`, API decision packages | Approved OpenAPI/envelope/error/auth/state/token/sequencing | BLOCKED |
| P0-05 | Logical schema freeze | `DB-*`, `OPT`, `RVO`, `SSI`, `ERD`, `PII` | Approved schema/invariant/cardinality matrix | BLOCKED |
| P0-06 | Async consistency freeze | `NTF`, `AUD`, `WRK`, `IMP`, `REM` | Atomicity, durability, worker ownership được duyệt | BLOCKED |

### Phase 1 — Platform foundation

| ID | Task | Dependencies | Deliverable/Acceptance | Status |
|---|---|---|---|---|
| P1-01 | Next.js App Router Web v16+ | P0 | Environment-driven Web; không mock business state | BLOCKED |
| P1-02 | NestJS DDD API | P0 | Bounded contexts; Domain không phụ thuộc Nest/Prisma/BullMQ | BLOCKED |
| P1-03 | PostgreSQL/Prisma | P0-05 | Migration khớp approved logical schema | BLOCKED |
| P1-04 | Redis/BullMQ | P0-06, WRK | 5 queue registrations và worker topology | BLOCKED |
| P1-05 | Docker Compose local | P1-01…04 | Web/API/DB/Redis/workers + health pass | BLOCKED |
| P1-06 | Global API conventions | P0-04 | `/api/v1`, OpenAPI, envelope, errors, validation | BLOCKED |
| P1-07 | Security/observability | AUT, PII | Route classes, guards, rate limits, redaction, request ID | BLOCKED |

### Phase 2 — Identity, Audit và Master Data

| ID | Task | Dependencies | Deliverable/Acceptance | Status |
|---|---|---|---|---|
| P2-01 | Roles/users persistence | P1-03 | Unique role/user identifiers và active/inactive tests | BLOCKED |
| P2-02 | Login/session/password reset | `ISSUES::API-003`, EP-001, WP-API-001, AUTH | Salted hash, token/session contract, reset replay tests | BLOCKED |
| P2-03 | RolesGuard/ScopeGuard | AUT, P2-01 | HQ/AM/SM/Sub-SM + IDOR matrix pass | BLOCKED |
| P2-04 | Audit trail | AUD, PII | Transaction/failure policy, mutation coverage, GET exclusion | BLOCKED |
| P2-05 | New Store Setup/manager assignment | `ISSUES::DB-004`, WP-API-002 | Create Store + valid manager assignment; không suy delete/Area CRUD | BLOCKED |
| P2-06 | Master import/export | `ISSUES::OPN-005`, `ISSUES::OPN-006`, IMP | Durable file, row results, account provisioning + email | BLOCKED |

### Phase 3 — Recruitment Requirement

| ID | Task | Dependencies | Deliverable/Acceptance | Status |
|---|---|---|---|---|
| P3-01 | Aggregate/version persistence | RVO, OPT, P1-03 | Store+channel unique; current/published integrity | BLOCKED |
| P3-02 | Draft create/edit | P3-01, OPT | Partial Draft, immutable version, stale edit conflict | BLOCKED |
| P3-03 | Submit/approve/reject | P3-01, EP-003…005 | Design §3.3 canonical; HQ reject → rejected; edit mới về draft | BLOCKED |
| P3-04 | List/filter/export | EP-002, WP-API-004, `ISSUES::OPN-004` | Scope/filter/current-vs-published correct | BLOCKED |
| P3-05 | Requirement import | `ISSUES::OPN-005`, IMP | Chỉ mở sau approved file contract | BLOCKED |
| P3-06 | Approval history read model/UI | WP-API-013, P3-01/P3-03 | Immutable history đúng version/order/actor/scope | BLOCKED |

### Phase 4 — Candidate Engagement và RikuOp intake

| ID | Task | Dependencies | Deliverable/Acceptance | Status |
|---|---|---|---|---|
| P4-01 | Candidate intake normalization | `ISSUES::DB-006`, PII | RikuOp/manual intake dùng chung normalization | BLOCKED |
| P4-02 | Blacklist | `ISSUES::DB-007`, WP-API-007 | HQ-only fields/matching contract và tests | BLOCKED |
| P4-03 | Duplicate detection | Approved matching rules | Deterministic phone/email/composite tests | BLOCKED |
| P4-04 | Token lifecycle | WP-API-014, `ISSUES::API-006` | Purpose/TTL/consume/rotation matrix + tests | BLOCKED |
| P4-05 | Survey submission và screening | WP-API-012, EP-008/009 | Không gộp preference trước server pass outcome | BLOCKED |
| P4-06 | RikuOp inbound | EP-011, `ISSUES::OPN-010`, `ISSUES::API-007` | Conditional webhook hoặc polling sau sign-off | BLOCKED |
| P4-07 | No-response +5 ngày | NTF, WRK | Cancel khi submit; due job idempotent + sync | BLOCKED |
| P4-08 | HQ manual registration/assignment | WP-API-010, P4-02/P4-03 | HQ-only UI/API, audit, dedupe/blacklist reuse | BLOCKED |

### Phase 5 — Scheduling và Matching

| ID | Task | Dependencies | Deliverable/Acceptance | Status |
|---|---|---|---|---|
| P5-01 | Slot create/update/cancel | SSI, OPT, WP-API-005 | Past/overlap/cross-store/booked guards | BLOCKED |
| P5-02 | HQ timeline | WP-API-005, `ISSUES::OPN-002` | Date/Area/Store/Manager filtering + pagination | BLOCKED |
| P5-03 | Candidate availability/preference | WP-API-011/012/014 | Pass-only safe slots, 36h boundary, ranked choices | BLOCKED |
| P5-04 | Transactional booking | SSI, OPT, EP-007 | Row lock, unique schedule, race winner/loser | BLOCKED |
| P5-05 | Automatic matching | P5-03/P5-04, `ISSUES::DB-001` | Priority order; no-slot adjustment state | BLOCKED |
| P5-06 | Reschedule/cancel/complete/result | WP-API-006, SSI | State/scope/audit/notification/RikuOp effects | BLOCKED |

### Phase 6 — Notification, Reminder và RikuOp outbound

| ID | Task | Dependencies | Deliverable/Acceptance | Status |
|---|---|---|---|---|
| P6-01 | Notification outbox/worker | NTF, WRK, PII | No lost delivery; bounded retry; observable failure | BLOCKED |
| P6-02 | Requirement notifications | P3-03, NTF | Chỉ event có nguồn: submit→AM, AM approve→HQ, AM reject→SM/Sub-SM | BLOCKED |
| P6-03 | Approval/edit reminders | REM, `ISSUES::OPN-007` | +3d/daily/stop semantics + occurrence idempotency | BLOCKED |
| P6-04 | Candidate schedule notifications | NTF, P5 | Immediate event + T-24h; cancelled suppressed | BLOCKED |
| P6-05 | Account-provision email | P2-06, NTF | Chỉ account mới; retry không duplicate; failure visible | BLOCKED |
| P6-06 | RikuOp outbound | `ISSUES::API-007`, WRK, PII | Approved mapping, retry/backoff, sync log | BLOCKED |

### Phase 7 — Hardening và release

| ID | Task | Dependencies | Deliverable/Acceptance | Status |
|---|---|---|---|---|
| P7-01 | Security matrix | AUT, PII, P2…P6 | IDOR/token/input/PII evidence | BLOCKED |
| P7-02 | Concurrency/fault injection | OPT, RVO, SSI, NTF, AUD | No lost update/double booking/half commit | BLOCKED |
| P7-03 | E2E smoke flow | P2…P6 | HQ→SM→AM→HQ→Candidate→SM→Candidate pass | BLOCKED |
| P7-04 | Staging | STG, WRK, IMP | Approved topology + reproducible deploy/restart tests | BLOCKED |
| P7-05 | Production | Approved provider/topology | AWS/Web/DB/Redis/workers/secrets ready | BLOCKED |
| P7-06 | Cutover | `ISSUES::OPN-008` | Client-approved runbook/date/readiness | BLOCKED |

## 5. API delivery checklist

### 5.1 Package order và global gates

| Order | Group | Hard gate |
|---:|---|---|
| 00 | Naming/envelope/error/time | Approved global OpenAPI conventions |
| 10 | Auth/reset | Global + auth decisions |
| 20 | Master Data | Global + schema/import format |
| 30 | Recruitment | Global + version/state/concurrency |
| 40 | Candidate | Global + public DTO/token/sequencing |
| 50 | Scheduling | Global + state/overlap/conflict |
| 60 | Notification | Event/recipient/idempotency/outbox |
| 70 | RikuOp | Final sign-off + inbound mechanism |
| 90 | Health | Route classification + health contract |

- [ ] `GLB-C-01` **[C][BLOCKED]** Chốt JSON naming, enum wire values, null/omit rules; depends on `ISSUES::API-001` và `ISSUES::API-002`; evidence: approved OpenAPI version.
- [ ] `GLB-C-02` **[C][BLOCKED]** Chốt envelope, pagination meta và error catalog; depends on `ISSUES::API-001` và `ISSUES::API-004`.
- [ ] `GLB-C-03` **[C][IN_PROGRESS]** Chốt auth transport, expiry/refresh và reset contract; không coi lock threshold/duration là đã xác định.
- [ ] `GLB-C-04` **[C][IN_PROGRESS]** Chốt date/time wire format với Asia/Tokyo business time và UTC persistence.
- [ ] `GLB-BE-01` **[BE][IN_PROGRESS]** Implement `/api/v1`, OpenAPI, validation pipe, response/error interceptors; depends on GLB-C-01…04.
- [ ] `GLB-BE-02` **[BE][IN_PROGRESS]** Implement request ID, route guards/rate limits và sensitive-data redaction; depends on AUT/PII.
- [ ] `GLB-FE-01` **[FE][IN_PROGRESS]** Generate client/types từ approved OpenAPI và parse envelope tập trung; depends on GLB-C-01…04.
- [ ] `GLB-QA-01` **[QA][BLOCKED]** Contract parity test cho prefix/envelope/error/validation/request ID; depends on GLB-BE-01/02.

### 5.2 Endpoint checklist đã có nguồn

#### EP-001 — `POST /api/v1/auth/login`

- [ ] `EP-001-C-01` **[C][BLOCKED]** Chốt `login_id` mapping, body, session/JWT response; depends on GLB-C-03.
- [ ] `EP-001-BE-01` **[BE][IN_PROGRESS]** Test và implement valid/invalid/inactive login, salted hash, `last_login_at`, no credential log; depends on EP-001-C-01.
- [ ] `EP-001-FE-01` **[FE][IN_PROGRESS]** Form/schema, session handling và role dashboard redirect; không Role Switcher; depends on EP-001-C-01/GLB-FE-01.
- [ ] `EP-001-QA-01` **[QA][IN_PROGRESS]** E2E bốn role, wrong attempts và policy khi vượt giới hạn sau khi policy được duyệt; depends on EP-001::BE+FE.

#### EP-002 — `GET /api/v1/job-requirements?storeId=&status=`

- [ ] `EP-002-C-01` **[C][BLOCKED]** Chốt item DTO, meta, page/pageSize/sort/filter/state wire values.
- [ ] `EP-002-BE-01` **[BE][IN_PROGRESS]** Scoped query HQ/AM/SM/Sub-SM, allowlist filter/sort, current/published mapping; depends on EP-002-C-01.
- [ ] `EP-002-FE-01` **[FE][IN_PROGRESS]** Query key + list/filter/pagination/loading/empty/error bằng API thật; depends on EP-002-C-01.
- [ ] `EP-002-QA-01` **[QA][IN_PROGRESS]** Pagination/filter/empty/IDOR tests; depends on EP-002::BE+FE.

#### EP-003 — `POST /api/v1/job-requirements/:id/submit`

- [ ] `EP-003-C-01` **[C][BLOCKED]** Chốt concurrency token/body/response; depends on OPT.
- [ ] `EP-003-BE-01` **[BE][IN_PROGRESS]** Draft validation, transaction, submit action, AM-managed Store special case; depends on EP-003-C-01/RVO.
- [ ] `EP-003-FE-01` **[FE][IN_PROGRESS]** Gửi token, chống double-click, field errors và conflict refetch; depends on EP-003-C-01.
- [ ] `EP-003-QA-01` **[QA][BLOCKED]** SM/Sub-SM/AM branches, incomplete Draft, stale/repeated submit; depends on EP-003::BE+FE.

#### EP-004 — `POST /api/v1/job-requirements/:id/approve`

- [ ] `EP-004-C-01` **[C][BLOCKED]** Chốt body/token/response và role-state dispatch; Design §3.3 canonical.
- [ ] `EP-004-BE-01` **[BE][IN_PROGRESS]** AM chỉ pending_am/own Area; HQ chỉ pending_hq; publish pointer update atomically; depends on EP-004-C-01/RVO/OPT.
- [ ] `EP-004-FE-01` **[FE][BLOCKED]** Action theo role/state, invalidate list/detail/history, xử lý 403/conflict.
- [ ] `EP-004-QA-01` **[QA][BLOCKED]** Transition/wrong-role/wrong-area/stale/repeat tests.

#### EP-005 — `POST /api/v1/job-requirements/:id/reject`

- [ ] `EP-005-C-01` **[C][BLOCKED]** Chốt `rejection_reason`/`comment`, token, response; Design canonical HQ reject → rejected.
- [ ] `EP-005-BE-01` **[BE][IN_PROGRESS]** State/scope + trimmed mandatory comment + immutable action; depends on EP-005-C-01/RVO/OPT.
- [ ] `EP-005-BE-02` **[BE][BLOCKED]** Chỉ enqueue email khi AM reject theo notification matrix; HQ-reject notification chờ requirement riêng.
- [ ] `EP-005-FE-01` **[FE][BLOCKED]** Reject UI validation, mutation, invalidate list/detail/history.
- [ ] `EP-005-QA-01` **[QA][BLOCKED]** Blank/wrong-state/scope, HQ reject→rejected, edit→draft; không implicit pending_hq→pending_am.

#### EP-006 — `GET /api/v1/stores/:storeId/slots?date=`

- [ ] `EP-006-C-01` **[C][BLOCKED]** Chốt internal slot DTO/date/range/pagination; không mặc định expose `closed`.
- [ ] `EP-006-BE-01` **[BE][IN_PROGRESS]** HQ/assigned manager scope, Asia/Tokyo date query; depends on EP-006-C-01/SSI.
- [ ] `EP-006-FE-01` **[FE][IN_PROGRESS]** Internal calendar query/loading/empty/error; không dùng cho Candidate.
- [ ] `EP-006-QA-01` **[QA][IN_PROGRESS]** Scope/timezone/large-result tests.

#### EP-007 — `POST /api/v1/slots/:id/book`

- [ ] `EP-007-C-01` **[C][BLOCKED]** Chốt candidate ID, token/version, response và conflict code; depends on OPT/SSI.
- [ ] `EP-007-BE-01` **[BE][IN_PROGRESS]** Row-lock transaction: verify open → create schedule → book slot → commit.
- [ ] `EP-007-BE-02` **[BE][BLOCKED]** Enqueue notification/RikuOp effect sau atomic handoff đã duyệt; depends on NTF.
- [ ] `EP-007-FE-01` **[FE][BLOCKED]** Send version, no premature optimistic booking, conflict refetch.
- [ ] `EP-007-QA-01` **[QA][IN_PROGRESS]** Winner/loser race, cross-Store conflict, scope và retry tests.

#### EP-008 — `GET /api/v1/public/survey/:token`

- [ ] `EP-008-C-01` **[C][BLOCKED]** Chốt survey-only safe DTO và survey/expired/preparing/paused discriminators; result không thuộc EP này.
- [ ] `EP-008-BE-01` **[BE][IN_PROGRESS]** Hash lookup, expiry/purpose/state/isolation/rate limit; không mặc định GET consume token; depends on WP-API-014.
- [ ] `EP-008-FE-01` **[FE][IN_PROGRESS]** Token route và server-driven branches; không decode/log/query-param simulation.
- [ ] `EP-008-QA-01` **[QA][IN_PROGRESS]** Brute force, expiry, cross-purpose/isolation và minimal-data tests.

#### EP-009 — `POST /api/v1/public/survey/:token`

- [ ] `EP-009-C-01` **[C][BLOCKED]** Chốt survey answer DTO/result/consume point; preference không gộp trước WP-API-012 decision.
- [ ] `EP-009-BE-01` **[BE][IN_PROGRESS]** Revalidate token, persist survey once, screen theo published requirement; depends on EP-009-C-01/WP-API-012/WP-API-014.
- [ ] `EP-009-BE-02` **[BE][IN_PROGRESS]** Candidate fail không sang preference; không enqueue matching trước preference completion.
- [ ] `EP-009-FE-01` **[FE][IN_PROGRESS]** Form/zod/car notice/double-submit và authoritative outcome.
- [ ] `EP-009-QA-01` **[QA][IN_PROGRESS]** Pass/fail/replay/double-submit/blacklist/duplicate branches.

#### EP-010 — `POST /api/v1/master-data/import`

- [ ] `EP-010-C-01` **[C][BLOCKED]** Chốt file template/multipart/limits/row semantics; depends on `ISSUES::OPN-005`, `ISSUES::OPN-006` và IMP.
- [ ] `EP-010-BE-01` **[BE][BLOCKED]** HQ upload → durable reference → import-run/queue, validation và row results.
- [ ] `EP-010-BE-02` **[BE][BLOCKED]** Account mới emit provision-email occurrence sau commit; existing account không emit lại; depends on NTF.
- [ ] `EP-010-FE-01` **[FE][BLOCKED]** HQ upload + run status + row errors theo contract.
- [ ] `EP-010-QA-01` **[QA][IN_PROGRESS]** File errors, restart/cross-worker, duplicate delivery, account email idempotency.

#### EP-011 — RikuOp inbound mechanism conditional

Registry hiện minh họa `POST /api/v1/integrations/rikuop/candidates`; webhook hay polling chưa được chốt.

- [ ] `EP-011-C-01` **[C][BLOCKED]** RikuOp sign-off: chọn webhook/polling, auth, payload, acknowledgement/checkpoint, retry/idempotency.
- [ ] `EP-011-BE-01` **[BE][IN_PROGRESS]** Nếu webhook: thin validated controller enqueue inbound work; depends on decision chọn webhook.
- [ ] `EP-011-BE-02` **[BE][BLOCKED]** Nếu polling: poller/cursor/checkpoint; không giữ webhook endpoint như fact; depends on decision chọn polling.
- [ ] `EP-011-BE-03` **[BE][IN_PROGRESS]** Anti-corruption mapping, dedupe/blacklist, sync log/redaction; depends on EP-011-C-01/PII/WRK.
- [ ] `EP-011-FE-01` **[FE][BLOCKED]** Không gọi RikuOp trực tiếp; FE deliverable chỉ có nếu monitoring contract/UX được duyệt.
- [ ] `EP-011-QA-01` **[QA][IN_PROGRESS]** Selected mechanism, redelivery/checkpoint, drift, retry exhaustion, no duplicate effects.

#### EP-012 — `GET /api/v1/health`

- [ ] `EP-012-C-01` **[C][BLOCKED]** Chốt auth exposure, liveness/readiness và minimal response; depends on AUT/STG.
- [ ] `EP-012-BE-01` **[BE][BLOCKED]** DB/Redis/dependency checks không lộ secret/detail nhạy cảm.
- [ ] `EP-012-FE-01` **[FE][BLOCKED]** Không dùng làm business-data source; UI chỉ sau requirement riêng.
- [ ] `EP-012-QA-01` **[QA][BLOCKED]** Docker/staging/production probe behavior.

### 5.3 API work packages chưa có method/path/DTO được duyệt

Không tạo endpoint từ các heading dưới đây. `[C]` phải publish operation vào OpenAPI trước `[BE]/[FE]/[QA]`.

#### WP-API-001 — Forgot/Reset Password

- [ ] `WP-API-001-C-01` **[C][BLOCKED]** Chốt request/consume operations, privacy response, TTL, one-time use và password rules.
- [ ] `WP-API-001-BE-01` **[BE][BLOCKED]** Token issue/hash/expiry/consume + email dispatch; depends on WP-API-001-C-01/NTF/AUTH.
- [ ] `WP-API-001-FE-01` **[FE][BLOCKED]** Request/reset screens theo generated contract, không tiết lộ email tồn tại.
- [ ] `WP-API-001-QA-01` **[QA][IN_PROGRESS]** Request→reset→login; expired/replay rejected.

#### WP-API-002 — New Store Setup và Manager Assignment

- [ ] `WP-API-002-C-01` **[C][BLOCKED]** Chốt create Store + assign SM/Sub-SM operation; standalone Area/Store update/delete ngoài phạm vi khi chưa xác nhận.
- [ ] `WP-API-002-BE-01` **[BE][BLOCKED]** HQ-only create, Area required, unique code, valid role, primary-SM invariant.
- [ ] `WP-API-002-FE-01` **[FE][BLOCKED]** HQ setup/assignment form bằng API thật.
- [ ] `WP-API-002-QA-01` **[QA][BLOCKED]** Duplicate/missing Area/invalid role/non-HQ/invariant tests.

#### WP-API-003 — Master Export và Import Run Status

- [ ] `WP-API-003-C-01` **[C][BLOCKED]** Chốt export content/file contract và import-run detail/status/error DTO.
- [ ] `WP-API-003-BE-01` **[BE][BLOCKED]** HQ export từ DB + query import results; depends on IMP.
- [ ] `WP-API-003-FE-01` **[FE][IN_PROGRESS]** Download và run-result UI, không reconstruct export client-side.
- [ ] `WP-API-003-QA-01` **[QA][BLOCKED]** Scope/encoding/empty export/row-error tests.

#### WP-API-004 — Requirement Draft/Create/Detail/Edit/Export/Import

- [ ] `WP-API-004-C-01` **[C][BLOCKED]** Chốt operation set, JSONB payload schema, required-on-submit và concurrency token; import chờ ISSUES::OPN-005.
- [ ] `WP-API-004-BE-01` **[BE][IN_PROGRESS]** Partial Draft + immutable version + approved-edit giữ published pointer; depends on OPT/RVO.
- [ ] `WP-API-004-FE-01` **[FE][IN_PROGRESS]** Create/edit/detail/version/conflict UI; import/export chỉ sau file contract.
- [ ] `WP-API-004-QA-01` **[QA][BLOCKED]** Store+channel unique, stale edit, current/published separation.

#### WP-API-005 — Slot Mutation và HQ Timeline

- [ ] `WP-API-005-C-01` **[C][BLOCKED]** Chốt create/update/cancel operation, cancel state mapping, overlap error và timeline filters.
- [ ] `WP-API-005-BE-01` **[BE][IN_PROGRESS]** Past/overlap/cross-Store/booked guards + HQ timeline; depends on SSI/OPT.
- [ ] `WP-API-005-FE-01` **[FE][IN_PROGRESS]** Manager calendar + HQ timeline; UX chờ `ISSUES::OPN-002` và `ISSUES::OPN-003`.
- [ ] `WP-API-005-QA-01` **[QA][IN_PROGRESS]** Interval overlap, manager multi-Store, booked cancel, pagination.

#### WP-API-006 — Schedule Lifecycle và Candidate Result

- [ ] `WP-API-006-C-01` **[C][BLOCKED]** Chốt detail/change/cancel/complete/result operations, transitions, location DTO và result-safe DTO; depends on WP-API-014.
- [ ] `WP-API-006-BE-01` **[BE][BLOCKED]** Scope/state/audit + URL/onsite location validation; depends on SSI/AUD.
- [ ] `WP-API-006-FE-01` **[FE][IN_PROGRESS]** Internal adjustment + token result screens; không query-param pass/fail.
- [ ] `WP-API-006-QA-01` **[QA][IN_PROGRESS]** Online/onsite/fail, pre-submit denial, completed-cancel denial, side effects.

#### WP-API-007 — Blacklist và Candidate/Duplicate Review

- [ ] `WP-API-007-C-01` **[C][BLOCKED]** Chốt blacklist fields/matching sau ISSUES::DB-007 và safe candidate list/detail scope.
- [ ] `WP-API-007-BE-01` **[BE][IN_PROGRESS]** HQ blacklist operations + normalized matching + scoped candidate queries.
- [ ] `WP-API-007-FE-01` **[FE][IN_PROGRESS]** HQ blacklist/duplicate review với server pagination/filter.
- [ ] `WP-API-007-QA-01` **[QA][IN_PROGRESS]** Matching normalization/false-positive/PII/non-HQ tests.

#### WP-API-008 — Notification Failure Monitoring

- [ ] `WP-API-008-C-01` **[C][BLOCKED]** Chốt HQ read/filter contract cho scheduled/sent/failed; manual retry không thuộc scope khi chưa xác nhận.
- [ ] `WP-API-008-BE-01` **[BE][BLOCKED]** HQ-only failed query + masked payload; depends on NTF/PII.
- [ ] `WP-API-008-FE-01` **[FE][IN_PROGRESS]** Failed notification view theo contract.
- [ ] `WP-API-008-QA-01` **[QA][IN_PROGRESS]** Exhausted failure visibility, worker idempotency, masking.

#### WP-API-009 — RikuOp Outbound và Sync Log

- [ ] `WP-API-009-C-01` **[C][BLOCKED]** Chốt outbound mapping; sync-log UI chỉ khi monitoring requirement được duyệt.
- [ ] `WP-API-009-BE-01` **[BE][IN_PROGRESS]** Status/memo/interview adapter + bounded retry + sanitized log; depends on sign-off/WRK/PII.
- [ ] `WP-API-009-FE-01` **[FE][IN_PROGRESS]** Không gọi RikuOp trực tiếp; monitoring chỉ sau approved contract.
- [ ] `WP-API-009-QA-01` **[QA][IN_PROGRESS]** Mapping/transient retry/drift/no duplicate external effect.

#### WP-API-010 — HQ Manual Candidate Registration/Assignment

- [ ] `WP-API-010-C-01` **[C][BLOCKED]** Chốt register/assign/reassign boundaries, initial state, fields, outcomes và side effects; đóng ISSUES::DB-006.
- [ ] `WP-API-010-BE-01` **[BE][IN_PROGRESS]** HQ-only intake reuse normalization/dedupe/blacklist, audit và idempotency.
- [ ] `WP-API-010-FE-01` **[FE][IN_PROGRESS]** HQ registration/review/assignment UI từ generated types.
- [ ] `WP-API-010-QA-01` **[QA][IN_PROGRESS]** Manual→assignment flow, non-HQ denial, no fake RikuOp ID/duplicate effect.

#### WP-API-011 — Candidate-safe Availability và Preference

- [ ] `WP-API-011-C-01` **[C][BLOCKED]** Chốt operation/auth/DTO, eligible state, date range, empty/stale semantics và 36h boundary; không reuse EP-006 ngầm.
- [ ] `WP-API-011-BE-01` **[BE][BLOCKED]** Chỉ open slots đúng candidate/Store; không lộ booked candidate/internal manager/note; token purpose revalidated.
- [ ] `WP-API-011-FE-01` **[FE][IN_PROGRESS]** Candidate UI chỉ dùng safe contract và server-authoritative availability.
- [ ] `WP-API-011-QA-01` **[QA][BLOCKED]** Wrong token/Store/state, 36h/timezone, booked/closed leakage, race recovery.

#### WP-API-012 — Survey → Screening → Preference Sequencing

- [ ] `WP-API-012-C-01` **[C][BLOCKED]** Chốt atomic/staged flow, transition matrix, `preferred_dates` nullability/persistence và operation boundary.
- [ ] `WP-API-012-BE-01` **[BE][IN_PROGRESS]** Persist survey once; failed không lấy/gửi preference; matching chỉ sau preference completion.
- [ ] `WP-API-012-FE-01` **[FE][IN_PROGRESS]** Render outcome authoritative; không request preference trước pass.
- [ ] `WP-API-012-QA-01` **[QA][IN_PROGRESS]** Fail/pass/no-slot/double-submit/timeout/concurrent slot change.

#### WP-API-013 — Approval History

- [ ] `WP-API-013-C-01` **[C][BLOCKED]** Chốt embed/query operation, DTO/order/pagination/scope và AM self-approval representation.
- [ ] `WP-API-013-BE-01` **[BE][IN_PROGRESS]** Version-linked deterministic read model; actions append-only.
- [ ] `WP-API-013-FE-01` **[FE][IN_PROGRESS]** History theo version từ API, không suy từ current status/audit log.
- [ ] `WP-API-013-QA-01` **[QA][BLOCKED]** Reject/edit/resubmit/self-approval/order/IDOR tests.

#### WP-API-014 — Candidate Token Lifecycle

- [ ] `WP-API-014-C-01` **[C][BLOCKED]** Matrix từng purpose: issuer, action/screen, state, TTL, reuse, consume, rotation/revocation, post-consume behavior.
- [ ] `WP-API-014-BE-01` **[BE][IN_PROGRESS]** Hash-only lookup, atomic consume đúng event; GET không mặc định consume; cross-purpose blocked.
- [ ] `WP-API-014-FE-01` **[FE][IN_PROGRESS]** Không decode/log/analytics token; không reuse credential ngoài contract.
- [ ] `WP-API-014-QA-01` **[QA][IN_PROGRESS]** Refresh/multi-tab/concurrent consume/expired/revoked/replay/result access tests.

### 5.4 Frontend actionable decomposition

Các atom dưới đây tách nhỏ deliverable `[FE]` tổng hợp ở trên. Chúng không tạo operation, route, field, enum, màn hình hoặc copy mới. Evidence bắt buộc gồm OpenAPI/schema hash áp dụng, component/hook/schema/test path, command và kết quả test; task responsive phải ghi viewport đã kiểm tra.

#### Frontend foundation

- [ ] `GLB-FE-02` **[FE][IN_PROGRESS]** Tạo application shell: HQ PC-first; AM/SM/Sub-SM mobile-first và vẫn dùng được trên PC; không Role Switcher. Depends on P1-01, GLB-FE-01 và approved auth/role contract. Acceptance: bốn role render đúng shell ở smartphone/PC.
- [ ] `GLB-FE-03` **[FE][IN_PROGRESS]** Route boundary theo authenticated actor/role cho unauthenticated, expired session, 403 và route ngoài role; FE guard không thay BE authorization. Depends on AUT-D-01…03 và auth session contract. Acceptance: navigation matrix bốn role pass.
- [ ] `GLB-FE-04` **[FE][IN_PROGRESS]** Một lớp duy nhất unwrap success envelope và normalized error; không suy `data`, `meta`, `details` khi nullability chưa khóa. Depends on GLB-C-01/02 và GLB-FE-01. Acceptance: approved success/error fixtures parse hoặc reject xác định.
- [ ] `GLB-FE-05` **[FE][BLOCKED]** Centralize nhập, render và query business date theo Asia/Tokyo, độc lập timezone máy client. Depends on GLB-C-04. Acceptance: cùng instant cho cùng kết quả JST trên các timezone giả lập.
- [ ] `GLB-FE-06` **[FE][IN_PROGRESS]** Chuẩn hóa query key, loading, refreshing, empty, normalized error và invalidation; business state chỉ lấy từ REST API thật. Depends on GLB-FE-01 và approved list/error contract. Acceptance: cache key/filter/invalidation tests pass.
- [ ] `GLB-FE-07` **[FE][IN_PROGRESS]** Cấm log, analytics hoặc persist plaintext password, magic token và authorization data; cấm query-param giả business state. Depends on PII-D-01…03 và WP-API-014-C-01. Acceptance: static scan và browser storage/log sentinel test pass.

#### Frontend cho endpoint đã có nguồn

- [ ] `EP-001-FE-02` **[FE][IN_PROGRESS]** Login form chỉ serialize body fields đã duyệt; password không xuất hiện trong log/toast. Depends on EP-001-C-01. Acceptance: form validation và request serialization pass.
- [ ] `EP-001-FE-03` **[FE][IN_PROGRESS]** Khởi tạo phiên và redirect theo role server trả về; không cho chọn role. Depends on approved auth transport/role response. Acceptance: HQ/AM/SM/Sub-SM vào đúng dashboard; role không hỗ trợ fail closed.
- [ ] `EP-001-FE-04` **[FE][IN_PROGRESS]** Render invalid credential, inactive, expired session và rate-limit theo approved error code; không tự đặt threshold/duration. Depends on GLB-C-02/03. Acceptance: error fixture tests pass.
- [ ] `EP-002-FE-02` **[FE][IN_PROGRESS]** Requirement list dùng server pagination/sort/filter với wire names đã duyệt; có loading/empty/error/refetch. Depends on EP-002-C-01. Acceptance: request-param và pagination tests pass.
- [ ] `EP-002-FE-03` **[FE][IN_PROGRESS]** Render Store, channel, approval state và current/published distinction chỉ từ DTO. Depends on approved item DTO/RVO. Acceptance: representative DTO rendering pass.
- [ ] `EP-002-FE-04` **[FE][BLOCKED]** Chỉ hiện action theo role/state response và vẫn xử lý 403 khi UI stale; không suy dashboard/list split khi ISSUES::OPN-004 mở. Depends on role/action contract. Acceptance: role-state matrix pass.
- [ ] `EP-003-FE-02` **[FE][IN_PROGRESS]** Submit concurrency token đã đọc, khóa double-click, map field errors và xử lý conflict bằng refetch theo policy. Depends on EP-003-C-01 và OPT-D-02. Acceptance: repeated-click/stale-version tests pass.
- [ ] `EP-004-FE-02` **[FE][BLOCKED]** Approve chỉ mở cho AM/HQ ở state hợp lệ; success invalidate list/detail/history; xử lý 403/invalid-transition/conflict. Depends on EP-004-C-01. Acceptance: AM/HQ transition UI tests pass.
- [ ] `EP-005-FE-02` **[FE][BLOCKED]** Reject form dùng đúng wire field, trim và cấm all-whitespace; success invalidate list/detail/history. Depends on EP-005-C-01. Acceptance: serialization/blank/error tests pass.
- [ ] `EP-006-FE-02` **[FE][IN_PROGRESS]** Internal calendar query theo Store/date contract, render server status; không reuse response cho Candidate. Depends on EP-006-C-01 và SSI-D-01/02. Acceptance: date query/loading/empty/error tests pass.
- [ ] `EP-007-FE-02` **[FE][BLOCKED]** Booking gửi candidate identifier/version đúng contract; không optimistic booked trước commit; conflict refetch availability/schedule. Depends on EP-007-C-01, OPT-D-02, SSI-D-02. Acceptance: winner/loser simulation pass.
- [ ] `EP-008-FE-02` **[FE][IN_PROGRESS]** Public resolver render đúng discriminator survey/expired/preparing/paused, không suy từ DB/publish fields. Depends on EP-008-C-01. Acceptance: branch/minimal-data fixture tests pass.
- [ ] `EP-008-FE-03` **[FE][IN_PROGRESS]** Token là opaque path credential; không decode, client-store, analytics hoặc error report. Depends on WP-API-014-C-01 và PII. Acceptance: storage/log/network-metadata sentinel test pass.
- [ ] `EP-009-FE-02` **[FE][IN_PROGRESS]** Survey form chỉ dùng approved fields, server-driven car notice, loading/field errors và double-submit guard. Depends on EP-009-C-01. Acceptance: schema/serialization tests pass.
- [ ] `EP-009-FE-03` **[FE][IN_PROGRESS]** Sau submit chỉ render authoritative outcome; Failed không sang preference, Passed mới chuyển bước theo contract. Depends on WP-API-012-C-01. Acceptance: pass/fail/replay orchestration tests pass.
- [ ] `EP-010-FE-02` **[FE][BLOCKED]** HQ upload đúng multipart field/type/size; client validation chỉ hỗ trợ UX, server authoritative. Depends on EP-010-C-01 và IMP-D-01…03. Acceptance: request construction/invalid-file tests pass.
- [ ] `EP-010-FE-03` **[FE][BLOCKED]** Render import-run summary và per-row failure đúng DTO; không tự suy rollback/partial-success. Depends on approved import-run response. Acceptance: success/partial/failure fixtures pass.

#### Frontend cho API work package chưa có operation contract

- [ ] `WP-API-001-FE-02` **[FE][BLOCKED]** Request-reset screen dùng operation được duyệt và neutral outcome theo anti-enumeration contract; không tự đặt endpoint/TTL. Acceptance: known/unknown response parity pass.
- [ ] `WP-API-001-FE-03` **[FE][BLOCKED]** Reset screen validate password theo approved policy; render expired/used/invalid token từ catalog; không persist token. Depends on reset consume contract. Acceptance: expiry/replay/form tests pass.
- [ ] `WP-API-002-FE-02` **[FE][BLOCKED]** HQ Store form chỉ có approved DTO fields; không thêm Store type/recruitment deadline từ nguồn thấp hơn. Depends on WP-API-002-C-01 và ISSUES::DB-004. Acceptance: generated-form serialization pass.
- [ ] `WP-API-002-FE-03` **[FE][BLOCKED]** Assignment UI lấy eligible SM/Sub-SM từ API và biểu diễn đúng một primary SM sau khi invariant khóa; xử lý 403/invalid-role/stale. Depends on approved lookup/assignment contract. Acceptance: assignment invariant tests pass.
- [ ] `WP-API-003-FE-02` **[FE][IN_PROGRESS]** Download artifact do BE tạo; không reconstruct export từ client list/cache. Depends on WP-API-003-C-01. Acceptance: download metadata/content-disposition contract test pass.
- [ ] `WP-API-003-FE-03` **[FE][BLOCKED]** Theo dõi import run/row results theo server; refresh/polling chỉ dùng cadence/terminal states đã duyệt. Depends on IMP và run query contract. Acceptance: in-progress/success/failure/reload tests pass.
- [ ] `WP-API-004-FE-02` **[FE][IN_PROGRESS]** Editor phân biệt partial Draft save với full Submit validation; payload chỉ từ approved schema. Depends on WP-API-004-C-01, RVO, OPT. Acceptance: incomplete-save và incomplete-submit tests pass.
- [ ] `WP-API-004-FE-03` **[FE][BLOCKED]** Render current draft/review và published version theo API pointers; không merge client-side. Depends on RVO-D-01/02. Acceptance: published-remains-stable fixture pass.
- [ ] `WP-API-004-FE-04` **[FE][IN_PROGRESS]** Stale edit bảo toàn input và chỉ đưa lựa chọn reload/merge/discard theo policy được duyệt; không blind retry. Depends on OPT-D-02. Acceptance: two-tab conflict test pass.
- [ ] `WP-API-004-FE-05` **[FE][IN_PROGRESS]** Requirement import/export UI chỉ mở sau approved operations/file format; không suy columns từ JSONB. Depends on ISSUES::OPN-005. Acceptance: template-version compatibility pass.
- [ ] `WP-API-005-FE-02` **[FE][IN_PROGRESS]** Calendar smartphone cho SM/Sub-SM và PC fallback, JST, API thật; interaction chi tiết phụ thuộc reference design. Depends on WP-API-005-C-01 và ISSUES::OPN-003. Acceptance: touch/PC viewport/date tests pass.
- [ ] `WP-API-005-FE-03` **[FE][IN_PROGRESS]** Create/edit/close-or-cancel slot validate non-past/start-end và render overlap/server conflict; không tự đặt cancel state. Depends on `ISSUES::DB-002`, `ISSUES::DB-003`, OPT và SSI. Acceptance: past/interval/conflict tests pass.
- [ ] `WP-API-005-FE-04` **[FE][IN_PROGRESS]** HQ timeline PC-first với server filters date/Area/Store/Manager và pagination; không tải hết rồi lọc client. Depends on timeline contract và ISSUES::OPN-001. Acceptance: filter/request/large-result fixture pass.
- [ ] `WP-API-005-FE-05` **[FE][BLOCKED]** Khi Store có nhiều manager, HQ chọn responsible SM theo contract; không mặc định primary/first item. Depends on ISSUES::OPN-002. Acceptance: multi-manager selection test pass.
- [ ] `WP-API-006-FE-02` **[FE][BLOCKED]** Adjustment list/detail chỉ render authoritative adjustment state; không tạo mutation button khi operation chưa khóa. Depends on lifecycle contract và ISSUES::DB-001. Acceptance: state/scope rendering pass.
- [ ] `WP-API-006-FE-03` **[FE][IN_PROGRESS]** Schedule actions theo role/state, conflict recovery và invalidate slot/schedule/candidate data; không suy side effects. Depends on lifecycle contract/SSI. Acceptance: lifecycle matrix pass.
- [ ] `WP-API-006-FE-04` **[FE][BLOCKED]** Candidate result: online pass dùng approved URL/instruction; onsite pass dùng approved address/instruction; failed render rejection; pending không lộ result. Depends on candidate-safe result/token contract. Acceptance: four-branch isolation pass.
- [ ] `WP-API-007-FE-02` **[FE][IN_PROGRESS]** HQ blacklist list/form chỉ dùng approved fields; không thêm Kanji/Kana/DOB/secondary email từ RULE.md trước resolution. Depends on WP-API-007-C-01 và ISSUES::DB-007. Acceptance: field parity/non-HQ denial pass.
- [ ] `WP-API-007-FE-03` **[FE][BLOCKED]** HQ duplicate review dùng server pagination/filter, masked DTO và server-authoritative flags. Depends on safe list/detail contract và PII. Acceptance: masking/empty/filter/403 tests pass.
- [ ] `WP-API-008-FE-02` **[FE][IN_PROGRESS]** HQ notification-failure view chỉ đọc/filter states đã duyệt, masked payload/error; không thêm manual retry. Depends on WP-API-008-C-01, PII, NTF. Acceptance: terminal failure/masking tests pass.
- [ ] `WP-API-010-FE-02` **[FE][IN_PROGRESS]** HQ manual registration chỉ dùng approved fields/initial state; không fake RikuOp ID; render dedupe/blacklist outcome từ server. Depends on WP-API-010-C-01, `ISSUES::DB-006` và `ISSUES::DB-007`. Acceptance: serialization/outcome/non-HQ tests pass.
- [ ] `WP-API-010-FE-03` **[FE][BLOCKED]** HQ assign/reassign Candidate bằng scoped API data; render server outcome và xử lý stale/invalid target. Depends on assign/reassign contract. Acceptance: assignment conflict tests pass.
- [ ] `WP-API-011-FE-02` **[FE][IN_PROGRESS]** Chỉ gọi candidate-safe availability sau Passed; không lộ manager note/booked candidate/internal field ngoài DTO. Depends on WP-API-011-C-01/token purpose. Acceptance: safe-field/state-gate tests pass.
- [ ] `WP-API-011-FE-03` **[FE][IN_PROGRESS]** Cho chọn tối đa ba lựa chọn có thứ tự, không trùng, serialize approved shape; không tự đặt field names. Depends on approved preference DTO. Acceptance: rank/reorder/duplicate/max-count tests pass.
- [ ] `WP-API-011-FE-04` **[FE][IN_PROGRESS]** Dùng server-authoritative 36h eligibility; stale/booked slot thì refetch/reselect; no-slot theo adjustment contract. Depends on empty/stale/conflict contract. Acceptance: 36h JST/stale-slot tests pass.
- [ ] `WP-API-012-FE-02` **[FE][IN_PROGRESS]** Orchestrate resolve survey → submit → screening → preference → matching/result; reload/multi-tab phục hồi từ server state, không URL query. Depends on WP-API-012-C-01 và SRCCTL-D-02/03. Acceptance: full state-machine E2E pass.
- [ ] `WP-API-013-FE-02` **[FE][IN_PROGRESS]** Render history đúng version/order/actor/action/comment từ read model; self-approval theo approved representation. Depends on WP-API-013-C-01/RVO. Acceptance: reject/edit/resubmit/self-approval order pass.
- [ ] `WP-API-014-FE-02` **[FE][IN_PROGRESS]** Shared public token boundary xử lý invalid/expired/revoked/consumed/cross-purpose từ server; refresh/multi-tab không tự giả định consume. Depends on WP-API-014-C-01. Acceptance: lifecycle/storage/log matrix pass.
- [ ] `OPT-FE-02` **[FE][IN_PROGRESS]** Shared conflict handler phân biệt validation/authorization/conflict, invalidate đúng query và không retry mù. Depends on OPT-D-01/02 và global error contract. Acceptance: requirement/slot deterministic conflict tests pass.

### 5.5 Backend actionable decomposition

Các atom dưới đây tách controller/application/domain/repository/transaction/async/error boundaries của deliverable `[BE]` tổng hợp. Không atom nào cho phép tạo route/method/field/state mới trước contract. Evidence bắt buộc gồm source/test paths, command/result, OpenAPI version/hash và migration version khi đụng persistence.

#### Backend foundation

- [ ] `GLB-BE-03` **[BE][IN_PROGRESS]** Tạo module boundary/application ports cho bảy bounded contexts; Domain không import NestJS, Prisma, BullMQ/provider SDK. Depends on P1-02. Acceptance: dependency-rule test pass.
- [ ] `GLB-BE-04` **[BE][IN_PROGRESS]** DTO validation/transform/whitelist tập trung theo OpenAPI; reject unknown/invalid input bằng normalized error. Depends on GLB-C-01/02. Acceptance: body/query/path contract tests và mass-assignment negative tests pass.
- [ ] `GLB-BE-05` **[BE][IN_PROGRESS]** Default-deny route classification với Roles/Scope/Candidate-token/RikuOp/probe guards. Depends on AUT-D-01…03. Acceptance: generated route manifest không có route unclassified.
- [ ] `GLB-BE-06` **[BE][IN_PROGRESS]** Transaction-aware boundary cho mutation, audit và notification/outbound occurrence. Depends on AUD-D-01…03 và NTF-D-01…03. Acceptance: fault injection không có business commit thiếu required audit/handoff.
- [ ] `GLB-BE-07` **[BE][IN_PROGRESS]** Map DTO/domain/auth/concurrency/database/integration errors sang approved catalog; không lộ Prisma/provider/stack. Depends on GLB-C-02 và OPT-D-02. Acceptance: mapping snapshot pass.
- [ ] `GLB-BE-08` **[BE][IN_PROGRESS]** Backend contract harness cho prefix/envelope/request ID/JSON naming/wire enum/error với OpenAPI. Depends on GLB-BE-01…07. Acceptance: deliberate contract drift làm verification fail.

#### Backend cho endpoint đã có nguồn

- [ ] `EP-001-BE-02` **[BE][IN_PROGRESS]** Map approved `login_id`, chỉ lấy active internal account; unknown/inactive không lộ account existence. Depends on EP-001-C-01 và ISSUES::API-003.
- [ ] `EP-001-BE-03` **[BE][IN_PROGRESS]** Verify salted hash, issue approved session/JWT và cập nhật `last_login_at` chỉ sau success; không log credential/token. Depends on AUTH-D-01/02.
- [ ] `EP-001-BE-04` **[BE][BLOCKED]** Áp dụng expiry/refresh/lockout/rate-limit sau khi policy duyệt và map failure vào catalog. Depends on GLB-C-03. Acceptance: threshold boundary tests pass.
- [ ] `EP-002-BE-02` **[BE][IN_PROGRESS]** Repository scope predicate: HQ global, AM assigned Area, SM/Sub-SM assigned Store. Depends on P2-03. Acceptance: ID/filter manipulation không vượt scope.
- [ ] `EP-002-BE-03` **[BE][IN_PROGRESS]** Allowlist approved pagination/sort/filter/business-date; không đưa raw client keys vào query. Depends on EP-002-C-01. Acceptance: invalid field/value normalized error.
- [ ] `EP-002-BE-04` **[BE][IN_PROGRESS]** Map current/published DTO bằng allowlist; không expose JSONB/pointers/audit ngoài contract. Depends on RVO. Acceptance: new draft không đổi published projection.
- [ ] `EP-003-BE-02` **[BE][IN_PROGRESS]** Load aggregate/current version/actor scope và validate state/token/required-on-submit trước mutation. Depends on EP-003-C-01, OPT, RVO, WP-API-004-C-01.
- [ ] `EP-003-BE-03` **[BE][IN_PROGRESS]** Transaction CAS, submission metadata, immutable submit action và AM-own-store self-approval theo Design §3.3. Acceptance: không partial action/pointer/state.
- [ ] `EP-003-BE-04` **[BE][BLOCKED]** Persist đúng notification occurrence qua atomic handoff; không send trực tiếp trong transaction. Depends on NTF-D-01/02. Acceptance: retry không duplicate logical notification.
- [ ] `EP-004-BE-02` **[BE][IN_PROGRESS]** AM chỉ approve `pending_am` trong assigned Area; HQ chỉ approve `pending_hq`; wrong role/scope/state theo catalog. Depends on EP-004-C-01/P2-03.
- [ ] `EP-004-BE-03` **[BE][IN_PROGRESS]** Transaction CAS, append approve action, transition state và chỉ update published pointer tại HQ approval. Depends on OPT/RVO. Acceptance: stale/repeat không thêm action/publish.
- [ ] `EP-004-BE-04` **[BE][BLOCKED]** Persist AM-approve→HQ notification occurrence, không suy event/recipient khác. Depends on NTF-D-01/02.
- [ ] `EP-005-BE-03` **[BE][IN_PROGRESS]** Map approved rejection wire field sang action comment; trim và reject blank/all-whitespace. Depends on EP-005-C-01 và ISSUES::API-005.
- [ ] `EP-005-BE-04` **[BE][IN_PROGRESS]** Transaction validate scope/state/token, append reject action; HQ reject→`rejected`, không implicit pending_hq→pending_am. Depends on OPT/RVO.
- [ ] `EP-005-BE-05` **[BE][BLOCKED]** Chỉ persist AM-reject→SM/Sub-SM notification occurrence; HQ reject không phát event chưa có nguồn. Depends on NTF-D-01/02.
- [ ] `EP-006-BE-02` **[BE][IN_PROGRESS]** Enforce HQ hoặc manager assigned Store; AM chỉ được thêm nếu contract duyệt. Depends on EP-006-C-01/P2-03. Acceptance: Store IDOR tests pass.
- [ ] `EP-006-BE-03` **[BE][IN_PROGRESS]** Normalize approved date/range theo JST, query typed fields và stable pagination. Depends on GLB-C-04. Acceptance: UTC boundary không đổi business date.
- [ ] `EP-006-BE-04` **[BE][BLOCKED]** Map internal-slot DTO allowlist; không reuse cho Candidate hoặc expose booked/closed detail ngoài contract. Acceptance: projection snapshot pass.
- [ ] `EP-007-BE-03` **[BE][BLOCKED]** Enforce role/scope, candidate eligibility và Store invariant; không tin client-derived Store. Depends on EP-007-C-01/SSI/P2-03.
- [ ] `EP-007-BE-04` **[BE][IN_PROGRESS]** Một transaction row-lock slot, validate open/version/manager-Store, create unique schedule, mark booked và audit. Depends on SSI/OPT/AUD. Acceptance: rollback không half-state.
- [ ] `EP-007-BE-05` **[BE][IN_PROGRESS]** Map stale/booked/unique/invariant failures sang approved codes; không blind retry. Depends on GLB-BE-07.
- [ ] `EP-007-BE-06` **[BE][BLOCKED]** Persist candidate notification/RikuOp outbound occurrence qua durable handoff sau booking. Depends on NTF/WRK/RikuOp contract. Acceptance: rollback/retry không duplicate effect.
- [ ] `EP-008-BE-02` **[BE][IN_PROGRESS]** Hash token lookup theo purpose/expiry/revocation/use; không persist/log plaintext. Depends on WP-API-014 và PII.
- [ ] `EP-008-BE-03` **[BE][BLOCKED]** Evaluate Candidate/Store/published-requirement để trả approved discriminator. Depends on ISSUES::DB-009. Acceptance: pause mapping tests pass.
- [ ] `EP-008-BE-04` **[BE][BLOCKED]** Safe projection chỉ chứa approved survey fields; không lộ Candidate/manager/pointers/token metadata. Depends on PII. Acceptance: PII sentinel pass.
- [ ] `EP-009-BE-03` **[BE][IN_PROGRESS]** Atomic token revalidation/consume và unique survey response per Candidate. Depends on WP-API-014/SRCCTL-D-03. Acceptance: replay/concurrent submit deterministic.
- [ ] `EP-009-BE-04` **[BE][IN_PROGRESS]** Validate/store approved survey schema và screen theo published requirement snapshot. Depends on WP-API-012-C-01/RVO.
- [ ] `EP-009-BE-05` **[BE][IN_PROGRESS]** Failed không issue preference/matching; Passed chỉ mở approved preference operation. Depends on SRCCTL-D-03. Acceptance: no premature matching.
- [ ] `EP-009-BE-06` **[BE][IN_PROGRESS]** Cancel/suppress +5-day no-response work sau successful submit và persist sourced occurrences. Depends on REM/NTF.
- [ ] `EP-010-BE-03` **[BE][BLOCKED]** Stream-validate approved file, persist durable object/checksum trước acknowledge và tạo import run. Depends on IMP-D-01…03, `ISSUES::API-009`, `ISSUES::OPN-005` và `ISSUES::OPN-006`.
- [ ] `EP-010-BE-04` **[BE][BLOCKED]** HQ-only; sanitize filename/errors; enqueue run ID thay process-local path/content. Depends on PII/WRK.
- [ ] `EP-010-BE-05` **[BE][BLOCKED]** Worker claim/checksum/parse approved mapping và persist per-row outcome/account-assignment invariants. Depends on IMP/ISSUES::DB-004. Acceptance: partial failure diagnosable.
- [ ] `EP-010-BE-06` **[BE][BLOCKED]** Account-provision occurrence chỉ cho account mới sau commit; duplicate job/restart không gửi lại. Depends on NTF.
- [ ] `EP-011-BE-04` **[BE][IN_PROGRESS]** Implement duy nhất mechanism/auth/replay hoặc credential/checkpoint đã chọn; không active webhook và polling mặc định. Depends on EP-011-C-01/AUT-D-03.
- [ ] `EP-011-BE-05` **[BE][IN_PROGRESS]** Validate/map payload qua anti-corruption adapter; schema drift ghi sanitized failure. Depends on PII/RikuOp sign-off.
- [ ] `EP-011-BE-06` **[BE][IN_PROGRESS]** Reuse normalization, external-ID idempotency, dedupe/blacklist và Candidate persistence. Depends on `ISSUES::DB-006` và `ISSUES::DB-007`.
- [ ] `EP-011-BE-07` **[BE][BLOCKED]** Persist inbound sync outcome và survey-notification occurrence theo atomicity policy; redelivery/checkpoint không duplicate. Depends on NTF/WRK.
- [ ] `EP-012-BE-02` **[BE][BLOCKED]** Tách liveness/readiness theo approved topology; không giả định mọi provider mandatory. Depends on EP-012-C-01/WRK/STG.
- [ ] `EP-012-BE-03` **[BE][BLOCKED]** Minimal allowlisted health status; không lộ connection string/host/credential/raw provider error. Depends on AUT/PII. Acceptance: exposure matrix pass.

#### Backend cho API work package chưa có operation contract

- [ ] `WP-API-001-BE-02` **[BE][BLOCKED]** Privacy-preserving reset request với approved neutral outcome/rate limit. Depends on WP-API-001-C-01/AUTH-D-02.
- [ ] `WP-API-001-BE-03` **[BE][BLOCKED]** Issue opaque reset token, persist hash/expiry và email occurrence; plaintext chỉ tại delivery boundary. Depends on AUTH/NTF/PII.
- [ ] `WP-API-001-BE-04` **[BE][BLOCKED]** Atomic consume, salted password update và session invalidation/revocation theo policy. Depends on AUTH-D-01/02. Acceptance: replay/concurrent consume rejected.
- [ ] `WP-API-002-BE-02` **[BE][BLOCKED]** HQ-only validate existing Area, unique Store code và approved Store fields; không thêm Area CRUD/update/delete. Depends on WP-API-002-C-01.
- [ ] `WP-API-002-BE-03` **[BE][BLOCKED]** Validate assigned role và exactly-one-primary invariant sau decision. Depends on ISSUES::DB-004.
- [ ] `WP-API-002-BE-04` **[BE][BLOCKED]** Persist Store, assignments và audit trong approved transaction; invalid assignment rollback toàn bộ. Depends on AUD.
- [ ] `WP-API-003-BE-02` **[BE][BLOCKED]** Export HQ-scoped current DB state theo approved columns/order/encoding; không từ audit/import file. Depends on WP-API-003-C-01.
- [ ] `WP-API-003-BE-03` **[BE][BLOCKED]** Query import run/results với HQ auth/pagination và masked row errors. Depends on IMP/PII.
- [ ] `WP-API-003-BE-04` **[BE][BLOCKED]** Stream export/result, không giữ toàn bộ dataset trong memory. Acceptance: empty/large/inaccessible-run tests pass.
- [ ] `WP-API-004-BE-02` **[BE][IN_PROGRESS]** At-most-one aggregate per Store/channel, actor scope và partial Draft create. Depends on WP-API-004-C-01/RVO.
- [ ] `WP-API-004-BE-03` **[BE][IN_PROGRESS]** Validate evolving JSONB bằng approved schema; required-on-submit không áp vào partial save. Depends on PII.
- [ ] `WP-API-004-BE-04` **[BE][IN_PROGRESS]** Edit tạo immutable sequential version bằng CAS; giữ published pointer và đưa current flow về Draft. Depends on OPT/RVO.
- [ ] `WP-API-004-BE-05` **[BE][BLOCKED]** Detail phân biệt current/published; import/export chỉ sau ISSUES::OPN-005 và approved file contract.
- [ ] `WP-API-005-BE-02` **[BE][IN_PROGRESS]** Validate actor scope, responsible manager và HQ-selected SM theo approved multi-manager contract. Depends on ISSUES::DB-004 và ISSUES::OPN-002.
- [ ] `WP-API-005-BE-03` **[BE][IN_PROGRESS]** Validate end>start, non-past và interval overlap xuyên mọi Store của cùng SM. Depends on ISSUES::DB-003.
- [ ] `WP-API-005-BE-04` **[BE][IN_PROGRESS]** Update/cancel bằng optimistic token và approved state; không tự thêm `cancelled`. Depends on ISSUES::DB-002/OPT/SSI.
- [ ] `WP-API-005-BE-05` **[BE][IN_PROGRESS]** HQ timeline query approved date/Area/Store/manager filters, stable pagination/scope. Acceptance: large-result evidence.
- [ ] `WP-API-006-BE-02` **[BE][BLOCKED]** Enforce role/scope và approved detail/change/cancel/complete transitions. Depends on WP-API-006-C-01.
- [ ] `WP-API-006-BE-03` **[BE][BLOCKED]** Validate `location_info` theo interview type bằng approved schema; không tự đặt URL/address fields.
- [ ] `WP-API-006-BE-04` **[BE][BLOCKED]** Reschedule/cancel transaction giữ schedule/old slot/new slot/Store invariant. Depends on SSI/AUD.
- [ ] `WP-API-006-BE-05` **[BE][BLOCKED]** Candidate result projection revalidate token/purpose và allowlisted fields; lifecycle effects idempotent qua handoff. Depends on WP-API-014/NTF/RikuOp contract.
- [ ] `WP-API-007-BE-02` **[BE][IN_PROGRESS]** Chỉ implement approved blacklist fields/matching; không thêm Kana/DOB; normalize theo approved rules. Depends on ISSUES::DB-007.
- [ ] `WP-API-007-BE-03` **[BE][BLOCKED]** HQ-only blacklist mutation/candidate review qua PII allowlist. Depends on PII/AUD.
- [ ] `WP-API-007-BE-04` **[BE][BLOCKED]** Candidate list/detail server pagination/filter và deterministic duplicate indicators. Depends on WP-API-007-C-01.
- [ ] `WP-API-007-BE-05` **[BE][BLOCKED]** Sanitized audit before/after; acceptance: false-positive/normalization/non-HQ/IDOR tests pass.
- [ ] `WP-API-008-BE-02` **[BE][BLOCKED]** HQ-only notification lifecycle query với approved filters/pagination; không suy manual retry. Depends on WP-API-008-C-01/NTF.
- [ ] `WP-API-008-BE-03` **[BE][BLOCKED]** Mask recipient/payload/error; không expose provider secret/raw credential. Depends on PII.
- [ ] `WP-API-008-BE-04` **[BE][BLOCKED]** Map terminal failure/DLQ chỉ sau ISSUES::DB-010. Acceptance: một logical notification hiển thị một terminal outcome.
- [ ] `WP-API-009-BE-02` **[BE][IN_PROGRESS]** Map only approved status/memo/interview events qua adapter; unknown mapping fail trước outbound call. Depends on WP-API-009-C-01.
- [ ] `WP-API-009-BE-03` **[BE][IN_PROGRESS]** Persist occurrence, bounded retry/backoff, response-shape check và sanitized sync log. Depends on WRK/PII/NTF.
- [ ] `WP-API-009-BE-04` **[BE][IN_PROGRESS]** Handle timeout/redelivery/idempotency theo provider capability; không claim exactly-once nếu contract không hỗ trợ.
- [ ] `WP-API-010-BE-02` **[BE][IN_PROGRESS]** HQ-only validate approved registration fields; không synthetic `rikuop_candidate_id`. Depends on ISSUES::DB-006.
- [ ] `WP-API-010-BE-03` **[BE][IN_PROGRESS]** Reuse normalization/dedupe/blacklist service với RikuOp intake. Depends on ISSUES::DB-007.
- [ ] `WP-API-010-BE-04` **[BE][IN_PROGRESS]** Persist Candidate/source/initial state/assignment và audit trong approved transaction. Depends on AUD.
- [ ] `WP-API-010-BE-05` **[BE][BLOCKED]** Chỉ phát sourced side effects; repeat request không duplicate Candidate/assignment/notification. Depends on NTF.
- [ ] `WP-API-011-BE-02` **[BE][BLOCKED]** Revalidate candidate token purpose/state/Store; không dùng internal auth EP-006. Depends on WP-API-011-C-01/014.
- [ ] `WP-API-011-BE-03` **[BE][BLOCKED]** Query only eligible open slots ngoài 36h JST và approved date range. Acceptance: exact boundary tests pass.
- [ ] `WP-API-011-BE-04` **[BE][BLOCKED]** Safe projection không chứa booked Candidate/manager/internal note/closed slot; booking vẫn authoritative.
- [ ] `WP-API-012-BE-02` **[BE][IN_PROGRESS]** Implement atomic/staged persistence đúng decision; không đổi nullability/field trước SRCCTL-D-03.
- [ ] `WP-API-012-BE-03` **[BE][IN_PROGRESS]** Enforce survey-completed→screening; Failed kết thúc preference path, Passed mới eligible.
- [ ] `WP-API-012-BE-04` **[BE][IN_PROGRESS]** Validate tối đa ba ranked preferences theo approved wire schema/current safe availability.
- [ ] `WP-API-012-BE-05` **[BE][IN_PROGRESS]** Enqueue matching chỉ sau durable preference completion bằng deterministic occurrence key. Depends on WRK/NTF. Acceptance: retry không duplicate matching.
- [ ] `WP-API-013-BE-02` **[BE][IN_PROGRESS]** Query append-only actions linked đúng version, stable order và requirement scope. Depends on RVO/PII.
- [ ] `WP-API-013-BE-03` **[BE][BLOCKED]** Map AM self-approval theo approved representation; không suy history từ current status/audit log.
- [ ] `WP-API-014-BE-02` **[BE][IN_PROGRESS]** Token service theo purpose matrix: opaque generation, hash-only persistence, issuer/state/TTL checks. Depends on WP-API-014-C-01/AUTH/PII.
- [ ] `WP-API-014-BE-03` **[BE][IN_PROGRESS]** Atomic consume/rotation/revocation đúng business event; GET không consume nếu matrix không quy định.
- [ ] `WP-API-014-BE-04` **[BE][BLOCKED]** Central token error/isolation/rate-limit behavior. Acceptance: concurrent consume/replay/expired/revoked/cross-purpose tests pass.

### 5.6 Contract, QA và dependency gaps từ review chéo

- [ ] `GLB-C-05` **[C][BLOCKED]** Chốt field-presence/null/omit và enum mapping matrix; depends on `ISSUES::API-001`, `ISSUES::API-002` và `ISSUES::API-004`.
- [ ] `GLB-QA-02` **[QA][BLOCKED]** OpenAPI snapshot và generated FE/BE type drift test; depends on GLB-C-01…05, GLB-FE-01 và GLB-BE-08.
- [ ] `WP-API-002-C-02` **[C][BLOCKED]** Chốt read operations cho Area, Store và assignable managers với minimal DTO/scope; không tự thêm method/path trước approval.
- [ ] `WP-API-002-QA-02` **[QA][BLOCKED]** Chứng minh form dùng dữ liệu thật; inactive/wrong-role manager không assign được; depends on approved lookup operations.
- [ ] `WP-API-014-D-01` **[D][IN_PROGRESS]** Xác định model token hiện tại có phục vụ survey, result và reminder hay phải tách theo purpose.
- [ ] `WP-API-014-I-01` **[I][IN_PROGRESS]** Cập nhật logical schema/migration theo WP-API-014-D-01 và C-01; không tự thêm cột trước decision.
- [ ] `WP-API-014-QA-02` **[QA][BLOCKED]** Chứng minh survey credential không truy cập result trước thời điểm/purpose được phép.
- [ ] `NTF-D-04` **[D][IN_PROGRESS]** Chốt canonical event→recipient→channel→timing matrix chỉ cho events có nguồn.
- [ ] `NTF-I-02` **[I][IN_PROGRESS]** Implement producer atom cho từng approved notification occurrence; depends on NTF-D-01…04.
- [ ] `NTF-QA-02` **[QA][IN_PROGRESS]** Chứng minh đúng một logical occurrence cho mỗi recipient/channel/event theo idempotency identity.
- [ ] `P4-07-C-01` **[C][BLOCKED]** Chốt +5-day due/stop/cancel/suppress semantics và RikuOp effect; depends on REM-D-01…03.
- [ ] `P4-07-BE-01` **[BE][IN_PROGRESS]** Recheck authoritative state trước decline/sync; late survey cancels hoặc suppresses occurrence theo approved semantics.
- [ ] `P4-07-QA-01` **[QA][BLOCKED]** Fake-clock late-submit/repeated-job/race tests cho no-response flow.
- [ ] `P6-03-BE-01` **[BE][IN_PROGRESS]** Implement +3d rồi daily reminder và stop on state exit theo approved REM contract.
- [ ] `P6-03-QA-01` **[QA][IN_PROGRESS]** Fake-clock tests cho version re-entry, missed run và holiday/cap sau ISSUES::OPN-007.
- [ ] `P6-04-BE-01` **[BE][IN_PROGRESS]** Recheck authoritative schedule tại T-24h JST; suppress cancelled/rescheduled occurrence theo approved semantics.
- [ ] `P6-04-QA-01` **[QA][BLOCKED]** T-24h JST, reschedule và cancellation race tests.
- [ ] `SCOPE-QA-01` **[QA][BLOCKED]** Mỗi dependency phải là exact atom/task ID hoặc package gate được khai báo; fail nếu dùng alias mơ hồ như `C`, `BE/FE`, `P0`, `P5`.

Các atom `EP-011-FE-01`, `WP-API-009-FE-01` và `EP-012-FE-01` là conditional, không vào denominator required cho đến khi có monitoring/business UI requirement được duyệt.

## 6. Technical remediation work packages

Mỗi package dưới đây phải tạo decision/contract artifact trước implementation. Các lựa chọn liệt kê là nội dung cần quyết định, không phải resolution.

### AUTH — Session và password-reset persistence

- [ ] `AUTH-D-01` **[D][IN_PROGRESS]** Chốt session/JWT transport có cần persistence, refresh/revocation/invalidation boundary và quan hệ với internal account; không áp dụng Candidate magic token.
- [ ] `AUTH-D-02` **[D][BLOCKED]** Chốt password-reset token hash, issuer, TTL, consumed/revoked state, one-time use và session invalidation; depends on GLB-C-03 và WP-API-001-C-01.
- [ ] `AUTH-I-01` **[I][IN_PROGRESS]** Cập nhật logical schema/Prisma/migration đúng AUTH-D-01/02; không tự thêm session/reset table hoặc column trước decision.
- [ ] `AUTH-QA-01` **[QA][IN_PROGRESS]** Test expiry, replay, concurrent consume, revocation, password change và session invalidation theo approved matrix.

Dependencies: PII, global auth/error contract. Evidence: ADR, OpenAPI, schema/migration và security/concurrency tests.

### OPT — Optimistic concurrency token

- [ ] `OPT-D-01` **[D][IN_PROGRESS]** Xác định concurrency boundary cho requirement edit/submit/approve/reject và slot update/book.
- [ ] `OPT-D-02` **[D][IN_PROGRESS]** Chốt token source, increment/change rules, ABA handling và conflict HTTP/error/authoritative-state contract.
- [ ] `OPT-I-01` **[I][IN_PROGRESS]** Cập nhật logical schema/Prisma/OpenAPI và implement compare-and-swap; affected rows khác 1 thành conflict, không retry mù.
- [ ] `OPT-FE-01` **[FE][IN_PROGRESS]** Gửi token đã đọc, chặn duplicate mutation, refetch/merge-discard theo approved policy.
- [ ] `OPT-QA-01` **[QA][BLOCKED]** Deterministic races: cùng base token chỉ một commit; stale slot update/book ổn định.

Dependencies: RVO và global error contract. Evidence: ADR, OpenAPI, migration, repository/race tests.

### RVO — Requirementâ€“Version ownership

- [ ] `RVO-D-01` **[D][IN_PROGRESS]** Chốt current/published ownership, nullability và pointer lifecycle cho draft/edit/reject/resubmit/approve.
- [ ] `RVO-D-02` **[D][BLOCKED]** Chốt DB/application enforcement, `version_no` allocation, archive/delete và circular migration order.
- [ ] `RVO-I-01` **[I][IN_PROGRESS]** Implement relation/transaction để pointer không thể trỏ sang version của requirement khác.
- [ ] `RVO-QA-01` **[QA][BLOCKED]** Cross-requirement/orphan/duplicate-version/invalid-published negative tests.
- [ ] `RVO-QA-02` **[QA][BLOCKED]** Published content giữ nguyên khi current draft thay đổi.

Dependencies: OPT, `ISSUES::DB-008`. Evidence: invariant matrix, migration và integrity tests.

### SSI — Scheduleâ€“Store invariant

- [ ] `SSI-D-01` **[D][IN_PROGRESS]** Chốt schedule Store là derived/denormalized/independent và invariant với slot/candidate Store.
- [ ] `SSI-D-02` **[D][BLOCKED]** Chốt cross-Store reschedule, manager reassignment và yêu cầu `slot.sm_user_id` thuộc Store.
- [ ] `SSI-I-01` **[I][IN_PROGRESS]** Implement constraint/transaction; không tin client Store nếu field là derived.
- [ ] `SSI-I-02` **[I][IN_PROGRESS]** Booking/reschedule/cancel atomically giữ slot/schedule/Store nhất quán.
- [ ] `SSI-QA-01` **[QA][BLOCKED]** Store mismatch, unassigned manager và concurrent reassignment/reschedule races.

Dependencies: manager invariant `ISSUES::DB-004`, slot lifecycle. Evidence: invariant decision + DB/integration tests.

### NTF — Notification outbox và delivery idempotency

- [ ] `NTF-D-01` **[D][IN_PROGRESS]** Chốt source of truth và atomic business transaction → persisted notification → relay/BullMQ flow.
- [ ] `NTF-D-02` **[D][IN_PROGRESS]** Chốt state/claim/lease/reclaim/retry exhaustion/DLQ và canonical occurrence/idempotency identity.
- [ ] `NTF-D-03` **[D][BLOCKED]** Chốt provider message ID/idempotency và ambiguous timeout theo provider contract.
- [ ] `NTF-I-01` **[I][IN_PROGRESS]** Implement atomic producer, dispatcher/reconciler, worker claim và recovery metadata.
- [ ] `NTF-QA-01` **[QA][IN_PROGRESS]** Fault injection trước/sau commit, trước enqueue, sau provider accept, timeout/redelivery; chứng minh không mất logical delivery.

Dependencies: WRK, PII, provider contract, `ISSUES::DB-010`. Evidence: ADR/state diagram/migration/recovery/fault report.

### IMP — Durable import file handoff

- [ ] `IMP-D-01` **[D][BLOCKED]** Chốt durable storage abstraction cho local/staging/prod và upload→persist→queue lifecycle.
- [ ] `IMP-D-02` **[D][BLOCKED]** Chốt import-run state, durable reference/checksum/type/size/access/encryption/retention/quarantine.
- [ ] `IMP-D-03` **[D][BLOCKED]** Chốt file/run/queue atomicity và parser/row semantics sau `ISSUES::OPN-005` và `ISSUES::OPN-006`.
- [ ] `IMP-I-01` **[I][BLOCKED]** Persist durable file trước acknowledge; job dùng run ID/reference, worker verify/checksum/claim/cleanup idempotently.
- [ ] `IMP-QA-01` **[QA][BLOCKED]** API restart, cross-container worker, duplicate delivery, missing/corrupt file và cleanup race.

Evidence: storage ADR, schema/OpenAPI, multi-process test và lifecycle logs.

### PII — JSONB/log data protection

- [ ] `PII-D-01` **[D][IN_PROGRESS]** Inventory/classify audit, sync, survey, notification, location và import-error JSONB; map actor access.
- [ ] `PII-D-02` **[D][BLOCKED]** Data owner/security/legal duyệt allowlist, masking/encryption, retention/erasure/legal-hold/backup.
- [ ] `PII-D-03` **[D][IN_PROGRESS]** Cấm persist/log password, plaintext magic token, auth header/signature và provider secret; chốt sanitized projection/schema versioning.
- [ ] `PII-I-01` **[I][BLOCKED]** Shared sanitizer/redactor, response allowlist, scoped views và retention/purge theo approved policy.
- [ ] `PII-QA-01` **[QA][BLOCKED]** Sentinel-secret scan trên response, logs và mọi JSONB; access/retention/deletion tests.

### WRK — Worker topology

- [ ] `WRK-D-01` **[D][IN_PROGRESS]** Chốt API/worker cùng hay tách process và queue-to-worker ownership cho 5 queues.
- [ ] `WRK-D-02` **[D][IN_PROGRESS]** Chốt concurrency/rate/autoscale/isolation, scheduler HA, job retention và deploy compatibility.
- [ ] `WRK-D-03` **[D][IN_PROGRESS]** Chốt DB/Redis/Secrets access, probes, graceful drain, shutdown và stalled recovery.
- [ ] `WRK-I-01` **[I][IN_PROGRESS]** Worker entrypoints/config/metrics/probes và deployment artifacts.
- [ ] `WRK-QA-01` **[QA][BLOCKED]** Rolling restart, SIGTERM drain, crash/stall, Redis reconnect và queue isolation.

### AUD — Audit atomicity

- [ ] `AUD-D-01` **[D][IN_PROGRESS]** Chốt business mutation/audit atomicity và failure policy; phân biệt success audit với failed/security event.
- [ ] `AUD-D-02` **[D][IN_PROGRESS]** Chốt interceptor/application/unit-of-work ownership, retry correlation, system actor và multi-entity action.
- [ ] `AUD-D-03` **[D][BLOCKED]** Chốt before/after redaction và retention cùng PII.
- [ ] `AUD-I-01` **[I][IN_PROGRESS]** Transaction-aware audit writer cho HTTP và worker mutation theo policy.
- [ ] `AUD-QA-01` **[QA][BLOCKED]** Inject business/audit failures; mutation-method coverage, GET exclusion, system actor.

### REM — Recurring reminder idempotency

- [ ] `REM-D-01` **[D][IN_PROGRESS]** Chốt occurrence identity theo requirement/version/state-entry/recipient/channel/template/business date.
- [ ] `REM-D-02` **[D][BLOCKED]** Chốt first due, window, caps, holiday, missed-run/catch-up theo ISSUES::OPN-007.
- [ ] `REM-D-03` **[D][IN_PROGRESS]** Chốt per-entity job/scanner, recipient snapshot/resolve-at-send và stop/resume/re-entry semantics.
- [ ] `REM-I-01` **[I][IN_PROGRESS]** Deterministic occurrence key + authoritative state recheck + scheduler reconciliation.
- [ ] `REM-QA-01` **[QA][IN_PROGRESS]** Fake-clock: same-day dedupe, consecutive days, +3d, state change, new version, restart/catch-up, cancelled schedule.

### AUT — Route authentication classification

- [ ] `AUT-D-01` **[D][IN_PROGRESS]** Inventory mọi route thành internal role/scope, candidate token, external signed và health/probe.
- [ ] `AUT-D-02` **[D][IN_PROGRESS]** Chốt default-deny metadata, CORS/CSRF/rate/cache policy theo class.
- [ ] `AUT-D-03` **[D][BLOCKED]** Chốt RikuOp signature/replay và health exposure/minimal response.
- [ ] `AUT-I-01` **[I][IN_PROGRESS]** Central classification + guards + generated route manifest; route thiếu class phải fail verification.
- [ ] `AUT-QA-01` **[QA][BLOCKED]** Anonymous/wrong role/scope/token/signature matrix và public DTO leakage tests.

### ERD — Cardinality parity

- [ ] `ERD-D-01` **[D][IN_PROGRESS]** Tạo min..max matrix cho logical relation và physical FK; gồm nullable actor/store/submitter.
- [ ] `ERD-D-02` **[D][BLOCKED]** Chốt polymorphic refs, Area–AM current/future cardinality, primary SM, RVO và SSI relations.
- [ ] `ERD-I-01` **[I][IN_PROGRESS]** Cập nhật Mermaid/Draw.io và schema constraints/nullability/delete behavior theo matrix.
- [ ] `ERD-QA-01` **[QA][BLOCKED]** Parity giữa source table, Prisma/migration, Mermaid và Draw.io.
- [ ] `ERD-QA-02` **[QA][BLOCKED]** Negative integrity tests cho mandatory relations.

### STG — Staging topology option

- [ ] `STG-D-01` **[D][BLOCKED]** Xác định owner/criteria/budget/account/network cho Docker Compose hoặc single ECS; không khóa một option sớm.
- [ ] `STG-D-02` **[D][BLOCKED]** Chọn compute/DB/Redis/Web/storage và production-parity deviations.
- [ ] `STG-D-03` **[D][BLOCKED]** Chốt worker placement, secrets/TLS/network, migration runner, logs/metrics/backups.
- [ ] `STG-I-01` **[I][IN_PROGRESS]** Reproducible deployment artifact và provision approved topology.
- [ ] `STG-QA-01` **[QA][BLOCKED]** Full smoke + restart/rolling deploy; delayed jobs và import file không mất.

## 7. Source-conflict control tasks

- [ ] `SRCCTL-D-01` **[D][IN_PROGRESS]** Ghi Design canonical cho HQ `pending_hq → rejected`; Rule return→pending_am là superseded; đồng bộ decision/issue/API/task references.
- [ ] `SRCCTL-QA-01` **[QA][BLOCKED]** Transition tests: HQ reject→rejected, edit→draft; không implicit pending_hq→pending_am.
- [ ] `SRCCTL-D-02` **[D][IN_PROGRESS]** Ghi candidate adjustment trigger theo Design: no matching slot → adjustment needed; Rule trigger ngay sau chọn preferences là superseded.
- [ ] `SRCCTL-QA-02` **[QA][IN_PROGRESS]** Test matched→scheduled và no-match→adjustment theo canonical flow.
- [ ] `SRCCTL-D-03` **[D][BLOCKED]** Chốt survey/preference persistence vì `preferred_dates NOT NULL` mâu thuẫn pass-only sequencing; depends on WP-API-012.

## 8. Dependency order

1. Namespace/source controls, PII inventory, route inventory và ERD matrix.
2. Survey/token/API operations; optimistic token và requirement-version ownership.
3. Schedule–Store và audit atomicity.
4. Notification handoff/provider semantics và worker topology.
5. Durable import và recurring reminder semantics.
6. Staging option sau khi biết worker/storage/probe needs.
7. Schema/OpenAPI freeze → implementation → fault/security/E2E evidence.

## 9. Namespace migration checklist

- [ ] `NS-DOC-01` **[D][IN_PROGRESS]** Rename endpoint IDs trong `API-CONTRACT.md` sang `EP-001…012` hoặc ghi mapping canonical được duyệt.
- [ ] `NS-DOC-02` **[D][BLOCKED]** Rename issue `API-001…009` trong `ISSUES-LIST-TRACKING.md` sang `ISS-API-001…009` và cập nhật references.
- [ ] `NS-DOC-03` **[D][BLOCKED]** Bổ sung issue mới cho manual candidate, safe availability, approval history, token lifecycle và sequencing/schema gaps.
- [ ] `NS-DOC-04` **[D][BLOCKED]** Sửa ADR staging option, RikuOp mechanism và derived source-of-truth wording theo review.
- [ ] `NS-QA-01` **[QA][BLOCKED]** Mỗi canonical ID có đúng một declaration; mọi dependency resolve; không namespace collision.

## 10. Evidence registry

Mọi checkbox `[x]` phải có một dòng evidence. Không chấp nhận “đã làm” hoặc chỉ trỏ tới section.

| Evidence ID | Atom ID | Artifact | Contract version | Verification command/result | Verified at | Verifier | Invalidated by |
|---|---|---|---|---|---|---|---|
| EV-20260902-001 | BLD-BE-BE-01 | `backend/src/**/*.ts`; `backend/test/esm-imports.spec.ts` | N/A — preflight only | `npx.cmd vitest run test/esm-imports.spec.ts` PASS (1/1); `backend/npm.cmd run build` PASS | 2026-09-02 | Codex | — |
| EV-20260902-002 | TST-BE-QA-01 | 11 service specs and 5 controller specs under `backend/src/modules/**`; boundary mocks only | N/A — test composition only | `backend/npm.cmd test` PASS (23 files, 23 tests); independent re-review PASS | 2026-09-02 | Codex + independent reviewer | — |
| EV-20260902-003 | IMPL-FE-QA-01 | `frontend/src/app/(auth)/login/page.tsx`; AuthContext and reported dashboard pages | N/A — lint-only corrective work | `frontend/npm.cmd run lint` PASS (exit 0; 23 pre-existing/non-blocking warnings remain) | 2026-09-02 | Codex | — |
| EV-20260902-004 | P1-PRISMA-BE-01 | `backend/src/infrastructure/prisma/*`; 15 injected consumers; 10 updated service specs | N/A — persistence wiring only | lifecycle RED→GREEN; focused 10/10 PASS; `npm.cmd test` 24/24 PASS; build PASS; lint exit 0; boundary scan: only `PrismaService`; independent task + final reviews APPROVED | 2026-09-02 | Codex + independent reviewers | — |

Evidence tối thiểu:

- `[C]/[D]`: ADR/OpenAPI path, version, approval/date và issue resolution.
- `[BE]/[I]`: source/test paths, command và kết quả.
- `[FE]`: generated-client/schema hash, component path và test result.
- `[QA]`: report/log, environment, command và result.

## 11. Progress calculation

`validDone(atom)` chỉ đúng khi checkbox checked, status `DONE`, evidence hợp lệ, mọi hard dependency `DONE` và evidence contract version bằng current approved version.

Không dùng một phần trăm tổng hợp. Báo cáo riêng:

| Metric | Công thức |
|---|---|
| Contract readiness | valid `[C]+[D]` / required `[C]+[D]` |
| Backend | valid `[BE]+[I]` / required `[BE]+[I]` |
| Frontend | valid `[FE]` / required `[FE]` |
| QA | valid `[QA]` / required `[QA]` |
| Package completion | packages có mọi required atom `DONE` / in-scope packages |
| Gate violations | downstream checked khi upstream contract chưa `DONE`; bắt buộc bằng 0 |

Scope chưa được xác nhận không vào denominator required; requirement đã xác nhận nhưng chờ external input vẫn vào denominator và báo `BLOCKED`.

## 12. Baseline metrics

| Metric | Baseline 2026-09-02 |
|---|---:|
| Documentation baseline tasks DONE | 0 evidence-backed tasks |
| Application implementation tasks DONE | 1 |
| Corrective preflight tasks DONE | 3 |
| Runtime bugs confirmed | 2 verification regressions: backend test 7/24 fail; frontend lint 2 errors |
| Evidence rows | 4 |
| Gate violations | 0 |
| Source audit: backend build | PASS — ESM local-import preflight + Nest build |
| Source audit: backend unit test | FAIL — 7/24 after normalization audit |
| Source audit: backend lint | PASS — exit 0 with 12 warnings |
| Source audit: frontend lint | FAIL — 2 errors, 22 warnings after normalization audit |
| Source audit: frontend build | PASS — current environment verification |
| Source audit: Prisma migration | `backend/prisma/migrations/20260902150620_init/migration.sql` exists; clean-PostgreSQL apply/drift verification unproven |

## 15. Source implementation audit — 2026-09-02

### 15.1 Nguyên tắc đánh giá

Status is governed by evidence normalization: an atom is `DONE` only when its artifact, acceptance verification, dependency gate, and direct Evidence Registry row satisfy §2 and §11. Existing source is recorded as partial implementation evidence and is classified `IN_PROGRESS` or `BLOCKED` when those conditions are incomplete.

| Scope đã quan sát | Artifact hiện có | Kết luận audit |
|---|---|---|
| Backend foundation | NestJS modules, Prisma schema, BullMQ processors và `docker-compose.yml` | Scaffold exists and backend build passes, but unit tests fail 7/24 and platform acceptance is not evidence-backed. |
| Backend use cases | Auth, requirements, slots, schedules, candidates, tokens, surveys, webhooks, notifications, reminders, RikuOp outbound | Có prototype/route thực tế, nhưng có route chưa được contract hóa, stubs, hard-coded/mock effect và scope/transaction chưa đủ; không task nghiệp vụ nào đạt `DONE`. |
| Frontend | Next.js pages cho login, survey, preference, calendar, HQ timeline/blacklist/export/candidate/notification và requirement history | Có screen scaffold, nhưng login và đa số business screen dùng mock/timeout/local data; không đạt invariant “không mock business state”. |
| Persistence | `backend/prisma/schema.prisma`, seed, `backend/prisma/migrations/20260902150620_init/migration.sql` | Prisma migration exists, but clean-PostgreSQL application and schema-drift verification remain unproven. |

### 15.2 Kết quả verification đã chạy

| Check | Result | Ảnh hưởng |
|---|---|---|
| `backend: npm.cmd run build` | PASS: local ESM imports đã chuẩn hóa `.js`; focused import assertion và Nest build pass | Chỉ là corrective preflight evidence; không mở business delivery. |
| `backend: npm.cmd test` | FAIL: 7 failed / 17 passed (24 total) | Current regression invalidates a green-suite claim; acceptance remains incomplete. |
| `backend: npm.cmd run lint` | PASS: exit 0 with 12 warnings | Warnings remain and lint does not replace domain acceptance evidence. |
| `frontend: npm.cmd run lint` | FAIL: 2 errors, 22 warnings | Current frontend lint is red despite the retained historical corrective evidence row. |
| `frontend: npm.cmd run build` | PASS: optimized Next.js production build completed in the current environment | Build success alone does not validate mock-driven business flows. |
| Prisma migration inventory | `backend/prisma/migrations/20260902150620_init/migration.sql` exists | Clean-PostgreSQL migration apply and drift checks remain unproven. |

### 15.3 Corrective implementation tasks phát sinh từ source audit

Các task sau chỉ diễn giải source đã tồn tại và requirement gốc; không hợp thức hóa endpoint/field/state hiện tại nếu chưa có approved contract.

- [x] `BLD-BE-BE-01` **[BE][DONE]** Chuẩn hóa ESM import strategy trên toàn bộ `backend/src`: local import phải tương thích cùng `tsconfig`/Nest build setting, không trộn extensionless và `.js` gây TS2307. Acceptance: `npm.cmd run build` pass từ clean checkout; evidence: config/source paths và build output. Evidence: `EV-20260902-001`.
- [ ] `BLD-BE-QA-01` **[QA][BLOCKED]** Sau BLD-BE-BE-01, boot API với required local config và smoke `/api/v1`/Swagger theo approved health/route policy; không coi dist cũ là evidence. Depends on BLD-BE-BE-01, AUT và EP-012-C-01.
- [x] `TST-BE-QA-01` **[QA][DONE]** Sửa test composition bằng DI mocks/module imports cho Auth/JWT, guards, BullMQ queues và direct service dependencies; assertion phải kiểm tra behavior, không chỉ `defined`. Acceptance: 22 existing module tests cùng 1 focused preflight assertion pass (23 files/23 tests tại verification) và mỗi module test có provider dependency rõ ràng. Evidence: `EV-20260902-002`.
- [ ] `TST-BE-QA-02` **[QA][BLOCKED]** Thay các smoke test `should be defined` bằng acceptance tests cho auth, requirement transition, token replay, slot race, notification failure và RikuOp selected mechanism. Depends on BLD-BE-BE-01, EP-001-C-01, EP-003-C-01, EP-004-C-01, EP-005-C-01, EP-007-C-01, WP-API-014-C-01, NTF-D-01…04 và EP-011-C-01.
- [ ] `DB-IMPL-I-01` **[I][BLOCKED]** Tạo Prisma migrations từ approved schema, chạy trên PostgreSQL sạch và kiểm tra schema drift; không chỉ dựa vào `schema.prisma`/seed. Depends on P0-05, AUTH-I-01, WP-API-014-I-01, RVO-I-01, SSI-I-01 và ERD-I-01.
- [ ] `DB-IMPL-QA-01` **[QA][BLOCKED]** CI integration test: apply migrations vào DB sạch, seed tối thiểu, rollback/failure behavior theo approved migration policy. Depends on DB-IMPL-I-01.
- [x] `P1-PRISMA-BE-01` **[BE][DONE]** Thay mọi `new PrismaClient()` trong service/worker bằng persistence boundary/injected client có lifecycle quản lý; unit test phải mock port/client thay vì kết nối ngầm. Depends on P1-02, P1-03 và GLB-BE-03. Evidence: `EV-20260902-004`.
- [ ] `SRC-ROUTE-C-01` **[C][BLOCKED]** Inventory route thực tế ở source (`auth`, `job-requirements`, `slots`, `schedules`, `surveys`, `tokens`, `candidates`, `webhooks`, `master-data`) đối chiếu approved OpenAPI registry; từng route surplus phải bị disable hoặc có contract/issue được duyệt. Không tạo route mới. Depends on P0-04 và AUT-D-01.
- [ ] `SRC-ROUTE-QA-01` **[QA][BLOCKED]** Generate route manifest từ application và compare với approved OpenAPI/classification; unapproved/public-unclassified route phải fail verification. Depends on SRC-ROUTE-C-01 và AUT-I-01.
- [ ] `IMPL-AUTH-BE-01` **[BE][IN_PROGRESS]** Thay login prototype dùng `email` bằng approved `login_id` mapping, update `last_login_at` chỉ sau success, generic failure/no credential leak và auth transport/session lifecycle đúng AUTH decision. Depends on EP-001-C-01, GLB-C-03, AUTH và PII.
- [ ] `IMPL-AUTH-FE-01` **[FE][IN_PROGRESS]** Bỏ mock JWT (`btoa`, hard-coded HQ, `Date.now`) ở login page; call generated `/auth/login` contract, parse approved envelope/role response và không tự đặt cookie TTL/role redirect policy. Depends on EP-001-C-01, GLB-FE-01…04 và AUTH-D-01.
- [ ] `IMPL-SURVEY-BE-01` **[BE][BLOCKED]** Refactor prototype survey: không nhận client-controlled `passed`, không persist `preferred_dates`/auto-match cùng boundary trước SRCCTL-D-03; persist/screen/preference/matching theo approved staged hoặc atomic decision. Depends on WP-API-012-C-01, SRCCTL-D-03, WP-API-014 và RVO.
- [ ] `IMPL-SURVEY-FE-01` **[FE][BLOCKED]** Thay survey resolver/submit mock, candidate preference mock và local success redirect bằng public token/safe DTO operations đã duyệt; Failed không render preference. Depends on EP-008-C-01, EP-009-C-01, WP-API-011-C-01, WP-API-012-C-01 và WP-API-014-C-01.
- [ ] `IMPL-TOKEN-BE-01` **[BE][BLOCKED]** Refactor token prototype: purpose hiện bị bỏ qua, GET/validation consume token ngay, TTL/no-response hard-code 5 ngày; áp dụng purpose matrix, atomic consume point, rotation/revocation và suppression theo WP-API-014/REM. Depends on WP-API-014-C-01/D-01/I-01, P4-07-C-01 và PII.
- [ ] `IMPL-CANDIDATE-BE-01` **[BE][BLOCKED]** Manual Candidate prototype phải persist approved source/assignment/initial state, dùng normalization trước blacklist/dedup check và transaction/audit; không silently bỏ `source`/Store assignment. Depends on WP-API-010-C-01, ISSUES::DB-006, ISSUES::DB-007, PII và AUD.
- [ ] `IMPL-SLOT-BE-01` **[BE][BLOCKED]** Slot/timeline prototype phải enforce Store-manager assignment, Sub-SM/HQ scope đúng contract, JST business date, allowlisted pagination/filter và deterministic optimistic conflict. Depends on WP-API-005-C-01, EP-006-C-01, OPT, SSI và P2-03.
- [ ] `IMPL-SCHEDULE-BE-01` **[BE][BLOCKED]** Thay schedule cancel/complete message stubs và auto-match blind retry bằng lifecycle/state/Store invariant transaction; booking phải lock/validate candidate-store-slot-manager và side effect qua handoff. Depends on WP-API-006-C-01, EP-007-C-01, SSI, OPT, AUD và NTF.
- [ ] `IMPL-NTF-BE-01` **[BE][BLOCKED]** Refactor notification prototype: deterministic occurrence/idempotency key thay `Date.now`/UUID, atomic business→outbox handoff, DB state hợp lệ (không ghi `pending` ngoài enum), provider adapter và retry/DLQ observable. Depends on NTF-D-01…04, NTF-I-01, ISSUES::DB-010 và PII.
- [ ] `IMPL-REM-BE-01` **[BE][BLOCKED]** Reminder prototype phải dùng recipient/state-entry/occurrence semantics đã duyệt; không gửi lặp daily theo `updated_at`, không mark reminder sent trước durable delivery policy và dùng JST T-24h. Depends on REM-D-01…03, NTF và PII.
- [ ] `IMPL-RIK-BE-01` **[BE][BLOCKED]** Disable/refactor public webhook prototype cho tới RikuOp sign-off: selected webhook/polling only, signature/replay/checkpoint, anti-corruption mapping, sanitized sync log và không trả token/survey URL trong response. Depends on EP-011-C-01, AUT-D-03, ISSUES::OPN-010, ISSUES::API-007, PII và WRK.
- [ ] `IMPL-RIK-QA-01` **[QA][BLOCKED]** Test selected inbound/outbound mechanism with redelivery/checkpoint, duplicate external ID, provider timeout và no leaked token/payload. Depends on IMPL-RIK-BE-01 và WP-API-009-C-01.
- [ ] `IMPL-FE-FE-01` **[FE][BLOCKED]** Thay business mock/timeout/local filtering/local CSV trong requirement list/editor/history, calendar, HQ timeline, blacklist, manual candidate, notification monitoring và export screens bằng generated approved client; nếu operation chưa contract hóa, screen phải presentational/blocked thay vì mô phỏng business result. Depends on GLB-FE-01…06, EP-002-C-01, WP-API-004-C-01, WP-API-005-C-01, WP-API-013-C-01, WP-API-007-C-01, WP-API-010-C-01, WP-API-008-C-01 và WP-API-003-C-01.
- [x] `IMPL-FE-QA-01` **[QA][DONE]** Xử lý 8 frontend lint errors: bỏ impure render trong login, thay `any` bằng approved/local types, chuyển AuthContext initialization khỏi synchronous effect pattern và escape JSX apostrophe. Acceptance: `npm.cmd run lint` exit 0; warning cleanup ghi riêng theo file. Evidence: `EV-20260902-003`.
- [ ] `IMPL-FE-QA-02` **[QA][BLOCKED]** Component/integration tests phải chứng minh không còn mock business response hoặc fake token ở delivery path; mock chỉ ở test fixture. Depends on IMPL-FE-FE-01, IMPL-AUTH-FE-01, IMPL-SURVEY-FE-01, EP-001-C-01, EP-008-C-01, EP-009-C-01, WP-API-011-C-01 và WP-API-012-C-01.
- [ ] `BLD-FE-QA-01` **[QA][BLOCKED]** Thiết lập controlled-environment build evidence cho Next font delivery (network/proxy hoặc approved self-host strategy), không đổi typography/source khi chưa có approved decision. Acceptance: `npm.cmd run build` pass trong documented environment. Depends on STG-D-02/03.

### 15.4 Trạng thái delivery sau audit

- Evidence normalization retains exactly four `DONE` atoms: `BLD-BE-BE-01`, `TST-BE-QA-01`, `IMPL-FE-QA-01`, and `P1-PRISMA-BE-01`.
- Các source artifact đã có phải được đối chiếu qua `SRC-ROUTE-*` trước khi coi là một phần của API scope.
- All other declared atoms remain `IN_PROGRESS` or `BLOCKED` after audit; no additional atom may be promoted without direct valid evidence.

## 13. Execution log

Append-only; mỗi status change phải ghi atom/task, before→after, artifact và verification.

| Date | Task | Change | Evidence/ghi chú | Actor |
|---|---|---|---|---|
| 2026-09-02 | P0-01/P0-02 | Baseline → DONE | User precedence confirmation; 9 root docs + plan/spec | Codex + User |
| 2026-09-02 | API checklist | Added initial 12 endpoint + 9 gap packages | 145 unchecked atoms trong phiên bản trước | Codex |
| 2026-09-02 | BLD-BE-BE-01 | READY → DONE | `EV-20260902-001`: focused ESM import test 1/1 và backend build pass | Codex |
| 2026-09-02 | TST-BE-QA-01 | READY → DONE | `EV-20260902-002`: backend tests 23/23 pass; independent review approved behavior assertions | Codex + independent reviewer |
| 2026-09-02 | IMPL-FE-QA-01 | READY → DONE | `EV-20260902-003`: frontend lint exit 0; 23 warnings giữ riêng ngoài corrective scope | Codex |
| 2026-09-02 | P1-PRISMA-BE-01 | BLOCKED → DONE | `EV-20260902-004`: lifecycle RED→GREEN; backend build/lint pass; tests 24/24; boundary scan pass; two review gates approved | Codex + independent reviewers |
| 2026-09-02 | Tracker evidence normalization | 358 unchecked DONE transitions: 194 → IN_PROGRESS; 164 → BLOCKED; 4 evidence-backed DONE preserved | `.superpowers/tracker-normalization/{baseline,contracts-review,backend-review,frontend-qa-review,reconciliation}.md`; no production source changed | Codex + independent reviewers |
| 2026-09-02 | Fix round 1 — tracker summary reconciliation | Phase overview/registry and source-verification summaries reconciled to evidence-normalized state | `.superpowers/tracker-normalization/final-validation.md` and `.superpowers/tracker-normalization/reconciliation.md`; commands/results in `fix-round-1-report.md` | Codex |
| 2026-09-02 | Cross-review | Three independent agents reviewed requirements, API/tasks và architecture/DB | Findings consolidated; no runtime code reviewed | Codex agents |
| 2026-09-02 | Tracking recovery/expansion | Rebuilt target after failed large agent patch; added canonical EP/WP IDs, contract gates, missing API packages và 12 technical packages | All implementation atoms remain unchecked/blocked | Codex |
| 2026-09-02 | FE/BE actionable decomposition | Three agents independently detailed Frontend, Backend and FEâ†”BE contract coverage; added AUTH/token/reference-data blockers and atomic delivery tasks | 354 unique unchecked atoms; 80 FE, 129 BE, 16 I, 53 QA, 33 C, 43 D; no implementation atom READY | Codex agents + Codex |
| 2026-09-02 | Source implementation audit | Reviewed current NestJS/Prisma/BullMQ and Next.js source against tracker; added corrective preflight, contract-reconciliation and FE/BE remediation atoms | Build/test/lint results recorded in §15; no business atom marked DONE | Codex |

## 14. Self-review gate cho file tracking

- Mỗi checkbox có atomic ID duy nhất.
- Không có endpoint method/path mới ngoài nguồn hoặc approved OpenAPI.
- Mọi implementation/test có dependency tới decision/contract package.
- RikuOp không mặc định webhook; staging không mặc định Docker Compose/ECS.
- Candidate survey, screening, availability, preference và result là boundaries riêng tới khi contract hợp nhất được duyệt.
- HQ reject notification không suy từ AM reject.
- Area/Store delete và standalone Area CRUD không nằm trong required tasks khi chưa có nguồn.
- Provisioned-account email có task contract, BE và QA.
- Không có placeholder chưa được giải thích hoặc task mô tả mơ hồ.
