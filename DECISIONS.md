# DECISIONS.md — Nhật ký quyết định kỹ thuật

## 1. Quy ước

Trạng thái sử dụng:

- `ACCEPTED`: đã được nguồn requirement hoặc người dùng xác nhận.
- `SUPERSEDED`: từng xuất hiện nhưng đã bị quyết định ưu tiên khác thay thế.
- `OPEN`: chưa phải quyết định; chỉ dùng trong danh sách open item, không triển khai như fact.

Mỗi ADR ghi bối cảnh, quyết định, hệ quả và nguồn. File này không tự tạo requirement mới.

## ADR-001 — Thứ tự ưu tiên nguồn

- **Status:** ACCEPTED
- **Context:** `RULE.md` mâu thuẫn với tài liệu thiết kế ở mobile scope và RikuOp scope.
- **Decision:** `Rakusai-System-Database-Design.md` là nguồn ưu tiên cao nhất. `RULE.md` và hai Draw.io chỉ bổ sung/kiểm chứng khi không mâu thuẫn.
- **Consequences:** Giữ mobile-first cho AM/SM/Sub-SM và giữ RikuOp Integration. Source conflict được theo dõi thay vì trộn nội dung.
- **Source:** Xác nhận trực tiếp của người dùng ngày 2026-09-02.

## ADR-002 — Kiến trúc bốn lớp và DDD bounded contexts

- **Status:** ACCEPTED
- **Context:** Domain cần độc lập với HTTP, queue, cron và provider hạ tầng.
- **Decision:** Dùng Presentation → Application → Domain → Infrastructure. Backend chia theo Identity & Access, Master Data, Recruitment Requirement, Scheduling, Candidate Engagement, Notification và RikuOp Integration.
- **Consequences:** Module giao tiếp qua application service hoặc domain event; không truy cập chéo database tùy tiện.
- **Source:** `Rakusai-System-Database-Design.md` §2.2–2.3.

## ADR-003 — Technology stack

- **Status:** ACCEPTED
- **Context:** Dự án cần stack thống nhất cho web, API, persistence và background job.
- **Decision:** Next.js App Router v16+, Tailwind CSS, TanStack React Query, Zustand, shadcn/ui, react-hook-form/zod; NestJS DDD, Prisma/PostgreSQL, class-validator; Redis/BullMQ.
- **Consequences:** Không thay stack hoặc thêm hạ tầng tương đương khi chưa có quyết định mới.
- **Source:** `Rakusai-System-Database-Design.md` §2.1.

## ADR-004 — Trải nghiệm theo actor

- **Status:** ACCEPTED
- **Context:** Các role vận hành trên thiết bị khác nhau.
- **Decision:** HQ là PC-first; AM/SM/Sub-SM là mobile-first với PC layout; Candidate dùng webview qua dedicated URL, không có account.
- **Consequences:** Responsive scope phải bao phủ daily operations của AM/SM/Sub-SM. Candidate auth không được thiết kế như internal auth.
- **Source:** `Rakusai-System-Database-Design.md` §3.1, §7.2.

## ADR-005 — Internal identity, RBAC, scope guard và audit

- **Status:** ACCEPTED
- **Context:** Shared login không đảm bảo accountability và UI-only authorization tạo IDOR risk.
- **Decision:** HQ/AM/SM/Sub-SM có account cá nhân; dùng RolesGuard và ScopeGuard. Global interceptor ghi mọi mutating request, loại GET.
- **Consequences:** Query phải bị giới hạn theo store/area ở BE; audit có actor và before/after data.
- **Source:** `Rakusai-System-Database-Design.md` §4.1, §7.1; `RULE.md` §2 Luồng 1 và §3.A cho phần không mâu thuẫn.

## ADR-006 — Candidate access bằng magic link

- **Status:** ACCEPTED
- **Context:** Candidate không được cấp account nhưng phải truy cập survey/result/reminder an toàn.
- **Decision:** Dùng opaque signed, time-limited token; DB lưu `token_hash`, kiểm tra `expires_at` và `used_at` server-side.
- **Consequences:** Public endpoint phải rate limited và không làm lộ dữ liệu candidate khác.
- **Source:** `Rakusai-System-Database-Design.md` §4.1, §4.5, §6.3; `RULE.md` §2 Luồng 5 và §3.C.

## ADR-007 — Version hóa Recruitment Requirement

- **Status:** ACCEPTED
- **Context:** Draft mới phải cùng tồn tại với published content và mọi approval action cần traceable.
- **Decision:** `job_requirements` giữ state/pointer; content nằm trong immutable `job_requirement_versions.payload`; action nằm trong append-only `approval_actions`.
- **Consequences:** Sửa approved requirement tạo version mới; candidate tiếp tục thấy `published_version_id` cho tới khi version mới approved.
- **Source:** `Rakusai-System-Database-Design.md` §3.3, §4.3, §6.3.

## ADR-008 — JSONB cho nội dung có cấu trúc nhưng đang tiến hóa

- **Status:** ACCEPTED
- **Context:** Requirement fields, survey questions, notification payload và location information còn có thể thay đổi.
- **Decision:** Dùng JSONB cho các vùng được chỉ định; status/store/date và field vận hành cần filter/sort vẫn là typed column.
- **Consequences:** Thêm field nội dung không luôn cần migration, nhưng application schema vẫn phải validate và contract phải được xác nhận.
- **Source:** `Rakusai-System-Database-Design.md` §4.3, §4.5, §6.1, §7.6.

## ADR-009 — UUID và junction table

- **Status:** ACCEPTED
- **Context:** Cần key không tuần tự và quan hệ Store↔SM, Area↔AM có khả năng mở rộng cardinality.
- **Decision:** Dùng surrogate UUID primary key; dùng `store_manager_assignments` và `area_manager_assignments`.
- **Consequences:** Không đưa assignment thành một foreign key đơn trên `stores` hoặc `areas`.
- **Source:** `Rakusai-System-Database-Design.md` §3.2, §6.1–6.3.

## ADR-010 — Slot thuộc responsible SM và booking transaction

- **Status:** ACCEPTED
- **Context:** Một SM có thể quản lý nhiều store, gây xung đột lịch xuyên store và race khi HQ/SM cùng book.
- **Decision:** Slot có `sm_user_id`; unique `(sm_user_id, slot_date, start_time)`; booking dùng `SELECT ... FOR UPDATE` trong transaction và optimistic `version` cho UI read-modify-write.
- **Consequences:** Transaction commit đầu tiên thắng; request sau fail và re-fetch. Không dùng queue để thay thế booking transaction.
- **Source:** `Rakusai-System-Database-Design.md` §3.5, §4.4, §6.4; `rakusai_redis_bullmq_flows.drawio`.

## ADR-011 — Notification outbox và BullMQ idempotency

- **Status:** ACCEPTED
- **Context:** Notification không được mất hoặc gửi trùng khi retry/redelivery.
- **Decision:** Persist `notifications` với lifecycle `scheduled` → `sent`/`failed`, deterministic unique `idempotency_key`, BullMQ worker và bounded retry/backoff.
- **Consequences:** Hết retry phải visible cho HQ; internal và candidate notification dùng chung module.
- **Source:** `Rakusai-System-Database-Design.md` §3.6, §4.6, §4.8, §7.4; queue Draw.io.

## ADR-012 — RikuOp anti-corruption layer

- **Status:** ACCEPTED
- **Context:** Contract ngoài có thể thay đổi và không được làm nhiễu domain model.
- **Decision:** Adapter riêng cho inbound/outbound mapping, contract-shape check và `rikuop_sync_logs` cho mọi call/outcome.
- **Consequences:** Webhook hay polling vẫn phụ thuộc final contract; outbound retry dùng BullMQ.
- **Source:** `Rakusai-System-Database-Design.md` §4.7, §7.5.

## ADR-013 — REST API versioning và response normalization

- **Status:** ACCEPTED
- **Context:** FE/BE cần tránh special case và lệch contract.
- **Decision:** Prefix/version `/api/v1`; response envelope có `success`, `data`, `meta`, `error`; error có `code`, `message`, `details`; list dùng `page`, `pageSize`, `sort` và resource filters.
- **Consequences:** FE dùng một parsing/error strategy; BE validate mọi input bằng DTO.
- **Source:** `Rakusai-System-Database-Design.md` §5.1.

## ADR-014 — Timezone strategy

- **Status:** ACCEPTED
- **Context:** Nghiệp vụ vận hành tại Nhật và client có thể ở timezone khác.
- **Decision:** Chuẩn hóa business logic/hiển thị theo `Asia/Tokyo` (JST/UTC+9), persist timestamp theo UTC.
- **Consequences:** Không xử lý business date bằng timezone local của browser/server.
- **Source:** `Rakusai-System-Database-Design.md` §2.1; `RULE.md` §3.E.

## ADR-015 — Deployment và configuration abstraction

- **Status:** ACCEPTED
- **Context:** Local/staging và production dùng provider khác nhau nhưng application code không được branch theo môi trường.
- **Decision:** Docker Compose cho local/staging; production dùng ECS Fargate cho API, Vercel hoặc CloudFront+S3 cho Web, RDS PostgreSQL, ElastiCache Redis và AWS Secrets Manager. Dependency resolve qua `ConfigService`/environment.
- **Consequences:** Chuyển provider bằng configuration, không bằng conditional domain logic.
- **Source:** `Rakusai-System-Database-Design.md` §2.4, §7.1.

## ADR-016 — Không dùng mock business data và Role Switcher

- **Status:** ACCEPTED
- **Context:** `RULE.md` cấm dữ liệu giả ở FE và loại Role Switcher; các điểm này không mâu thuẫn nguồn ưu tiên.
- **Decision:** UI nghiệp vụ dùng REST API/database thật; không dùng URL query để giả lập candidate state; không có dropdown chuyển role nhanh.
- **Consequences:** Mỗi account điều hướng theo role và vẫn phải được guard ở FE/BE.
- **Source:** `RULE.md` §1.1 và §1.3.

## ADR-017 — Không dùng Redis cho thao tác cần phản hồi transaction tức thời

- **Status:** ACCEPTED
- **Context:** Booking, concurrent requirement edit và audit cần kết quả đồng bộ.
- **Decision:** Booking dùng PostgreSQL lock/transaction; requirement edit dùng optimistic locking; audit ghi đồng bộ qua interceptor. Không thêm Kafka, SNS/SQS hoặc event sourcing ở phạm vi hiện tại.
- **Consequences:** BullMQ chỉ điều phối background work đã xác định, không thay thế consistency boundary của database.
- **Source:** `rakusai_redis_bullmq_flows.drawio`.

## Các quyết định còn mở

Các mục dưới đây chưa có resolution và không được triển khai như quyết định:

| ID | Nội dung | Cần xác nhận |
|---|---|---|
| OPEN-001 | HQ-only PC visual design direction | Trong design |
| OPEN-002 | UX để HQ chọn SM khi thêm slot cho store nhiều manager | Trong design |
| OPEN-003 | Reference design của smartphone schedule-setting calendar | Trong design |
| OPEN-004 | Unified requirement list hay tách in-progress/regular | Trong design |
| OPEN-005 | Job requirement import file format | Trước implementation |
| OPEN-006 | Master-data link import/export format | Trước implementation |
| OPEN-007 | Reminder caps, send windows và holiday handling | Trước implementation |
| OPEN-008 | Legacy/new-system cutover date | Trước release |
| OPEN-009 | RikuOp inbound webhook hay polling | Khi integration contract được ký xác nhận |

