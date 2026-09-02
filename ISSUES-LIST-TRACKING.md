# ISSUES-LIST-TRACKING.md — Danh sách vấn đề và tiến độ xử lý

## 1. Quy ước

File này theo dõi vấn đề có bằng chứng từ requirement. Repository hiện chưa có application code, vì vậy không có runtime bug nào được khẳng định.

| Status | Ý nghĩa |
|---|---|
| `OPEN` | Cần quyết định hoặc xử lý |
| `BLOCKED` | Không thể xử lý nếu chưa có input/contract bên ngoài |
| `RESOLVED` | Đã có quyết định/bằng chứng resolution |
| `SUPERSEDED` | Nội dung nguồn thấp hơn đã bị nguồn ưu tiên thay thế |

Priority: `P0` security/data-loss/release blocker; `P1` core contract/flow; `P2` design/operability; `P3` documentation cleanup.

## 2. Source conflicts

| ID | Priority | Vấn đề | Nguồn | Tác động | Status | Resolution/bằng chứng |
|---|---|---|---|---|---|---|
| SRC-001 | P1 | `RULE.md` yêu cầu toàn hệ thống Desktop-only; tài liệu ưu tiên yêu cầu HQ PC-first và AM/SM/Sub-SM mobile-first | `RULE.md` §1.2 vs Design §1.2, §3.1, §7.2 | Responsive scope không thể đồng thời thỏa hai hướng | SUPERSEDED | Người dùng xác nhận ưu tiên `Rakusai-System-Database-Design.md` ngày 2026-09-02 |
| SRC-002 | P1 | `RULE.md` loại bỏ toàn bộ RikuOp; tài liệu ưu tiên đưa RikuOp vào scope/core module/DB/queue | `RULE.md` §1.4 vs Design §1.3, §4.7, §6 | Thay đổi module, schema, API và background jobs | SUPERSEDED | Người dùng xác nhận ưu tiên tài liệu Design ngày 2026-09-02 |
| SRC-003 | P2 | `RULE.md` nêu interview reminder trước 1 ngày / 2 giờ; tài liệu ưu tiên và queue diagram chỉ định 1 ngày/T-24h | Rule Luồng 6.3 vs Design §3.6 và queue Draw.io | Có thể gửi thêm reminder không có trong nguồn ưu tiên | SUPERSEDED | Baseline hiện dùng 1 ngày theo nguồn ưu tiên; 2 giờ không được đưa vào contract |
| SRC-004 | P1 | `RULE.md` dùng approval labels `DRAFT`, `PENDING_AM_REVIEW`, `PENDING_HQ_REVIEW`, `HQ_APPROVED`, `AM_REJECTED`; schema ưu tiên dùng enum khác | Rule Luồng 3 vs Design §6.3 | FE/BE có thể lệch state value | RESOLVED | Persistence registry dùng enum của Design; API wire enum vẫn cần formalize tại API-002 |
| SRC-005 | P1 | `RULE.md` dùng `ApplicantSurveyAnswer`, `ApplicantSlotPreference`, `Interview`; schema ưu tiên dùng `candidate_survey_responses`, JSONB `preferred_dates`, `interview_schedules` | Rule Luồng 5–6 vs Design §6 | Có thể tạo bảng trùng nghĩa | RESOLVED | Không tạo bảng mới; dùng 19 bảng của nguồn ưu tiên |

## 3. Open items từ requirement ưu tiên

| ID | Priority | Nội dung | Mốc cần xác nhận | Status | Resolution |
|---|---|---|---|---|---|
| OPN-001 | P2 | HQ-only PC screen visual design direction | Trong design | OPEN | Chưa có trong nguồn |
| OPN-002 | P1 | UX để HQ chọn responsible SM khi thêm slot cho Store nhiều manager | Trong design | OPEN | Chưa có trong nguồn |
| OPN-003 | P2 | Reference design cho smartphone schedule-setting calendar | Trong design | OPEN | Chưa có trong nguồn |
| OPN-004 | P2 | Requirement list unified hay tách “in progress” và “regular” | Trong design | OPEN | Chưa có trong nguồn |
| OPN-005 | P1 | Job requirement import file format | Trước implementation | BLOCKED | Chờ client data sample |
| OPN-006 | P1 | Master-data link import/export file format | Trước implementation | BLOCKED | Chờ client data sample |
| OPN-007 | P1 | Reminder send-volume caps, send-time windows và holiday handling | Trước implementation | BLOCKED | Chờ business confirmation |
| OPN-008 | P1 | Legacy system cutover date | Trước release | BLOCKED | Chờ client quyết định |
| OPN-009 | P1 | Block, prefecture và legal-representative field mapping | Trước master-data schema freeze | BLOCKED | Chờ master-data template |
| OPN-010 | P1 | RikuOp inbound dùng webhook hay polling | Trước integration implementation | BLOCKED | Chờ final RikuOp contract |
| OPN-011 | P2 | Production Web dùng Vercel hay CloudFront + S3 | Trước infrastructure implementation | OPEN | Cả hai đang là option trong source |
| OPN-012 | P2 | Staging dùng Docker Compose hay single ECS service | Trước staging setup | OPEN | Cả hai đang là option trong source |

## 4. API contract gaps

| ID | Priority | Gap có bằng chứng | Tác động | Status | Điều kiện đóng |
|---|---|---|---|---|---|
| API-001 | P1 | Chưa có DTO request/response đầy đủ cho 12 representative endpoints | FE/BE có thể tự đặt field khác nhau | OPEN | OpenAPI được duyệt và client types dùng cùng schema |
| API-002 | P1 | Chưa chốt JSON naming và wire enum; DB snake_case, query có camelCase, Rule dùng uppercase labels | Field/state mismatch | OPEN | Naming + state mapping ghi trong OpenAPI/contract test |
| API-003 | P0 | Chưa có auth transport, session/JWT TTL/refresh, login lockout và reset-password endpoint/TTL | Security implementation không có contract | OPEN | Security/auth contract được duyệt |
| API-004 | P1 | Stale version/slot conflict chưa có HTTP status và error code | FE không có deterministic recovery | OPEN | Error catalog và conflict contract được duyệt |
| API-005 | P1 | `rejection_reason` trong Rule và `approval_actions.comment` trong DB chưa có wire mapping | Reject FE/BE lệch field | OPEN | Request DTO chính thức được duyệt |
| API-006 | P1 | Public survey resolve chưa có safe response fields/branch discriminator | Có nguy cơ lộ PII hoặc FE suy diễn state | OPEN | Candidate-safe response DTO và tests được duyệt |
| API-007 | P1 | RikuOp payload, auth/signature, retry boundaries chưa có final contract | Không thể hoàn tất integration an toàn | BLOCKED | RikuOp sign-off |
| API-008 | P2 | Health endpoint auth policy và component response chưa định nghĩa | Monitoring/deployment probe không thống nhất | OPEN | Health contract được duyệt |
| API-009 | P1 | Import multipart fields, file limits và row-error response chưa định nghĩa | FE upload/BE importer không thể khóa contract | BLOCKED | Đóng OPN-005/006 và publish OpenAPI |

## 5. Database/domain gaps

| ID | Priority | Gap có bằng chứng | Tác động | Status | Điều kiện đóng |
|---|---|---|---|---|---|
| DB-001 | P1 | Domain có `Interview Adjustment Needed`; `candidates.status` enum không có value tương ứng | Matching no-slot không persist được đúng state | OPEN | Chốt persistence value/mapping và migration |
| DB-002 | P1 | Rule có slot `CANCELLED`; `interview_slots.status` chỉ có `open`, `booked`, `closed` | Cancel flow không có state contract thống nhất | OPEN | Chốt dùng `closed`, thêm value hay soft-delete mechanism |
| DB-003 | P1 | Unique `(sm_user_id, slot_date, start_time)` không chặn hai interval khác start nhưng overlap | Manager có thể bị chồng lịch | OPEN | Chốt DB exclusion/transaction overlap strategy và concurrency test |
| DB-004 | P1 | Rule “exactly one primary SM per Store” chưa có constraint được mô tả | Có thể có 0 hoặc nhiều primary manager | OPEN | Chốt DB/application invariant và test |
| DB-005 | P2 | Global principle nói mọi table có created/updated actor/time; definitions của nhiều bảng thiếu một phần | Audit schema không nhất quán | OPEN | Xác nhận danh sách audit columns trên từng table trước migration |
| DB-006 | P1 | `candidates.rikuop_candidate_id` NOT NULL nhưng candidate có thể HQ manual registration | Manual candidate không có external ID rõ ràng | OPEN | Chốt nullable/synthetic/mapping policy |
| DB-007 | P1 | Blacklist Rule yêu cầu Kanji/Kana, DOB, primary/secondary email và matching `(Kana + DOB)`; schema chỉ có `full_name`, `phone`, `email`, `reason` | Không thực hiện đủ matching flow bổ sung | OPEN | Chốt field ưu tiên/schema extension dựa trên business confirmation |
| DB-008 | P2 | Requirement↔Version có circular references | Migration/insert order cần xử lý | OPEN | Chốt Prisma relation và migration/transaction strategy |
| DB-009 | P1 | Store stopping/closing branch được module mô tả nhưng `publish_status` chỉ có draft/published/unpublished | Candidate pause branch thiếu state mapping | OPEN | Chốt mapping hoặc enum change |
| DB-010 | P2 | Queue behavior nêu dead-letter state visible to HQ nhưng notification enum chỉ có `failed` | UI/worker có thể hiểu khác nhau | OPEN | Chốt failed là terminal visible state hay bổ sung DLQ representation |

## 6. Security, logic và concurrency risks cần test

Các mục này là risk/test obligation, chưa phải runtime bug.

| ID | Priority | Risk | Required evidence để đóng | Status |
|---|---|---|---|---|
| RSK-001 | P0 | IDOR: SM truy cập Store khác hoặc AM duyệt ngoài Area | BE scope tests cho read/write/approve | OPEN |
| RSK-002 | P0 | Candidate token expiry/replay/brute force/data leakage | Expiry, reuse, rate-limit và isolation tests | OPEN |
| RSK-003 | P0 | Concurrent booking tạo hai schedule cho một slot | Transaction-level race test | OPEN |
| RSK-004 | P1 | SM/Sub-SM stale edit silent overwrite | Optimistic concurrency test | OPEN |
| RSK-005 | P1 | Reject reason rỗng/toàn khoảng trắng | DTO/domain validation tests | OPEN |
| RSK-006 | P1 | Invalid approval state transition | Full transition matrix tests | OPEN |
| RSK-007 | P1 | Reminder gửi trùng hoặc gửi cho cancelled schedule | Idempotency + cancellation tests | OPEN |
| RSK-008 | P1 | UTC/JST conversion làm lệch business date/time | Boundary/DST-independent Asia/Tokyo tests | OPEN |
| RSK-009 | P1 | Import partial failure/duplicate FK handling không đúng | Transaction và row-result tests sau khi format chốt | BLOCKED |
| RSK-010 | P1 | RikuOp contract drift hoặc retry tạo duplicate effect | Adapter contract/idempotency tests sau sign-off | BLOCKED |
| RSK-011 | P1 | Store chưa có manager nhưng requirement cần HQ tạo/approve | HQ-managed Store flow test | OPEN |
| RSK-012 | P2 | Timeline data quá lớn làm UI không phản hồi | Date filter/pagination performance evidence | OPEN |

## 7. Change log

| Date | Change | Evidence |
|---|---|---|
| 2026-09-02 | Khởi tạo issue register từ 4 requirement sources; chưa ghi runtime bug | Current repository chỉ chứa requirement/documentation |
| 2026-09-02 | Đóng source precedence cho mobile và RikuOp | Xác nhận trực tiếp của người dùng; ADR-001 |

