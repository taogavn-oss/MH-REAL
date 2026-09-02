# Thiết kế bộ tài liệu dự án Rakusai

## 1. Mục tiêu

Tạo một bộ tài liệu kỹ thuật và quản trị phát triển có thể dùng trực tiếp bởi AI và đội phát triển, bám sát các requirement hiện có, thống nhất thuật ngữ và không bổ sung hành vi, field, endpoint hoặc quyết định chưa có cơ sở trong nguồn.

## 2. Nguồn và thứ tự ưu tiên

Nguồn hiện có:

1. `Rakusai-System-Database-Design.md`
2. `RULE.md`
3. `rakusai_er_diagram.drawio`
4. `rakusai_redis_bullmq_flows.drawio`

Thứ tự xử lý đã được người dùng xác nhận:

- `Rakusai-System-Database-Design.md` là nguồn chuẩn ưu tiên cao nhất.
- `RULE.md` bổ sung các rule, luồng kiểm thử và trường hợp biên khi không mâu thuẫn với nguồn ưu tiên.
- Hai file Draw.io là nguồn kiểm chứng cho mô hình dữ liệu và queue flow; nếu khác với tài liệu ưu tiên thì không được tự động ghi đè tài liệu ưu tiên.
- Nội dung mâu thuẫn không được hòa trộn. Nội dung từ nguồn thấp hơn được ghi nhận trong issue/decision trace khi cần, nhưng không được trình bày như requirement hiện hành.

Hệ quả cụ thể:

- Giữ định hướng PC cho HQ và mobile-first cho AM/SM/Sub-SM, có layout PC, như tài liệu ưu tiên mô tả.
- Giữ RikuOp Integration trong phạm vi, gồm inbound/outbound synchronization và `rikuop_sync_logs`.
- Không đưa Role Switcher vào chức năng vì các nguồn không xác lập nó là thành phần bắt buộc và `RULE.md` loại bỏ rõ ràng.
- Không dùng mock data hoặc query parameter để giả lập trạng thái; dữ liệu UI đi qua REST API và database thực tế.

## 3. Phương pháp biên soạn

Áp dụng phương pháp traceability-first:

- Dùng đúng thuật ngữ, trạng thái, tên bảng và field đã xuất hiện trong nguồn.
- Không tự thiết kế thêm field hoặc endpoint để làm tài liệu có vẻ đầy đủ.
- Khi nguồn chỉ mô tả endpoint đại diện, `API-CONTRACT.md` phải phân biệt rõ contract đã xác định và phần chưa được định nghĩa.
- Khi enum có tên khác nhau giữa nguồn, dùng tên từ tài liệu ưu tiên và ghi mismatch vào `ISSUES-LIST-TRACKING.md`; không tự hợp nhất enum.
- Open item giữ nguyên trạng thái chưa xác nhận, kèm thời điểm cần xác nhận nếu nguồn có nêu.
- Trạng thái tiến độ implementation không được suy đoán. Do repository hiện chỉ có tài liệu, task implementation bắt đầu ở trạng thái chưa triển khai.

## 4. Cấu trúc đầu ra

### `CLAUDE.md`

Hướng dẫn AI: thứ tự nguồn, phạm vi dự án, nguyên tắc không giả định, quy trình kiểm tra trước khi sửa, yêu cầu bảo mật, concurrency, state machine, API/DB naming và tiêu chí hoàn thành.

### `PROJECT-DETAIL.md`

Mô tả mục tiêu kinh doanh, actor, quyền, bounded context, chức năng, luồng nghiệp vụ, state machine, notification/reminder, non-functional requirements, out-of-scope và open items.

### `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`

Chia công việc thành phase theo dependency nghiệp vụ và kỹ thuật. Mỗi task có ID, phạm vi, nguồn requirement, dependency, deliverable, tiêu chí nghiệm thu và trạng thái. Log chỉ được cập nhật khi có bằng chứng thực hiện.

### `ARCHITECTURE.md`

Mô tả kiến trúc bốn lớp, bounded contexts, luồng đồng bộ và bất đồng bộ, Redis/BullMQ, topology triển khai, security/observability và các sơ đồ Mermaid có thể render trong Markdown.

### `DECISIONS.md`

Nhật ký quyết định theo dạng ADR rút gọn gồm ID, trạng thái, bối cảnh, quyết định, hệ quả và nguồn. Chỉ ghi quyết định đã có trong requirement; open item không được chuyển thành quyết định.

### `API-CONTRACT.md`

Tách trách nhiệm FE và BE, quy ước versioning/envelope/pagination/error, bảng endpoint đại diện, DTO/schema đã có cơ sở, RBAC và optimistic concurrency. Field chưa được nguồn xác định phải ghi là chưa định nghĩa thay vì tự đặt.

### `DATABASE-SCHEMA.md`

Tổng hợp nguyên tắc DB, entity overview, table/column/type/nullability, khóa và constraint, concurrency, timezone và ERD Mermaid. `rikuop_sync_logs` được giữ theo nguồn ưu tiên.

### `CODING-CONVENTIONS.md`

Quy chuẩn theo Next.js App Router, Tailwind, TanStack React Query, Zustand, NestJS DDD, Prisma/PostgreSQL, DTO validation, RBAC guards, logging, audit, BullMQ, test và naming. Chỉ chuẩn hóa những gì có cơ sở từ nguồn hoặc là quy tắc bảo toàn contract, không áp đặt cấu trúc chưa được định nghĩa.

### `ISSUES-LIST-TRACKING.md`

Theo dõi ba nhóm riêng: source conflict, open item và implementation risk/gap. Mỗi issue có ID, loại, mô tả, nguồn, tác động, trạng thái và resolution. Không ghi bug runtime khi chưa tồn tại code/chứng cứ chạy.

## 5. Liên kết chéo và nguồn sự thật

- `PROJECT-DETAIL.md` là mô tả nghiệp vụ tổng quan, không thay thế contract.
- `API-CONTRACT.md` là nguồn tên field trao đổi FE/BE.
- `DATABASE-SCHEMA.md` là nguồn tên persistence field và quan hệ.
- `ARCHITECTURE.md` là nguồn ranh giới module và data flow.
- `DECISIONS.md` giải thích lý do của các lựa chọn đã được xác lập.
- Hai tracking file ghi tiến độ; chúng không được tự định nghĩa requirement mới.
- Khi phát hiện khác biệt, tài liệu phải trỏ về nguồn ưu tiên và tạo issue thay vì âm thầm sửa nghĩa.

## 6. Kiểm tra chất lượng

Trước khi hoàn tất cần kiểm tra:

1. Mọi module, actor và luồng chính trong tài liệu ưu tiên đều xuất hiện ở tài liệu phù hợp.
2. Không còn nội dung PC-only hoặc loại bỏ RikuOp được trình bày như requirement hiện hành.
3. Tên trạng thái, bảng và field nhất quán giữa API, DB, kiến trúc và task tracking.
4. Tất cả open item được giữ là chưa xác nhận.
5. Không có `TBD`, `TODO` hoặc placeholder mơ hồ; trường hợp thiếu định nghĩa phải nói rõ nguồn chưa cung cấp contract.
6. Mermaid không tham chiếu entity/module ngoài phạm vi nguồn.
7. Tracking không tuyên bố task hoặc issue đã hoàn tất khi không có bằng chứng.

## 7. Phạm vi không thực hiện trong lượt tài liệu

- Không viết code ứng dụng, migration, Prisma schema hoặc test tự động.
- Không thay đổi bốn file requirement nguồn.
- Không quyết định thay người dùng các open item như format import, reminder limits, holiday handling, cutover date hoặc lựa chọn triển khai còn để mở.
- Không cam kết endpoint/DTO đầy đủ ngoài phần đã được nguồn mô tả.
