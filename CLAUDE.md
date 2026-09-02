# CLAUDE.md — Hướng dẫn AI cho dự án Rakusai

## 1. Mục đích

File này quy định cách AI đọc requirement và làm việc trong dự án Rakusai. Mọi thay đổi phải bảo toàn nghiệp vụ, thuật ngữ, contract và phạm vi đã được xác lập; không tự bổ sung phần chưa có cơ sở.

## 2. Thứ tự ưu tiên nguồn

Khi đọc hoặc triển khai requirement, dùng thứ tự sau:

1. `Rakusai-System-Database-Design.md` — nguồn chuẩn ưu tiên cao nhất.
2. `RULE.md` — bổ sung rule triển khai, test matrix, edge case và security checklist khi không mâu thuẫn với nguồn số 1.
3. `rakusai_er_diagram.drawio` — kiểm chứng trực quan entity, field và quan hệ.
4. `rakusai_redis_bullmq_flows.drawio` — kiểm chứng queue, trigger, worker và kết quả ghi DB.
5. Bộ tài liệu dẫn xuất tại thư mục gốc — dùng để triển khai nhưng không được ghi đè nguồn requirement phía trên.

Nếu có mâu thuẫn:

- Không hòa trộn hai cách hiểu.
- Giữ nội dung của nguồn có ưu tiên cao hơn.
- Ghi vấn đề vào `ISSUES-LIST-TRACKING.md` với nguồn, tác động và trạng thái.
- Không biến nội dung chưa xác nhận thành quyết định kỹ thuật.

Hệ quả đã chốt: giữ mobile-first cho AM/SM/Sub-SM và giữ RikuOp Integration. Các chỉ thị PC-only hoặc loại bỏ RikuOp trong `RULE.md` không phải requirement hiện hành.

## 3. Phạm vi hệ thống

Rakusai là hệ thống quản lý tuyển dụng của MH Holdings, gồm:

- Identity, Access & Audit.
- Master Data cho Area, Store, AM, SM và Sub-SM.
- Recruitment Requirement và luồng phê duyệt SM/Sub-SM → AM → HQ.
- Scheduling cho interview slot và interview schedule.
- Candidate Engagement qua magic link, survey, blacklist/deduplication và kết quả.
- Notification qua SMS/Email.
- RikuOp Integration cho inbound candidate và outbound status/schedule sync.

Không đưa vào phạm vi: migration dữ liệu lịch sử, automatic monthly approval reset, IP-based access restriction, email URL lookup screen và candidate account/login.

## 4. Quy tắc bắt buộc trước khi thay đổi

1. Đọc file nguồn liên quan và tài liệu contract tương ứng.
2. Xác định actor, data scope và state hiện tại của use case.
3. Kiểm tra endpoint/field đã được định nghĩa chưa.
4. Kiểm tra transaction, concurrency và idempotency nếu có ghi dữ liệu.
5. Kiểm tra notification, audit log và RikuOp sync là hậu quả của use case hay không.
6. Nếu thiếu contract, ghi nhận thiếu định nghĩa; không tự đặt field hoặc hành vi.
7. Cập nhật đồng bộ tài liệu liên quan khi contract được người có thẩm quyền xác nhận thay đổi.

## 5. Quy tắc nghiệp vụ cốt lõi

### Actor và data scope

- `HQ`: toàn bộ store và candidate; quản lý master data, blacklist, requirement và schedule toàn hệ thống.
- `AM`: area được phân công; approve/reject requirement trong area. Khi AM quản lý trực tiếp một store và tự submit requirement, bước AM được auto-approved rồi chuyển sang Pending HQ Review.
- `SM`: store được phân công; author/edit/submit requirement, mở slot và điều chỉnh schedule.
- `Sub-SM`: quyền giống SM trên shared store requirement.
- `Candidate`: không có account; chỉ truy cập survey/result/reminder của chính mình qua signed, time-limited magic link.

Enforce scope ở cả FE route guard và BE. BE `ScopeGuard`/query scope là lớp quyết định; ẩn UI không thay thế authorization. Chặn IDOR cho store, area, requirement, slot, schedule và candidate.

### Recruitment Requirement

- Tối đa một `job_requirements` cho mỗi cặp `(store_id, channel)`.
- Content nằm trong immutable `job_requirement_versions.payload`.
- Published version và in-progress version phải cùng tồn tại được.
- State hợp lệ: `draft`, `pending_am`, `approved_am`, `pending_hq`, `approved_hq`, `rejected`.
- Reject bắt buộc có comment không rỗng/toàn khoảng trắng.
- Không cho phép nhảy cóc approval state.
- Sửa requirement đã approved tạo version mới và đưa phần đang sửa về Draft; published version cũ vẫn là nội dung candidate thấy.

### Candidate

- Intake từ RikuOp hoặc HQ manual registration.
- Normalize dữ liệu rồi kiểm tra duplicate và blacklist trước khi gửi survey.
- Candidate không được tạo user account.
- Token phải opaque, lưu dạng hash, kiểm tra expiry server-side và áp dụng single-use khi flow yêu cầu.
- Candidate-facing public endpoints phải rate limited.
- Slot trong 36 giờ tới không hiển thị cho candidate.
- Không có slot phù hợp phải chuyển sang Interview Adjustment Needed, không tạo dead end.

### Scheduling và concurrency

- Slot gắn với `sm_user_id` và `store_id`; availability của SM phải nhất quán trên mọi store họ quản lý.
- Chống trùng bằng unique constraint `(sm_user_id, slot_date, start_time)` theo thiết kế hiện tại.
- Booking dùng một DB transaction: lock row → xác nhận `open` → tạo schedule → đổi slot thành `booked`.
- UI read-modify-write phải gửi optimistic version; stale write bị từ chối và client re-fetch.
- Không xóa/hủy slot booked mà bỏ qua schedule và notification liên quan.

### Notification và queue

- Mọi SMS/Email đi qua `notifications` và BullMQ `notification-queue`.
- Dùng deterministic `idempotency_key` để chống gửi trùng.
- Retry/backoff có giới hạn; hết retry phải ghi failed và hiển thị cho HQ.
- Reminder interview là 1 ngày trước lịch theo nguồn ưu tiên.
- Điều kiện send-volume cap, send-time window và holiday handling vẫn là open item.

### RikuOp

- Tách contract ngoài qua adapter/anti-corruption layer.
- Inbound có thể là webhook hoặc polling; lựa chọn cuối cùng phụ thuộc integration contract chưa hoàn tất.
- Outbound gồm status, memo và interview set/change/cancel.
- Mọi call và outcome ghi vào `rikuop_sync_logs`.
- Không để payload RikuOp lan trực tiếp vào domain model.

## 6. Kiến trúc và stack phải giữ

- Frontend: Next.js App Router v16+, Tailwind CSS, TanStack React Query, Zustand có chọn lọc, shadcn/ui, react-day-picker, lucide-react, react-hook-form, zod, date-fns/date-fns-tz.
- Backend: NestJS theo DDD, Prisma, PostgreSQL, class-validator/class-transformer.
- Queue: Redis + BullMQ.
- API: REST, prefix/version `/api/v1`, response envelope và error shape nhất quán.
- Local/staging: Docker Compose. Production: AWS topology như `ARCHITECTURE.md`; provider được resolve qua `ConfigService` và environment variables.

Không thêm framework, broker hoặc kiến trúc mới nếu chưa có requirement/decision được duyệt. Đặc biệt không thêm Kafka, SNS/SQS hoặc event sourcing theo sơ đồ queue hiện tại.

## 7. Data và naming

- Tên persistence dùng `snake_case` đúng `DATABASE-SCHEMA.md`.
- Tên JSON/API dùng chính xác contract trong `API-CONTRACT.md`; không suy diễn từ label UI.
- Không dùng mock data/hardcoded array trên FE cho dữ liệu nghiệp vụ.
- Không dùng query parameter để giả lập pass/fail hoặc candidate state.
- Dữ liệu có cấu trúc nhưng còn thay đổi dùng JSONB đúng các vùng đã quyết định; field lọc/sort vận hành giữ typed column.
- UUID là primary key chuẩn.
- Mọi timestamp lưu UTC; logic/hiển thị nghiệp vụ chuẩn hóa `Asia/Tokyo`.

## 8. Security, validation và audit

- Password chỉ lưu salted hash bằng bcrypt hoặc argon2; không log hoặc trả password.
- Re-validate mọi input tại BE DTO dù FE đã validate bằng zod.
- Áp dụng auth/role/scope guards thống nhất cho endpoint; public endpoint chỉ dành cho flow token được định nghĩa.
- Secret nằm trong environment variables/AWS Secrets Manager, không commit vào source.
- Dùng helmet, hpp, sanitizer, express-rate-limit và các cross-cutting controls đã xác định.
- Global audit interceptor ghi mọi POST/PUT/PATCH/DELETE; loại GET để tránh polling noise.
- Structured log phải có request ID. Không ghi token, password hoặc dữ liệu nhạy cảm không cần thiết.

## 9. UI và responsive scope

- HQ workflow: PC-first.
- AM/SM/Sub-SM: mobile-first, đồng thời có layout hoạt động trên PC.
- Candidate: webview qua URL, không cài app và không đăng nhập.
- Không triển khai Role Switcher trên header.
- Không tạo UI bằng dữ liệu giả để thay thế API thật.

## 10. Definition of Done cho thay đổi

Một thay đổi chỉ được coi hoàn tất khi:

- Đúng actor, scope và allowed state transition.
- FE/BE dùng cùng field name và error/response convention.
- Validation tồn tại ở BE; FE validation chỉ hỗ trợ UX.
- Transaction/concurrency/idempotency được kiểm tra khi liên quan.
- Audit, notification và RikuOp side effect được xử lý đúng phạm vi.
- Có test cho happy path, authorization, invalid state, validation và race/idempotency phù hợp.
- Không thêm mock business data hoặc assumption không có nguồn.
- Tài liệu contract/tracking liên quan được cập nhật bằng bằng chứng thực tế.

## 11. Open items không được tự quyết định

- HQ-only PC visual direction.
- Cách HQ chọn SM khi thêm slot cho store có nhiều manager.
- Reference design cho smartphone schedule-setting calendar.
- Requirement list là unified hay tách “in progress”/“regular”.
- Job requirement import format.
- Master-data link import/export format.
- Reminder caps, send windows và holiday handling.
- Legacy/new-system cutover date.
- Block, prefecture và legal-representative fields theo master-data template.
- RikuOp inbound dùng webhook hay polling theo final contract.

