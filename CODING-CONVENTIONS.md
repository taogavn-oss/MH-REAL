# CODING-CONVENTIONS.md — Quy chuẩn viết code Rakusai

## 1. Phạm vi áp dụng

Quy chuẩn này dẫn xuất từ stack và engineering decisions hiện có. Những chi tiết chưa được requirement xác định—package manager, monorepo layout, test runner, formatter config, JSON casing, branch/commit convention—không được tự coi là đã chốt.

## 2. Nguyên tắc chung

- Domain rule là authoritative; UI state không thay thế server validation.
- Một bounded context sở hữu aggregate và persistence access của nó.
- Giao tiếp context qua application service/interface hoặc domain event.
- Không truy cập trực tiếp repository/table của context khác để đi tắt use case.
- Không hardcode business data ở FE và không dùng URL query để giả candidate/pass/fail state.
- Không thêm dependency, provider, broker hoặc architectural pattern khi chưa có decision.
- Không ghi placeholder mơ hồ vào contract. Phần chưa có nguồn phải ghi rõ chưa định nghĩa và tạo issue/open item.

## 3. Naming

### Database

- Table/column: `snake_case`, plural table names đúng `DATABASE-SCHEMA.md`.
- Primary key: `id`; foreign key: `<entity>_id`.
- Timestamp: `*_at`; actor reference: `created_by`, `updated_by`.
- Boolean: tiền tố `is_` hoặc động từ có nghĩa rõ theo schema (`is_duplicate`, `allow_car_commute`).
- Enum persistence dùng lowercase values đúng registry; không trộn với UI labels uppercase.

### API

- Resource path dùng lowercase kebab/plural theo 12 endpoint hiện có, ví dụ `/job-requirements`, `/master-data`.
- Version prefix bắt buộc `/api/v1`.
- Query names đã xác định giữ nguyên: `page`, `pageSize`, `sort`, `storeId`, `status`, `date`.
- JSON body/resource casing chưa được requirement chốt. Không tự rename DB `snake_case` thành một wire name khác trước khi OpenAPI được duyệt.
- Error fields giữ `code`, `message`, `details`; envelope giữ `success`, `data`, `meta`, `error`.

### Domain

- Dùng thuật ngữ chuẩn: `JobRequirement`, `JobRequirementVersion`, `ApprovalAction`, `InterviewSlot`, `InterviewSchedule`, `Candidate`, `SurveyToken`, `SurveyResponse`, `BlacklistEntry`, `Notification`.
- Không dùng đồng thời `Applicant` và `Candidate` trong implementation mới nếu chúng cùng chỉ aggregate `Candidate`; nếu UI copy dùng “Applicant/Ứng viên”, map tại presentation boundary.
- State display label và persistence value phải map tường minh; không so sánh bằng label hiển thị.

## 4. Frontend — Next.js

- Dùng Next.js App Router theo stack đã chọn.
- Server state qua TanStack React Query; không copy server collections vào Zustand.
- Zustand chỉ dùng chọn lọc cho client state thực sự cần chia sẻ để tránh re-render không cần thiết.
- Form dùng react-hook-form và zod cho UX validation.
- BE DTO validation vẫn authoritative; không giả định request an toàn vì zod đã pass.
- Component UI dùng shadcn/ui, react-day-picker và lucide-react theo nhu cầu đã xác định.
- Styling dùng Tailwind và shared design-token config; không hardcode semantic color rải rác nếu token đã có.
- Animation dùng `motion` nhẹ và có mục đích; không làm thay đổi nghiệp vụ hoặc che trạng thái loading/error.
- HQ screen PC-first. AM/SM/Sub-SM screen mobile-first và render đúng trên PC. Candidate dùng webview không account.

### FE data handling

- Mọi business list/form/filter/status gọi REST API thật.
- Không tạo hardcoded arrays làm nguồn dữ liệu nghiệp vụ.
- Không đọc query param để quyết định candidate outcome hoặc bypass token flow.
- Parse normalized envelope tập trung; không special-case từng endpoint.
- Hiển thị loading, empty, authorization, validation, conflict và server failure riêng biệt.
- Khi optimistic conflict, re-fetch authoritative resource; không silent retry ghi đè.
- Date/time input/render theo Asia/Tokyo, không dựa vào browser local timezone.

## 5. Backend — NestJS và DDD

- Controller chỉ xử lý transport, DTO và gọi application use case.
- Application service orchestration authorization context, transaction boundary, domain operation và side-effect scheduling.
- Domain giữ invariant/state machine, không import NestJS, Prisma, BullMQ hoặc provider SDK.
- Infrastructure adapter hiện thực repository, queue, SMS/Email và RikuOp port.
- Mọi externally reachable endpoint đi qua uniform authentication/authorization chain, trừ public magic-link route được chỉ định rõ.
- Dùng custom `@Roles(...)`/`RolesGuard` và resource `ScopeGuard`; không viết authorization ad hoc chỉ trong controller.
- Scope check phải nằm trong query/use case để chặn IDOR, không chỉ filter ở FE.

### DTO và validation

- Dùng `class-validator`/`class-transformer` tại BE boundary.
- Reject comment bắt buộc sau trim.
- Validate state transition, store/area scope, date/time, URL và file input tại server.
- Candidate public token check gồm hash lookup, expiry, use state và ownership/isolation.
- Public routes dùng rate limiting.
- Không log raw password, raw magic token, secret hoặc payload nhạy cảm không cần thiết.

## 6. Persistence — Prisma/PostgreSQL

- Repository mapping tách domain object khỏi Prisma model.
- UUID primary key và constraints phải theo `DATABASE-SCHEMA.md`.
- Không tự thêm/đổi column để phục vụ DTO chưa được xác nhận.
- JSONB payload vẫn cần schema validation ở application boundary; JSONB không có nghĩa là chấp nhận object tùy ý.
- Query filter/sort chỉ cho phép field được allowlist.
- State transition phải được kiểm tra lại trong transaction khi có concurrent writer.
- Mọi timestamp persist UTC; chuyển Asia/Tokyo ở application/presentation boundary.

### Transaction

- Slot booking là một transaction: row lock → verify `open` → create schedule → update `booked` → commit.
- Không gửi Email/SMS hoặc call RikuOp bên trong transaction dài; persist/enqueue side effect sau consistency decision theo cơ chế đã thiết kế.
- Requirement edit dùng optimistic version và reject stale write.
- Không dùng BullMQ thay thế transaction/lock.
- FK delete behavior, isolation level và overlap constraint chưa được nguồn chốt; không tự coi là convention.

## 7. State machine

- Centralize transition rules trong domain, không rải comparison ở controller/component.
- Invalid transition luôn bị BE reject.
- Requirement không được từ `draft` sang `approved_hq` trực tiếp.
- AM không approve requirement `draft` hoặc `approved_hq`.
- Interview completed không được cancel theo rule bổ sung hiện có.
- Published requirement và draft version phải được phân biệt bằng pointer/version, không overwrite.
- Mismatch state đã ghi trong issues phải được quyết định trước khi code enum/migration.

## 8. Queue và background job

- Queue names: `notification-queue`, `matching-queue`, `reminder-queue`, `rikuop-sync-queue`, `import-queue`.
- Job payload phải chứa identifier cần thiết, không copy toàn bộ mutable aggregate nếu worker có thể re-read authoritative DB state.
- Mọi notification có persisted deterministic `idempotency_key`.
- Retry/backoff phải bounded; final failure persist `failed` và visible cho HQ.
- Repeatable reminder kiểm tra authoritative state trước mỗi send và remove/stop khi state không còn phù hợp.
- Cancelled schedule không được gửi interview reminder.
- Matching queue chỉ chọn slot để thử; actual booking vẫn qua DB transaction.
- Audit log ghi đồng bộ, không defer qua queue.
- Không thêm Kafka, SNS/SQS hoặc event sourcing trong phạm vi hiện tại.

## 9. RikuOp adapter

- Payload ngoài chỉ tồn tại trong integration adapter/DTO.
- Map sang internal Candidate/Requirement/Schedule model trước khi gọi domain.
- Inbound authentication/signature phải theo final contract; hiện chưa được tự định nghĩa.
- Outbound status, memo và interview set/change/cancel phải qua cùng adapter.
- Ghi request/response outcome và contract-shape mismatch vào `rikuop_sync_logs`.
- Retry/backoff qua BullMQ; không tạo retry mechanism song song.

## 10. Security và configuration

- Password hash: bcrypt hoặc argon2; không plaintext.
- Secrets trong environment variables/AWS Secrets Manager.
- Dependency config qua một `ConfigService`; không branch theo environment trong domain/application logic.
- Áp dụng helmet, hpp, sanitizer, express-rate-limit và compression theo global setup.
- Structured log có request ID.
- PII/token/password phải được redact theo policy cần xác nhận; trong lúc chưa có policy, không log raw sensitive values.

## 11. Audit và logging

- Global interceptor ghi POST/PUT/PATCH/DELETE, loại GET.
- Audit record gồm actor, role, action, entity, before/after, request origin và timestamp theo schema.
- System job cho phép `actor_id = null` và phải có action/entity rõ.
- Application log và audit log có mục đích khác nhau; không dùng operational log thay audit trail.
- Không ghi successful completion trước khi transaction commit.

## 12. Testing convention theo requirement

Mỗi use case phải có test phù hợp với rủi ro:

- Happy path và required validation.
- RBAC và resource scope/IDOR.
- Allowed/invalid state transition.
- Token expiry, reuse và candidate data isolation.
- Optimistic stale write và row-lock/double-book race.
- Queue idempotency, retry exhaustion và cancelled-state suppression.
- Timezone tại ranh giới UTC ↔ Asia/Tokyo.
- RikuOp payload mapping/contract mismatch khi contract được xác nhận.

Smoke flow chuẩn: HQ master data/blacklist → SM slots/requirement → AM approve → HQ approve → candidate survey → preferred slots → SM booking → candidate result.

Test không được dùng mock business data trong production UI. Requirement không cấm fixture/test double trong automated test; phạm vi và công cụ test chưa được nguồn xác định.

## 13. Documentation sync

- Đổi API wire contract: cập nhật OpenAPI và `API-CONTRACT.md`.
- Đổi table/enum/constraint: cập nhật migration/Prisma và `DATABASE-SCHEMA.md`.
- Đổi module/data flow: cập nhật `ARCHITECTURE.md` và decision nếu cần.
- Đổi requirement đã được xác nhận: cập nhật `PROJECT-DETAIL.md`, task và issue liên quan.
- Không đánh dấu task/issue resolved nếu không có link/file/test/log làm bằng chứng.

