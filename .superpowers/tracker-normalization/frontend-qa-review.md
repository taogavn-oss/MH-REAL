# Frontend and QA normalization review

Scope: current checked `[FE]` and `[QA]` declarations only. Direct Evidence Registry rows already cover `TST-BE-QA-01` and `IMPL-FE-QA-01`; they are intentionally omitted. Current checks: `frontend/npm.cmd run build` passes, `frontend/npm.cmd run lint` fails with 2 errors and 22 warnings, there is no frontend test script or frontend test file, and `backend/npm.cmd test` fails 7/24.

GLB-FE-01 | IN_PROGRESS | `frontend/src/lib/api.ts` is a handwritten Axios wrapper, but no generated OpenAPI client/types, schema hash, central envelope parser, or contract test exists.
GLB-QA-01 | BLOCKED | No prefix/envelope/error/validation/request-ID parity test exists; `backend/test/app.e2e-spec.ts` checks only the unprefixed Hello World root.
EP-001-FE-01 | IN_PROGRESS | `frontend/src/app/(auth)/login/page.tsx` has a form and `AuthContext.tsx` stores/decodes a JWT and redirects, but policy is client-invented, AM/Store dashboard targets do not exist, and no FE tests exist.
EP-001-QA-01 | IN_PROGRESS | Auth unit specs exist, but both current auth specs fail and there is no four-role, wrong-attempt, or rate-limit E2E coverage.
EP-002-FE-01 | IN_PROGRESS | `frontend/src/app/(dashboard)/store/requirements/page.tsx` has query/loading/empty UI, but returns a timed hard-coded array; the real API call is commented and pagination/filter/error are absent.
EP-002-QA-01 | IN_PROGRESS | `job-requirements.service.spec.ts` only checks forwarding one list filter; there is no pagination, empty-state, filter, or IDOR acceptance suite and frontend has no tests.
EP-003-FE-01 | IN_PROGRESS | `store/requirements/new/page.tsx` disables while submitting and renders a random mock conflict, but sends no concurrency token/API request, maps no field errors, and does not refetch.
EP-003-QA-01 | BLOCKED | No submit action tests cover roles, incomplete drafts, stale tokens, or repeated submit.
EP-004-FE-01 | BLOCKED | No approve action UI/mutation exists; current requirement pages only show a mock list and create form.
EP-004-QA-01 | BLOCKED | No approval transition, wrong-role/Area, stale, or repeat tests exist.
EP-005-FE-01 | BLOCKED | No rejection form/mutation/invalidation UI exists.
EP-005-QA-01 | BLOCKED | No rejection validation/state/scope or HQ-reject/edit transition tests exist.
EP-006-FE-01 | IN_PROGRESS | `frontend/src/app/(dashboard)/store/calendar/page.tsx` renders a hard-coded calendar/slots query, but uses no internal calendar API and has no loading/empty/error contract behavior.
EP-006-QA-01 | IN_PROGRESS | Slot specs cover only past-time rejection and a now-disabled timeline controller; no scope, JST, or large-result coverage exists and one controller spec fails.
EP-007-FE-01 | BLOCKED | No booking UI or request artifact exists; the calendar only creates mock slots.
EP-007-QA-01 | IN_PROGRESS | `schedules.service.spec.ts` covers only no-slot adjustment and the stale controller spec fails; winner/loser, cross-Store, scope, and retry races are absent.
EP-008-FE-01 | IN_PROGRESS | `frontend/src/app/surveys/[token]/page.tsx` uses an opaque path param, but simulates state by token substrings and timed local branches instead of a server resolver.
EP-008-QA-01 | IN_PROGRESS | Token specs cover only unknown-candidate generation; no brute-force, expiry, purpose isolation, or minimal-data tests exist.
EP-009-FE-01 | IN_PROGRESS | Survey page has Zod/form/loading state, but uses unapproved fields, timed mock submission, unconditional success redirect, and no authoritative car notice/outcome.
EP-009-QA-01 | IN_PROGRESS | Survey service/controller specs exercise one fail path but the controller spec currently fails; pass, replay, double-submit, blacklist, and duplicate branches are absent.
EP-010-FE-01 | BLOCKED | No frontend upload or import-run/results page exists.
EP-010-QA-01 | IN_PROGRESS | Master-data specs only verify the explicit upload stub/empty service; no file-error, restart, cross-worker, duplicate-delivery, or email-idempotency tests exist.
EP-011-FE-01 | BLOCKED | No approved RikuOp monitoring contract/UI artifact exists; absence of a direct call alone has no dedicated verification row.
EP-011-QA-01 | IN_PROGRESS | Webhook specs check only a happy-path mock URL/result; mechanism selection, replay/checkpoint, drift, retry exhaustion, and duplicate effects are untested.
EP-012-FE-01 | BLOCKED | No health-dependent UI or test proves health data is excluded from business state.
EP-012-QA-01 | BLOCKED | No Docker/staging/production probe tests exist.
WP-API-001-FE-01 | BLOCKED | No password-reset request or reset screen exists under `frontend/src/app`.
WP-API-001-QA-01 | IN_PROGRESS | A stale auth controller spec calls absent `forgotPassword` and fails; no request-to-reset-to-login, expiry, or replay test exists.
WP-API-002-FE-01 | BLOCKED | No HQ Store setup or assignment form exists.
WP-API-002-QA-01 | BLOCKED | No Store-create duplicate/Area/role/non-HQ/invariant tests exist.
WP-API-003-FE-01 | IN_PROGRESS | `frontend/src/app/(dashboard)/hq/exports/page.tsx` renders download cards, but generates a dummy CSV client-side and has no import-run result UI.
WP-API-003-QA-01 | BLOCKED | No export scope/encoding/empty-result/row-error tests exist.
WP-API-004-FE-01 | IN_PROGRESS | Requirement list/create screens exist, but both use mock data/calls; edit/detail/version behavior and real conflict recovery are absent.
WP-API-004-QA-01 | BLOCKED | No Store/channel uniqueness, stale edit, or current/published separation acceptance tests exist.
WP-API-005-FE-01 | IN_PROGRESS | Store calendar and HQ timeline pages exist, but both are hard-coded mock experiences with no real API or approved multi-manager UX.
WP-API-005-QA-01 | IN_PROGRESS | Slot service specs cover only a past start and a disabled timeline method; interval, multi-Store manager, booked cancel, and pagination coverage are missing.
WP-API-006-FE-01 | IN_PROGRESS | `store/schedules/[id]/result/page.tsx` has a result form, but submits a timed mock and there is no authoritative adjustment/token-result screen.
WP-API-006-QA-01 | IN_PROGRESS | Schedule specs contain a stale cancel acknowledgement and one no-slot branch; online/onsite/fail/lifecycle denial/side-effect coverage is absent.
WP-API-007-FE-01 | IN_PROGRESS | `hq/blacklist/page.tsx` has list/form UI, but all data and mutations are timed mocks and no duplicate-review/pagination/filter API exists.
WP-API-007-QA-01 | IN_PROGRESS | Candidate specs only cover missing contact and a stale controller call; normalization, false-positive, PII, and non-HQ tests are absent.
WP-API-008-FE-01 | IN_PROGRESS | `hq/notifications/page.tsx` renders masked-looking failure rows, but they are hard-coded and no contract API/filter is used.
WP-API-008-QA-01 | IN_PROGRESS | Notification spec only asserts persisted return after enqueue; exhausted visibility, worker idempotency, and masking are untested.
WP-API-009-FE-01 | IN_PROGRESS | No frontend source directly calls RikuOp, but there is no approved monitoring UI or static verification artifact proving the boundary.
WP-API-009-QA-01 | IN_PROGRESS | RikuOp outbound spec checks enqueue return only; mapping, transient retry, drift, and duplicate external effects are untested.
WP-API-010-FE-01 | IN_PROGRESS | `hq/candidates/new/page.tsx` has a manual registration form, but uses timed email-substring simulations and has no assignment/review API or generated types.
WP-API-010-QA-01 | IN_PROGRESS | Candidate tests cover one validation and a stale controller path, but no manual-assignment, authorization, fake-ID, or duplicate-effect flow.
WP-API-011-FE-01 | IN_PROGRESS | `candidates/[candidateId]/preferences/page.tsx` presents slot selection, but availability/submission are timed hard-coded mocks without candidate-token/state enforcement.
WP-API-011-QA-01 | BLOCKED | No safe-availability tests cover token/Store/state, 36h JST, leakage, or race recovery.
WP-API-012-FE-01 | IN_PROGRESS | Survey and preference pages exist, but survey always redirects to success and neither restores authoritative server outcome/state.
WP-API-012-QA-01 | IN_PROGRESS | Survey/schedule specs touch fail and no-slot branches, but no full fail/pass/timeout/double-submit/concurrent-slot scenario exists and the suite is red.
WP-API-013-FE-01 | IN_PROGRESS | `hq/requirements/[id]/history/page.tsx` renders versioned history, but uses a timed hard-coded audit array rather than the read-model API.
WP-API-013-QA-01 | BLOCKED | No history reject/edit/resubmit/self-approval/order/IDOR tests exist.
WP-API-014-FE-01 | IN_PROGRESS | Survey uses a path token, but `AuthContext.tsx` decodes/persists auth tokens and no shared public-credential storage/log/analytics sentinel exists.
WP-API-014-QA-01 | IN_PROGRESS | Token specs cover only generation for a missing Candidate; refresh/multi-tab/consume/expiry/revocation/replay/result-access tests are absent.

GLB-FE-02 | IN_PROGRESS | A responsive HQ shell exists in `hq/dashboard/page.tsx`, but AM/SM/Sub-SM dashboard routes referenced by `AuthContext` do not exist and there are no role/viewport tests.
GLB-FE-03 | IN_PROGRESS | `AuthContext` and the Axios 401 interceptor provide session scaffolding, but dashboard routes have no authenticated/role boundary and no four-role navigation matrix.
GLB-FE-04 | IN_PROGRESS | Login manually unwraps `response.data.data` and two interceptors read inconsistent `data.message`; no single normalized success/error parser or fixture tests exist.
GLB-FE-05 | BLOCKED | No shared Asia/Tokyo date utility exists; pages use hard-coded dates or client `Date/toISOString`, with no simulated-timezone tests.
GLB-FE-06 | IN_PROGRESS | React Query/provider/query keys and loading states exist, but business pages return mocks, invalidation is absent, and there are no cache/filter tests.
GLB-FE-07 | IN_PROGRESS | Public tokens remain in the route only, but auth tokens are persisted in JS-readable cookies and decoded client-side; no static or browser storage/log sentinel test exists.
EP-001-FE-02 | IN_PROGRESS | Login serializes `login_id/password` and uses a password input, but password policy differs from backend and no serialization/log/toast test exists.
EP-001-FE-03 | IN_PROGRESS | `AuthContext.login` decodes role from the JWT and redirects, but ignores a server response role, invents one-day cookie expiry, accepts cast roles, and targets missing AM/Store dashboards.
EP-001-FE-04 | IN_PROGRESS | Login shows a generic message and API interceptor handles 401, but no approved error-code rendering exists for inactive/expired/rate-limit and no fixture tests exist.
EP-002-FE-02 | IN_PROGRESS | Requirements page has a query key/list/loading/empty view, but no server pagination/sort/filter request; the API call is commented out.
EP-002-FE-03 | IN_PROGRESS | Mock rows render status and fields, but current/published DTO distinction and representative DTO tests are absent.
EP-002-FE-04 | BLOCKED | The list always renders New/Edit actions without role/state authorization handling; no 403 or role-state matrix exists.
EP-003-FE-02 | IN_PROGRESS | `isSubmitting` prevents repeat clicks and a random 409 banner exists, but no read token is serialized and conflict recovery is not a refetch policy.
EP-004-FE-02 | BLOCKED | No approve control, mutation, invalidation, or 403/transition/conflict UI exists.
EP-005-FE-02 | BLOCKED | No reject form, wire-field serialization, trim/whitespace validation, mutation, or invalidation exists.
EP-006-FE-02 | IN_PROGRESS | Store calendar renders statuses and a date grid, but uses local mock slots, is not Store/date API-driven, and has no candidate/internal DTO separation test.
EP-007-FE-02 | BLOCKED | No candidate booking request, version serialization, optimistic-state guard, or conflict refetch UI exists.
EP-008-FE-02 | IN_PROGRESS | Survey page renders valid/expired/consumed branches, but derives them from token substrings and lacks preparing/paused server discriminators or fixture tests.
EP-008-FE-03 | IN_PROGRESS | Token is an opaque path param, but is placed in a React Query key and there is no storage/log/network-metadata sentinel test.
EP-009-FE-02 | IN_PROGRESS | Survey has Zod/field/loading UI, but fields are locally invented and submission is a delay with no server field errors, car notice, or double-submit test.
EP-009-FE-03 | IN_PROGRESS | Submit always redirects to `/surveys/success`; no authoritative pass/fail/replay orchestration or preference gate exists.
EP-010-FE-02 | BLOCKED | No multipart upload form/request or invalid-file UX exists.
EP-010-FE-03 | BLOCKED | No import-run summary or row-result component/fixtures exist.
WP-API-001-FE-02 | BLOCKED | No reset-request operation/screen or known/unknown parity test exists.
WP-API-001-FE-03 | BLOCKED | No reset consume screen, password-policy form, lifecycle errors, or token-storage test exists.
WP-API-002-FE-02 | BLOCKED | No HQ Store form or generated serialization artifact exists.
WP-API-002-FE-03 | BLOCKED | No manager lookup/assignment UI, primary selection, or error handling exists.
WP-API-003-FE-02 | IN_PROGRESS | Export page triggers a download, but constructs the CSV locally from a data URI rather than consuming a backend artifact/content-disposition.
WP-API-003-FE-03 | BLOCKED | No import run/result polling, terminal-state, or reload UI exists.
WP-API-004-FE-02 | IN_PROGRESS | Create page has draft/submit buttons, but both pass through the same full Zod schema and timed mock; approved payload/schema distinctions are absent.
WP-API-004-FE-03 | BLOCKED | No current-versus-published detail rendering exists.
WP-API-004-FE-04 | IN_PROGRESS | A random mock conflict banner exists, but input preservation and approved reload/merge/discard policy are absent.
WP-API-004-FE-05 | IN_PROGRESS | HQ export page offers a mock requirement CSV, but no approved import/export operation or template compatibility exists.
WP-API-005-FE-02 | IN_PROGRESS | Store calendar is responsive and interactive, but fixed to September 2026, uses mock slots, has no JST/API behavior, and lint fails in this file.
WP-API-005-FE-03 | IN_PROGRESS | Slot form validates some fields and simulates overlap, but uses random/timed results, adds unsupported capacity, and has no real edit/close/cancel contract.
WP-API-005-FE-04 | IN_PROGRESS | HQ timeline has date/Area/Store controls, but filters a local four-row array client-side and has no manager filter or pagination.
WP-API-005-FE-05 | BLOCKED | No responsible-manager selection UI or multi-manager test exists.
WP-API-006-FE-02 | BLOCKED | No adjustment list/detail UI exists.
WP-API-006-FE-03 | IN_PROGRESS | Result page has a mock status mutation form, but no role/state lifecycle actions, conflict recovery, or query invalidation.
WP-API-006-FE-04 | BLOCKED | Existing result page is an internal edit form, not a candidate-safe token result view; no authoritative four-branch isolation UI exists.
WP-API-007-FE-02 | IN_PROGRESS | Blacklist form limits fields to email/phone/reason, but list/mutation are mocks, no auth/API contract is used, and no field-parity test exists.
WP-API-007-FE-03 | BLOCKED | No duplicate-review page, server pagination/filter, masked DTO rendering, or 403 test exists.
WP-API-008-FE-02 | IN_PROGRESS | Notification failure page is read-only and displays masked-looking values, but all rows are mock data and no approved filter/state API or masking test exists.
WP-API-010-FE-02 | IN_PROGRESS | Manual registration form omits a fake RikuOp ID and simulates duplicate/blacklist outcomes, but fields/outcomes are local mocks and no authorization/serialization tests exist.
WP-API-010-FE-03 | BLOCKED | No Candidate assign/reassign UI or scoped target data exists.
WP-API-011-FE-02 | IN_PROGRESS | Preference page renders a reduced slot shape, but fetches hard-coded slots without Passed/token state gate or safe-field fixture tests.
WP-API-011-FE-03 | IN_PROGRESS | Selection prevents duplicates and limits three in click order, but submission is a mock and there are no rank/reorder/shape tests.
WP-API-011-FE-04 | IN_PROGRESS | UI can reselect local slots, but has no server 36h eligibility, stale/booked refetch, JST, or no-slot adjustment behavior.
WP-API-012-FE-02 | IN_PROGRESS | Separate survey/preference routes exist, but no server state-machine orchestration or reload/multi-tab recovery exists; survey bypasses preference to success.
WP-API-013-FE-02 | IN_PROGRESS | History page renders version/order/actor/action/comment fields, but from hard-coded data with no self-approval representation or acceptance tests.
WP-API-014-FE-02 | IN_PROGRESS | Survey page handles locally simulated invalid/expired/consumed states, but has no shared server-driven purpose boundary or refresh/multi-tab/storage/log tests.
OPT-FE-02 | IN_PROGRESS | `GlobalErrorHandler.tsx` distinguishes 400/403/409 and reloads on conflict, but it attaches to global Axios rather than `apiClient`, blindly refreshes, and has no deterministic query invalidation tests.
GLB-QA-02 | BLOCKED | No OpenAPI snapshot, generated frontend types, or FE/BE drift test artifact exists.
WP-API-002-QA-02 | BLOCKED | No Store assignment UI/test exists to prove real lookup data or reject inactive/wrong-role managers.
WP-API-014-QA-02 | BLOCKED | No purpose-isolation test proves survey credentials cannot access results early.
NTF-QA-02 | IN_PROGRESS | Notification service spec verifies persistence/enqueue return only; it does not assert one logical occurrence per event/recipient/channel and producer keys are nondeterministic.
P4-07-QA-01 | BLOCKED | No inactivity/no-response processor spec or fake-clock late-submit/repeated-job/race test exists.
P6-03-QA-01 | IN_PROGRESS | Reminder spec only verifies an empty stale-query run; no fake clock, re-entry, missed-run, holiday, or cap coverage exists.
P6-04-QA-01 | BLOCKED | No T-24h JST, reschedule, or cancellation race test exists.
SCOPE-QA-01 | BLOCKED | No executable dependency/alias validator artifact exists; the tracker still contains package aliases such as `AUTH`, `PII`, and `NTF`.
AUTH-QA-01 | IN_PROGRESS | Current auth/token specs test only unknown user/candidate cases and auth service spec fails; expiry/replay/concurrency/revocation/password/session coverage is absent.
OPT-FE-01 | IN_PROGRESS | Requirement/slot pages disable submitting and show simulated conflicts, but send no real token and have no approved refetch/merge/discard behavior or tests.
OPT-QA-01 | BLOCKED | No deterministic same-token commit or stale slot update/book race test exists.
RVO-QA-01 | BLOCKED | No cross-requirement, orphan, duplicate-version, or invalid-published integrity test exists.
RVO-QA-02 | BLOCKED | No test proves published content remains stable after current draft changes.
SSI-QA-01 | BLOCKED | No Store mismatch, unassigned manager, or reassignment/reschedule race test exists.
NTF-QA-01 | IN_PROGRESS | Notification unit spec exercises enqueue happy path only; no fault injection around commit/enqueue/provider/redelivery exists.
IMP-QA-01 | BLOCKED | No durable import/restart/cross-container/corrupt-file/cleanup-race test exists; current specs only affirm the stub.
PII-QA-01 | BLOCKED | No sentinel scan across responses/logs/JSONB or access/retention/deletion test exists.
WRK-QA-01 | BLOCKED | No processor lifecycle, SIGTERM, crash/stall, Redis reconnect, or queue-isolation test exists.
AUD-QA-01 | BLOCKED | No `AuditInterceptor` test or injected business/audit failure, method coverage, GET exclusion, or system-actor test exists.
REM-QA-01 | IN_PROGRESS | Reminder spec covers only no stale rows; no fake-clock dedupe/consecutive/+3d/state/version/restart/cancelled-schedule matrix exists.
AUT-QA-01 | BLOCKED | No guard/classification matrix or public DTO leakage tests exist.
ERD-QA-01 | BLOCKED | No executable parity comparison among Prisma, migration, Mermaid, and Draw.io exists.
ERD-QA-02 | BLOCKED | No negative database integrity tests for mandatory relations exist.
STG-QA-01 | BLOCKED | No full-topology smoke, rolling restart, delayed-job, or import-file durability test exists.
SRCCTL-QA-01 | BLOCKED | No requirement transition test covers HQ reject/edit and the job-requirement spec only checks list forwarding.
SRCCTL-QA-02 | IN_PROGRESS | `schedules.service.spec.ts` covers the no-slot adjustment branch, but no matched-to-scheduled branch or canonical-flow integration test exists.
NS-QA-01 | BLOCKED | No executable unique-ID/dependency-resolution/namespace-collision checker or result exists.
SRC-ROUTE-QA-01 | BLOCKED | No generated route manifest file/test exists under backend tests; current controller specs instead call several disabled routes and fail.
IMPL-AUTH-FE-01 | IN_PROGRESS | Login calls `/auth/login`, but `AuthContext.tsx` still decodes JWT role, sets its own one-day cookie TTL, and redirects to missing role routes; no generated client or direct evidence row exists.
