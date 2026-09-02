# Backend/database/infrastructure normalization review

Scope: current checked `[BE]` and `[I]` declarations only. Direct Evidence Registry rows already cover `BLD-BE-BE-01` and `P1-PRISMA-BE-01`; they are intentionally omitted below. Current verification is not green: `backend/npm.cmd test` failed on 2026-09-02 with 7 failed and 17 passed files/tests, including stale controller specs and an Auth persistence mock mismatch.

GLB-BE-01 | IN_PROGRESS | `backend/src/main.ts` configures `/api/v1`, Swagger, `ValidationPipe`, `GlobalExceptionFilter`, and `TransformInterceptor`, but there is no direct registry row or contract test and the current backend suite fails 7/24.
GLB-BE-02 | IN_PROGRESS | `backend/src/main.ts` adds request IDs and a global rate limiter and `backend/src/common/guards/*` contains guards, but there is no sensitive-data redactor, route-policy verification, or passing evidence.
EP-001-BE-01 | IN_PROGRESS | `backend/src/modules/auth/auth.service.ts` implements lookup, bcrypt compare, active-state check, JWT issue, and `last_login_at`, but inactive users receive a distinct message and `auth.service.spec.ts` currently fails.
EP-002-BE-01 | IN_PROGRESS | `backend/src/modules/job-requirements/job-requirements.service.ts#list` and its controller provide a raw-filter prototype, but manager scope, allowlists, current/published projection, pagination, and acceptance evidence are missing.
EP-003-BE-01 | IN_PROGRESS | `backend/src/modules/job-requirements/job-requirements.service.ts` has draft/action transactions, but required-on-submit validation, actor scope, CAS, AM-own-Store handling, and passing flow tests are absent.
EP-004-BE-01 | IN_PROGRESS | `JobRequirementsService.processAction` has role/state branches and publishes on HQ approval, but it does not verify Area scope or perform an atomic CAS and has no acceptance evidence.
EP-005-BE-01 | IN_PROGRESS | `JobRequirementsService.processAction` persists reject actions, but accepts untrimmed whitespace comments, omits actor scope/CAS, and has no passing rejection tests.
EP-005-BE-02 | BLOCKED | No business flow calls `NotificationsService` on AM rejection; `backend/src/modules/job-requirements/job-requirements.service.ts` performs only DB state/action writes.
EP-006-BE-01 | IN_PROGRESS | `backend/src/modules/slots/slots.service.ts#getTimeline` contains a date/filter query, but the controller route is commented out and no HQ/assigned-manager scope or JST normalization is implemented.
EP-007-BE-01 | IN_PROGRESS | `backend/src/modules/schedules/schedules.service.ts#bookSlot` uses a transaction and versioned `updateMany`, but it does not row-lock or validate candidate/manager/Store invariants and the active slot route is a stub.
EP-007-BE-02 | BLOCKED | No booking path invokes `NotificationsService` or `RikuopOutboundService`; no atomic handoff artifact exists.
EP-008-BE-01 | IN_PROGRESS | `backend/src/modules/tokens/tokens.service.ts` hashes and checks expiry/use, but ignores its `purpose` argument, consumes during validation, lacks isolation/rate limiting, and has no passing lifecycle tests.
EP-009-BE-01 | IN_PROGRESS | `backend/src/modules/surveys/surveys.service.ts` consumes a token and creates a response, but trusts client `passed`, stores preferences in the same boundary, and does not screen from the published requirement.
EP-009-BE-02 | IN_PROGRESS | `SurveysService.submit` branches failed candidates away from `autoMatch`, but passed submissions immediately auto-match before a separate durable preference completion and lack sequencing tests.
EP-010-BE-01 | BLOCKED | `backend/src/modules/master-data/master-data.controller.ts` explicitly returns a stub `pending_logic`; no durable object, import run, queue worker, validation results, or service method exists.
EP-010-BE-02 | BLOCKED | No account-import worker or account-provision notification occurrence exists in backend source.
EP-011-BE-01 | IN_PROGRESS | `backend/src/modules/webhooks/webhooks.controller.ts` exposes an active webhook and synchronously processes it, but has no authentication/replay validation or inbound queue.
EP-011-BE-02 | BLOCKED | No polling process, cursor, or checkpoint implementation exists; only the active webhook prototype is present.
EP-011-BE-03 | IN_PROGRESS | `backend/src/modules/webhooks/webhooks.service.ts` maps a payload and reuses candidate checks, but has no validated anti-corruption schema, inbound sync log, redaction, or durable worker.
EP-012-BE-01 | BLOCKED | `backend/src/app.controller.ts` exposes only a Hello World root; no DB, Redis, or dependency health checks exist.
WP-API-001-BE-01 | BLOCKED | No password-reset request/consume service or controller exists; `auth.controller.spec.ts` calls absent `forgotPassword` and fails.
WP-API-002-BE-01 | BLOCKED | No Store creation controller/service exists; Prisma models alone do not implement HQ authorization, validation, or primary-SM invariants.
WP-API-003-BE-01 | BLOCKED | No DB export or import-results query implementation exists; the only import endpoint is an explicit stub.
WP-API-004-BE-01 | IN_PROGRESS | `backend/src/modules/job-requirements/job-requirements.service.ts` creates drafts/versions and preserves the published pointer on edit, but actor scope, approved JSON schema, true CAS, and passing acceptance tests are missing.
WP-API-005-BE-01 | IN_PROGRESS | `backend/src/modules/slots/slots.service.ts` checks past/start/end/overlap and has timeline code, but active routes are disabled and cross-Store ownership, booked-state, JST, scope, and acceptance evidence are missing.
WP-API-006-BE-01 | BLOCKED | Schedule cancel/complete routes in `backend/src/modules/schedules/schedules.controller.ts` are commented message stubs; no detail/change/cancel/complete lifecycle, location validation, audit, or handoff exists.
WP-API-007-BE-01 | IN_PROGRESS | `backend/src/modules/candidates/candidates.service.ts` performs simple blacklist/duplicate lookups and normalization, but no HQ blacklist CRUD/review or scoped candidate list/detail routes exist.
WP-API-008-BE-01 | BLOCKED | `Notification` persistence and workers exist, but there is no notification-monitoring controller/query, HQ-only filtering, pagination, or masked projection.
WP-API-009-BE-01 | IN_PROGRESS | `backend/src/modules/rikuop-outbound/*` persists/enqueues outbound work with retry, but sends a mock response, has no approved event adapter/response validation, uses invalid `pending` enum casts, and stores raw payload/error.
WP-API-010-BE-01 | IN_PROGRESS | `backend/src/modules/candidates/candidates.service.ts` and `webhooks.service.ts` share basic dedupe/blacklist logic, but the manual route is disabled and source/assignment/audit/idempotency are not persisted.
WP-API-011-BE-01 | BLOCKED | The only active Store-slots route in `backend/src/modules/slots/slots.controller.ts` is an internal-auth empty-array stub; no candidate-token validation or safe availability query exists.
WP-API-012-BE-01 | IN_PROGRESS | `backend/src/modules/surveys/surveys.service.ts` has single-response DB uniqueness and branching, but consumes non-atomically, trusts client screening, combines preferences, and triggers matching prematurely.
WP-API-013-BE-01 | IN_PROGRESS | `JobRequirementsService.getHistory` queries version-linked append-only actions in stable order, but its route is disabled and it lacks scope, approved projection, self-approval mapping, and passing tests.
WP-API-014-BE-01 | IN_PROGRESS | `backend/src/modules/tokens/tokens.service.ts` persists token hashes and checks expiry/use, but purpose is not stored or checked, validation consumes immediately and non-atomically, and revocation/isolation are absent.

GLB-BE-03 | IN_PROGRESS | Nest modules exist under `backend/src/modules`, but services directly import NestJS, Prisma, BullMQ, and each other; there are no domain/application ports or dependency-rule test.
GLB-BE-04 | IN_PROGRESS | `backend/src/main.ts` centralizes whitelist/transform validation and several DTOs exist, but many controller inputs are `any`, error normalization is incomplete, mass-assignment tests are absent, and the suite fails.
GLB-BE-05 | IN_PROGRESS | `backend/src/common/guards/*` provides JWT/role/scope prototypes, but routes are not default-deny, Candidate/RikuOp/probe classes are absent, and there is no generated route-manifest verification.
GLB-BE-06 | IN_PROGRESS | A few services use Prisma `$transaction`, but `AuditInterceptor` writes afterward and swallows failure while notification/outbound writes enqueue separately; no shared atomic mutation boundary or fault test exists.
GLB-BE-07 | IN_PROGRESS | `backend/src/common/filters/global-exception.filter.ts` wraps exceptions, but emits raw exception messages/status numbers and logs stacks; there is no approved error catalog mapper or snapshot test.
GLB-BE-08 | IN_PROGRESS | Prefix/envelope/Swagger scaffolding exists in `backend/src/main.ts`, but there is no OpenAPI drift harness for request ID, JSON naming, wire enums, or errors.
EP-001-BE-02 | IN_PROGRESS | `AuthService.login` accepts email or employee code and queries active status only after password comparison; inactive and unknown outcomes differ, and no approved mapping/negative evidence passes.
EP-001-BE-03 | IN_PROGRESS | `AuthService.login` uses bcrypt, signs a 12h JWT, and updates `last_login_at` after compare, but session policy/revocation is absent and the auth spec currently fails.
EP-001-BE-04 | BLOCKED | No refresh, lockout, or threshold-rate-limit implementation/test exists; only a global fixed IP limiter and fixed 12h JWT setting are present.
EP-002-BE-02 | IN_PROGRESS | `ScopeGuard` checks path `storeId`/`areaId`, but the job-requirement list bypasses it and explicitly notes role-derived constraints are unimplemented; ID/filter manipulation tests are absent.
EP-002-BE-03 | IN_PROGRESS | The list controller accepts raw `@Query() any` and forwards unvalidated status/store filters; no allowlisted pagination/sort/business-date DTO or normalized invalid-input test exists.
EP-002-BE-04 | IN_PROGRESS | Requirement schema has current/published IDs, but `list` includes raw Store and does not build a safe current/published DTO; no projection snapshot exists.
EP-003-BE-02 | IN_PROGRESS | `JobRequirementsService.processAction` loads the latest version and checks state/version number, but does not enforce actor scope, required-on-submit schema, or atomic optimistic predicate.
EP-003-BE-03 | IN_PROGRESS | A Prisma transaction writes submission metadata/action/state, but it lacks CAS and AM-own-Store self-approval logic and has no rollback/fault evidence.
EP-003-BE-04 | BLOCKED | Submit flow never persists or enqueues a notification occurrence; no transaction-bound handoff exists.
EP-004-BE-02 | IN_PROGRESS | `processAction` gates AM/HQ by status, but does not verify assigned Area, returns ad hoc exceptions, and lacks wrong-scope/state tests.
EP-004-BE-03 | IN_PROGRESS | Approval state/action/published-pointer writes share a transaction, but stale checking is read-then-write rather than CAS and repeat-action acceptance tests are absent.
EP-004-BE-04 | BLOCKED | AM approval does not persist an HQ notification occurrence anywhere in `JobRequirementsService`.
EP-005-BE-03 | IN_PROGRESS | Rejection accepts `dto.comment`, but validates only truthiness and does not trim/reject whitespace; no wire-field mapping acceptance test exists.
EP-005-BE-04 | IN_PROGRESS | Reject state/action writes share a transaction and HQ goes to `rejected`, but actor scope and CAS are missing.
EP-005-BE-05 | BLOCKED | Rejection flow has no AM-reject notification producer and therefore no evidence that HQ reject is suppressed by an occurrence matrix.
EP-006-BE-02 | IN_PROGRESS | A generic `ScopeGuard` can check Store assignments, but `getStoreSlots` does not use it and its empty stub has no HQ/manager scope or IDOR test.
EP-006-BE-03 | IN_PROGRESS | Timeline code parses JavaScript dates and orders by start time, but has no JST business-date normalization, typed range DTO, stable tie-break pagination, or UTC-boundary test.
EP-006-BE-04 | BLOCKED | Active Store-slot response is `{storeId,date,slots:[]}`; no internal safe allowlist projection or snapshot test exists.
EP-007-BE-03 | BLOCKED | Active `bookSlot` controller returns a success stub and never validates role-derived Store, candidate eligibility, or manager assignment.
EP-007-BE-04 | IN_PROGRESS | `SchedulesService.bookSlot` atomically version-updates a slot and creates a schedule, but does not row-lock, validate candidate/manager/Store, or write audit, and lacks rollback tests.
EP-007-BE-05 | IN_PROGRESS | Version conflict becomes `ConflictException`, but unique/invariant failures are unmapped and `autoMatch` blindly retries every conflict; no approved-code tests exist.
EP-007-BE-06 | BLOCKED | Booking creates only slot/schedule records; no durable notification or RikuOp occurrence/handoff is persisted.
EP-008-BE-02 | IN_PROGRESS | Token lookup hashes plaintext and checks used/expiry, but schema/service contain no purpose or revocation state and no plaintext-leak/rate-limit evidence.
EP-008-BE-03 | BLOCKED | Survey GET is a static stub and never evaluates Candidate, Store, or published requirement; no discriminator or pause mapping exists.
EP-008-BE-04 | BLOCKED | Survey GET echoes the token and a message rather than an approved safe survey projection; no PII sentinel test exists.
EP-009-BE-03 | IN_PROGRESS | DB uniqueness limits one response per Candidate, but token consume and response create are separate operations and concurrent replay is not deterministic or tested.
EP-009-BE-04 | IN_PROGRESS | A survey response is persisted, but the DTO is arbitrary `Record<string, any>` and screening trusts `answers.passed` instead of a published snapshot.
EP-009-BE-05 | IN_PROGRESS | Failed submissions avoid `autoMatch`, but passed submissions jump directly to matching rather than opening an approved preference operation.
EP-009-BE-06 | IN_PROGRESS | `TokensService.validateAndConsume` removes one inactivity job after consume, but there is no sourced occurrence model or reconciliation/suppression test.
EP-010-BE-03 | BLOCKED | Master-data upload uses process-memory `FileInterceptor` and returns a stub; no durable object/checksum/import-run artifact exists and the controller cites unresolved format decisions.
EP-010-BE-04 | BLOCKED | Although the stub route is HQ-decorated, it returns the raw original filename and never enqueues a run ID; no sanitizer or worker handoff exists.
EP-010-BE-05 | BLOCKED | There is no import worker, claim/checksum/parser, row outcome persistence service, or account-assignment implementation.
EP-010-BE-06 | BLOCKED | There is no account-provision occurrence producer or import restart/idempotency behavior.
EP-011-BE-04 | IN_PROGRESS | A webhook mechanism is active, but no recorded selection evidence, authentication, replay defense, or queue exists, and polling is not explicitly reconciled.
EP-011-BE-05 | IN_PROGRESS | `WebhooksService` performs direct field renaming, but accepts `any`, has no schema-drift handling, and exposes token-derived survey URL data.
EP-011-BE-06 | IN_PROGRESS | Webhook reuses `CandidatesService` for duplicate/blacklist lookup, but external ID is not mapped/persisted and normalization occurs after lookup.
EP-011-BE-07 | BLOCKED | Inbound processing writes neither an inbound sync outcome nor a notification occurrence and has no redelivery/checkpoint idempotency.
EP-012-BE-02 | BLOCKED | No liveness/readiness routes or topology-dependent health policy exist in backend source.
EP-012-BE-03 | BLOCKED | No health response projection or exposure-matrix test exists; the root endpoint is only `Hello World!`.

WP-API-001-BE-02 | BLOCKED | Password-reset request is absent from `AuthController`/`AuthService`; the stale spec that calls it fails, so neutral outcome/rate-limit behavior is unimplemented.
WP-API-001-BE-03 | BLOCKED | Prisma has no reset-token model and backend has no reset-token issue/email occurrence path.
WP-API-001-BE-04 | BLOCKED | No reset-token consume, password-update transaction, or session invalidation/revocation implementation/test exists.
WP-API-002-BE-02 | BLOCKED | No Store create endpoint/service exists; `Store`/`Area` schema constraints do not supply HQ authorization or request validation.
WP-API-002-BE-03 | BLOCKED | `StoreManagerAssignment` has only a per-user uniqueness constraint; no role validation or exactly-one-primary constraint/transaction exists.
WP-API-002-BE-04 | BLOCKED | No Store/assignment/audit creation transaction exists.
WP-API-003-BE-02 | BLOCKED | No export controller/service/stream implementation exists.
WP-API-003-BE-03 | BLOCKED | No import-run/results query exists; `MasterDataImportLog` alone has no HQ-scoped masked API.
WP-API-003-BE-04 | BLOCKED | No export/result streaming implementation or empty/large/inaccessible-run tests exist.
WP-API-004-BE-02 | IN_PROGRESS | Schema enforces one Store/channel aggregate and create uses a transaction, but actor scope is absent and payload is required rather than verified partial-draft semantics.
WP-API-004-BE-03 | IN_PROGRESS | Requirement payload is arbitrary JSON object in DTO/Prisma; no approved evolving schema or required-on-submit distinction is implemented.
WP-API-004-BE-04 | IN_PROGRESS | Edit creates a sequential immutable version and keeps the published pointer, but uses read-then-create without atomic CAS and has no concurrency test.
WP-API-004-BE-05 | BLOCKED | No detail operation distinguishes current/published and import/export routes are disabled/stubbed with unresolved file contracts.
WP-API-005-BE-02 | IN_PROGRESS | Slot creation binds manager to the authenticated user, but trusts client `storeId`, does not validate assignments/multi-manager policy, and its route is disabled.
WP-API-005-BE-03 | IN_PROGRESS | Slot service checks end/start, past time, and overlap for one SM, but date/time modeling is inconsistent and cross-Store/JST boundary tests are absent.
WP-API-005-BE-04 | IN_PROGRESS | Cancel uses a version predicate and rejects booked slots, but the route is disabled and no approved update/state contract or concurrency test exists.
WP-API-005-BE-05 | IN_PROGRESS | Timeline query code supports Store/Area/date/offset inputs, but the route is disabled, filters are unvalidated, manager filter/stable tie-break are missing, and no large-result evidence exists.
WP-API-006-BE-02 | BLOCKED | Schedule lifecycle routes are commented stubs and no service methods enforce detail/change/cancel/complete scope or transitions.
WP-API-006-BE-03 | BLOCKED | `location_info` is only unvalidated JSON in Prisma; no interview-type DTO/schema validation exists.
WP-API-006-BE-04 | BLOCKED | No reschedule/cancel transaction updates schedule, old slot, new slot, and Store invariant.
WP-API-006-BE-05 | BLOCKED | No candidate result endpoint/projection, token revalidation, or idempotent lifecycle handoff exists.
WP-API-007-BE-02 | IN_PROGRESS | Candidate registration normalizes email/phone only after raw duplicate/blacklist queries; no approved normalization service or matching tests exist.
WP-API-007-BE-03 | BLOCKED | No blacklist mutation or candidate-review controller/service exists and no audit allowlist is applied.
WP-API-007-BE-04 | BLOCKED | No candidate list/detail API, server pagination/filter, or deterministic duplicate projection exists.
WP-API-007-BE-05 | BLOCKED | No blacklist audit before/after implementation or false-positive/non-HQ/IDOR acceptance tests exist.
WP-API-008-BE-02 | BLOCKED | No HQ notification-lifecycle query/controller or approved filter/pagination implementation exists.
WP-API-008-BE-03 | BLOCKED | No notification monitoring projection masks recipient, payload, or error; persistence retains raw payload/error fields.
WP-API-008-BE-04 | BLOCKED | Notification worker has only scheduled/sent/failed state and no DLQ/terminal-outcome query model or acceptance test.
WP-API-009-BE-02 | IN_PROGRESS | RikuOp outbound accepts arbitrary entity/payload and performs a mock call; no approved event mapping or pre-call unknown-event rejection exists.
WP-API-009-BE-03 | IN_PROGRESS | Service/worker persist and retry an outbound log, but there is no response-shape check, sanitizer, or transaction-bound occurrence and raw errors are stored.
WP-API-009-BE-04 | IN_PROGRESS | BullMQ attempts/backoff exist, but there is no provider-capability-aware timeout/redelivery/idempotency handling.
WP-API-010-BE-02 | IN_PROGRESS | Manual DTO has approved-looking fields and no synthetic RikuOp ID, but its route is disabled and service omits source/assignment and actor authorization.
WP-API-010-BE-03 | IN_PROGRESS | Manual/webhook paths share `CandidatesService`, but raw matching precedes normalization and there is no reusable deterministic normalization policy.
WP-API-010-BE-04 | IN_PROGRESS | `CandidatesService` creates a Candidate, but omits requested source, Store assignment, audit, and transaction.
WP-API-010-BE-05 | BLOCKED | No manual-intake side-effect producer or request idempotency key exists.
WP-API-011-BE-02 | BLOCKED | No candidate-token safe-availability operation exists; the Store-slots stub uses internal auth and ignores candidate state/purpose/Store.
WP-API-011-BE-03 | BLOCKED | `autoMatch` has an internal 36-hour filter, but there is no candidate availability query, JST date-range validation, or exact-boundary test.
WP-API-011-BE-04 | BLOCKED | No safe candidate slot projection exists; the only availability controller returns a hard-coded empty list.
WP-API-012-BE-02 | IN_PROGRESS | Survey persistence is implemented as a single premature combined response with non-null preferences; it is not reconciled to a verified staged/atomic decision.
WP-API-012-BE-03 | IN_PROGRESS | Failed/passed branching exists, but `survey_completed` screening transition is skipped and screening is client-controlled.
WP-API-012-BE-04 | IN_PROGRESS | `preferredDates` is read from arbitrary answers and stored without a maximum-three ranked schema or safe-availability validation.
WP-API-012-BE-05 | IN_PROGRESS | Matching is invoked after response creation, but there is no distinct durable preference completion, deterministic occurrence key, or retry-idempotency test.
WP-API-013-BE-02 | IN_PROGRESS | `getHistory` queries actions by version in stable ascending order, but the route is disabled and requirement scope/safe projection tests are absent.
WP-API-013-BE-03 | BLOCKED | No AM self-approval representation is implemented in action/history code; submit always goes to `pending_am`.
WP-API-014-BE-02 | IN_PROGRESS | Opaque generation and hash-only persistence exist, but purpose/issuer/state are absent from schema and service, TTL is hard-coded, and isolation tests are missing.
WP-API-014-BE-03 | IN_PROGRESS | Consume sets `used_at`, but it is read-then-update rather than atomic, has no rotation/revocation semantics, and validation always consumes.
WP-API-014-BE-04 | BLOCKED | No central token error catalog, purpose isolation, rate limiter, or concurrent/replay/revoked/cross-purpose acceptance suite exists.

WP-API-014-I-01 | IN_PROGRESS | `backend/prisma/schema.prisma` and the init migration define a survey token hash/expiry/use table, but omit purpose/issuer/revocation/rotation fields and have no clean-DB migration verification row.
NTF-I-02 | IN_PROGRESS | `backend/src/modules/notifications/notifications.service.ts` is a generic producer, but business flows do not invoke occurrence-specific producers and keys are nondeterministic time/UUID values.
P4-07-BE-01 | IN_PROGRESS | `InactivityProcessor` checks token use before `no_response` and token consume removes a job, but there is no authoritative candidate-state CAS or approved late-survey cancel/suppress occurrence behavior.
P6-03-BE-01 | IN_PROGRESS | `RemindersService.checkStaleRequirements` runs daily after a three-day timestamp threshold, but derives the wrong recipient, repeats from `updated_at`, and has no state-entry occurrence/reconciliation evidence.
P6-04-BE-01 | IN_PROGRESS | `RemindersService.checkUpcomingInterviews` re-queries scheduled rows in a 23–24h window, but is not JST-defined and marks `reminder_sent_at` after a non-atomic enqueue with no reschedule suppression evidence.
AUTH-I-01 | IN_PROGRESS | Prisma/migration contain password hash, active status, and `last_login_at`, but no approved session/refresh/reset/revocation persistence and no clean-DB migration evidence.
OPT-I-01 | IN_PROGRESS | Slot schema has `version` and booking uses `updateMany` CAS, but requirements use read-then-write, OpenAPI tokens are inconsistent, and affected-row conflict tests are absent.
RVO-I-01 | IN_PROGRESS | Requirement and version tables contain pointer IDs and ownership FK for versions, but current/published pointers have no foreign keys or constraint preventing cross-requirement targets.
SSI-I-01 | IN_PROGRESS | Slot and schedule each store a Store ID and booking is transactional, but no composite constraint enforces equality and `bookSlot` trusts client-supplied `storeId`.
SSI-I-02 | IN_PROGRESS | Booking updates a slot and creates a schedule in one transaction, but reschedule/cancel consistency paths do not exist and Store equality is unchecked.
NTF-I-01 | IN_PROGRESS | Notification persistence, BullMQ producer, and worker exist, but DB create and enqueue are non-atomic, there is no outbox/reconciler/claim lease/recovery metadata, and failure stores raw errors.
IMP-I-01 | BLOCKED | No durable file object/reference, import-run job, checksum, claim, cleanup, or import worker exists; only a log model and explicit upload stub are present.
PII-I-01 | BLOCKED | No shared sanitizer/redactor, scoped DB views, or retention/purge implementation exists; several paths persist/log raw payloads and errors.
WRK-I-01 | IN_PROGRESS | Three BullMQ processors are registered inside API modules, but there are no separate worker entrypoints, metrics/probes, worker deployment artifacts, or topology evidence.
AUD-I-01 | IN_PROGRESS | `AuditLog` and `AuditInterceptor` exist, but the interceptor is not globally registered, runs after business commit, swallows failures, records raw body, and workers have no transaction-aware audit writer.
REM-I-01 | IN_PROGRESS | Cron schedulers and queue jobs exist, but notification keys are time/UUID-based and there is no authoritative state-entry key or scheduler reconciliation.
AUT-I-01 | IN_PROGRESS | JWT/roles/scope guards exist, but classification is opt-in, some public/internal routes remain unclassified, and no generated manifest fails missing classes.
ERD-I-01 | IN_PROGRESS | Prisma schema and one migration define relations, but current/published pointer FKs, primary-SM constraint, and several policy relations are absent; no schema-matrix parity verification exists.
STG-I-01 | IN_PROGRESS | `docker-compose.yml` reproducibly defines PostgreSQL and Redis only; it does not provision API, workers, frontend, migration runner, secrets/TLS, metrics, or the approved full topology.

IMPL-AUTH-BE-01 | IN_PROGRESS | Login now accepts `login_id` and updates `last_login_at` after bcrypt success, but inactive failures are non-generic, email is still an alternate login, auth lifecycle policy is incomplete, the auth spec fails, and there is no direct evidence row.
