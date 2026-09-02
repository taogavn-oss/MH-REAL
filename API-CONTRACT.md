# API-CONTRACT.md — Contract giữa Frontend và Backend

## 1. Trạng thái contract

**Contract status: PARTIAL.** Requirement hiện xác định API conventions, 12 endpoint đại diện, một số query/path parameter và persistence fields; chưa cung cấp DTO request/response đầy đủ, HTTP status cho mọi lỗi, nội dung `meta`, error code catalog hoặc JSON naming convention.

File này chỉ khóa phần đã có nguồn. Nội dung ghi “chưa được định nghĩa” phải được xác nhận và cập nhật OpenAPI trước khi FE/BE triển khai endpoint liên quan; không được tự điền riêng ở một phía.

## 2. Nguồn sự thật và ownership

| Concern | Nguồn sự thật |
|---|---|
| Endpoint/method/path | OpenAPI do BE publish, ban đầu giới hạn bởi bảng §7 |
| Request/response field | OpenAPI + DTO được duyệt; file này là registry hiện tại |
| Persistence field | `DATABASE-SCHEMA.md` |
| Business state/transition | `PROJECT-DETAIL.md` và domain rules |
| Role/data scope | `PROJECT-DETAIL.md` + BE guards |
| External RikuOp payload | Final RikuOp integration contract; hiện chưa có |

Không dùng database schema như mặc định để suy ra JSON API field. Việc map API ↔ DB thuộc BE adapter/application layer.

## 3. Global REST conventions

- Base prefix/version: `/api/v1`.
- Transport: REST/HTTP.
- Success response được `ResponseTransformInterceptor` chuẩn hóa.
- Error response được `HttpExceptionFilter` chuẩn hóa.
- Input luôn được BE validate bằng `class-validator`/`class-transformer` DTO dù FE đã validate bằng zod.
- List endpoints dùng chung `page`, `pageSize`, `sort` và resource-specific filters.
- Authentication/authorization đi qua uniform guards.
- Candidate public routes nằm dưới `/api/v1/public/*` và phải rate limited.
- Timestamp được persist UTC; FE hiển thị/nghiệp vụ theo `Asia/Tokyo`.

## 4. Response envelope

### 4.1 Success

Các property đã được nguồn xác định:

```json
{
  "success": true,
  "data": "<resource payload chưa được định nghĩa cho từng endpoint>",
  "meta": "<metadata chưa được định nghĩa>"
}
```

- `success`: cờ thành công.
- `data`: payload endpoint-specific.
- `meta`: metadata, có thể phục vụ list/pagination nhưng exact fields chưa được nguồn định nghĩa.
- Nguồn liệt kê envelope gồm `success`, `data`, `meta`, `error` nhưng chưa xác định property nào luôn có/may omit. Không tự khóa nullability trước khi OpenAPI được duyệt.

### 4.2 Error

Các property đã được nguồn xác định:

```json
{
  "success": false,
  "error": {
    "code": "<error code chưa có catalog>",
    "message": "<human-readable message>",
    "details": "<validation/domain details chưa được định nghĩa>"
  }
}
```

- `code`, `message`, `details` là error shape chuẩn.
- Exact type/nullability của `details` và error code catalog chưa được định nghĩa.
- `403 Forbidden` được yêu cầu rõ cho API ngoài thẩm quyền.
- HTTP status cụ thể cho stale version, booked slot, invalid transition, expired token và validation failure chưa được nguồn khóa; BE không được tự chọn mà không cập nhật contract.

## 5. Pagination, sorting và filtering

| Parameter | Nguồn xác định | Exact type/default/limit |
|---|---|---|
| `page` | Common list contract | Chưa được định nghĩa |
| `pageSize` | Common list contract | Chưa được định nghĩa |
| `sort` | Common list contract | Chưa được định nghĩa |
| `storeId` | Job Requirement endpoint | Identifier format theo UUID persistence; API validation detail chưa định nghĩa |
| `status` | Job Requirement endpoint | Phải map state machine; format multi-value chưa định nghĩa |
| `date` | Store slot endpoint | Business date theo Asia/Tokyo; wire format chưa định nghĩa |

Các filter nghiệp vụ được nguồn nhắc tới nhưng chưa có wire name đầy đủ: store name, publish status, approval status, block, area, prefecture và manager. FE/BE phải chốt trong OpenAPI trước khi dùng.

## 6. Phân tách trách nhiệm FE và BE

| Concern | Frontend | Backend |
|---|---|---|
| Contract | Generate/consume client/types từ OpenAPI khi có | Publish và version OpenAPI |
| Validation | zod/react-hook-form để hỗ trợ UX | DTO validation là authoritative |
| Authentication | Gửi credential/session/JWT theo auth contract; route guard UX | Xác thực token/session và account status |
| Authorization | Ẩn/chặn UI không phù hợp | RolesGuard + ScopeGuard bắt buộc |
| Data scope | Không request resource ngoài scope đã biết | Filter/check store/area ownership ở query/use case |
| State machine | Chỉ enable action hợp lệ theo response | Enforce transition bất kể request từ FE |
| Concurrency | Gửi version đã đọc; re-fetch khi conflict | Check optimistic version/row lock/transaction |
| Date/time | Render/input theo Asia/Tokyo | Normalize business rule theo Asia/Tokyo, persist UTC |
| Server state | TanStack React Query | Normalized envelope và stable errors |
| Client state | Zustand dùng chọn lọc cho state không thuộc server | Không phụ thuộc client state để quyết định nghiệp vụ |
| Public token | Không decode/suy luận candidate identity | Hash lookup, expiry/use validation, data isolation, rate limit |
| Mock/state simulation | Không dùng hardcoded business arrays hoặc URL query để giả state | Cung cấp REST API và DB-backed state thật |

## 7. Endpoint registry hiện tại

Tất cả endpoint dưới đây là **representative/illustrative** theo nguồn; chúng chưa tạo thành complete API surface.

| ID | Module | Method và path | Actor/auth | Input đã được xác định | Output/purpose đã được xác định | Contract gap |
|---|---|---|---|---|---|---|
| API-001 | Auth | `POST /api/v1/auth/login` | HQ/AM/SM/Sub-SM | `login_id`, `password` theo `RULE.md`; naming khác `employee_code` trong DB chưa được map chính thức | HTTP 200, session/JWT và role; redirect do FE thực hiện | Exact body/response/token transport/TTL/lockout chưa định nghĩa |
| API-002 | Job Requirement | `GET /api/v1/job-requirements?storeId=&status=` | Internal, scoped | `storeId`, `status`, common list params | List/filter requirement theo role scope | Item DTO và pagination meta chưa định nghĩa |
| API-003 | Job Requirement | `POST /api/v1/job-requirements/:id/submit` | SM/Sub-SM; AM special case | `id`; current version phải đầy đủ | Submit current draft | Body/version field và exact response chưa định nghĩa |
| API-004 | Job Requirement | `POST /api/v1/job-requirements/:id/approve` | AM hoặc HQ theo state/scope | `id` | Thực hiện đúng approval step | Cách phân biệt AM/HQ action và body chưa định nghĩa |
| API-005 | Job Requirement | `POST /api/v1/job-requirements/:id/reject` | AM hoặc HQ theo state/scope | `id`, mandatory rejection comment về nghiệp vụ | Reject requirement | Wire field name của comment chưa định nghĩa; `RULE.md` dùng `rejection_reason`, DB dùng `comment` |
| API-006 | Scheduling | `GET /api/v1/stores/:storeId/slots?date=` | Internal; candidate flow có public eligibility riêng chưa định nghĩa | `storeId`, `date` | List open/booked slots của Store | Response DTO và candidate-safe endpoint chưa định nghĩa |
| API-007 | Scheduling | `POST /api/v1/slots/:id/book` | SM/Sub-SM/HQ theo scope | `id`, candidate/optimistic version về nghiệp vụ | Book candidate bằng transaction | Exact body, version wire name và conflict status chưa định nghĩa |
| API-008 | Candidate public | `GET /api/v1/public/survey/:token` | Magic link, public rate-limited | `token` | Resolve form theo token/Store/published requirement | Safe response fields/branch discriminator chưa định nghĩa |
| API-009 | Candidate public | `POST /api/v1/public/survey/:token` | Magic link, public rate-limited | `token`, survey answers | Persist response và kích hoạt matching/outcome | Exact survey DTO thay đổi theo client requirement, chưa khóa |
| API-010 | Master Data | `POST /api/v1/master-data/import` | HQ | Excel/CSV | Bulk import Area/Store/SM/Sub-SM/AM | Multipart contract, limits và template columns chưa xác nhận |
| API-011 | Integration | `POST /api/v1/integrations/rikuop/candidates` | RikuOp integration auth | RikuOp payload | Inbound candidate webhook | Webhook/polling và payload/signature contract chưa chốt |
| API-012 | System | `GET /api/v1/health` | Chưa được nguồn định nghĩa | Không xác định | Liveness/readiness cho DB, Redis, dependent services | Auth policy và component response chưa định nghĩa |

## 8. Domain field registry

### 8.1 API fields được nguồn nêu trực tiếp

| API field | Vị trí | Mapping/purpose | Trạng thái |
|---|---|---|---|
| `login_id` | Login body trong `RULE.md` | Internal login identifier | Mapping sang `users.employee_code` hoặc email chưa được xác định |
| `password` | Login body | Plain credential chỉ tồn tại tại request boundary | Không được log/persist plaintext |
| `storeId` | Job Requirement query, Store slot path | Store identifier | Persistence target `stores.id` |
| `status` | Job Requirement query | Approval state filter | Allowed wire values chưa được formalize ngoài DB enum |
| `date` | Store slots query | Ngày lịch | Asia/Tokyo business date; format chưa khóa |
| `token` | Candidate public path | Opaque magic-link token | BE hash trước lookup; không map plaintext vào DB |
| `page` | List query | Pagination | Default/min/max chưa khóa |
| `pageSize` | List query | Pagination | Default/min/max chưa khóa |
| `sort` | List query | Sorting | Grammar/allowlist chưa khóa |

### 8.2 Persistence fields có thể cần expose nhưng chưa phải API contract

Các group sau tồn tại trong DB design nhưng JSON naming, read/write exposure và DTO shape chưa được nguồn xác định:

- Identity: `employee_code`, `email`, `full_name`, `phone`, `role_id`, `status`.
- Store: `code`, `name`, `area_id`, `prefecture`, `address`, `allow_car_commute`, `publish_status`.
- Requirement: `store_id`, `channel`, `status`, `current_version_id`, `published_version_id`, version `payload`.
- Candidate: `full_name`, `phone`, `email`, `store_id`, `status`, `is_duplicate`, `is_blacklisted`, `source`.
- Survey response: `desired_store_ids`, `experience`, `desired_working_hours`, `desired_period`, `desired_days_per_week`, `other_conditions`, `event_work`, `contact_available_days`, `contact_available_time`, `car_commute_note`, `interview_type`, `preferred_dates`.
- Slot: `store_id`, `sm_user_id`, `slot_date`, `start_time`, `end_time`, `status`, `note`, `version`.
- Schedule: `candidate_id`, `slot_id`, `store_id`, `status`, `interview_type`, `location_info`.

Không đổi các tên trên thành camelCase trong FE hoặc expose trực tiếp trước khi JSON naming convention được duyệt.

## 9. State contracts

### Job Requirement persistence enum

`draft | pending_am | approved_am | pending_hq | approved_hq | rejected`

Transition chỉ hợp lệ theo state machine trong `PROJECT-DETAIL.md`. `RULE.md` dùng nhãn dài như `PENDING_AM_REVIEW`/`HQ_APPROVED`; vì nguồn ưu tiên định nghĩa DB enum phía trên, API wire values phải được chốt rõ thay vì dùng lẫn hai hệ tên.

### Candidate persistence enum hiện tại

`received | survey_sent | survey_completed | no_response | passed | failed | interview_scheduled | interview_completed | cancelled`

Domain có thêm `Interview Adjustment Needed`; persistence/API value tương ứng chưa được định nghĩa.

### Interview Slot persistence enum

`open | booked | closed`

`RULE.md` có thêm `CANCELLED`; persistence value/strategy cho cancel slot chưa được định nghĩa.

### Interview Schedule persistence enum

`scheduled | changed | cancelled | completed`

### Notification persistence enum

`scheduled | sent | failed`

Queue diagram đề cập dead-letter behavior nhưng DB enum không có `dead_letter`; nguồn ưu tiên mô tả failed sends visible to HQ. Không tự thêm enum trước khi có quyết định.

## 10. Concurrency contract

- Requirement update phải mang version client đã đọc; exact wire field chưa được định nghĩa.
- Slot UI update dùng `interview_slots.version`; exact wire field chưa được định nghĩa.
- Slot booking luôn authoritative ở DB transaction/row lock.
- Conflict phải trả normalized error để FE re-fetch; exact HTTP status/code chưa được định nghĩa.
- Unique constraint không thay thế overlap validation khi hai slot khác `start_time` nhưng thời gian giao nhau.

## 11. Authentication và security contract gaps

Đã xác định: internal ID/password, session/JWT, account active/inactive, role, scope, hashed password, public magic link và rate limiting.

Chưa được xác định:

- JWT/session transport (cookie hay Authorization header), expiry và refresh.
- Login failure limit/lock duration.
- Reset-password request/consume endpoints và TTL.
- CSRF policy nếu dùng cookie.
- RikuOp authentication/signature scheme.
- File upload size/type limits.
- PII masking policy trong response/log.

Các mục này phải được quyết định trước implementation tương ứng, không được FE và BE tự chọn độc lập.

## 12. Quy trình chống lệch contract

1. BE đề xuất DTO và OpenAPI cho endpoint dựa trên requirement.
2. Review đối chiếu domain state, persistence mapping, role/scope và open items.
3. Sau khi duyệt, OpenAPI là nguồn field wire-level.
4. FE generate/consume type từ cùng OpenAPI và dùng zod cho UX validation.
5. Contract test kiểm tra envelope, fields, validation, authorization và state errors.
6. Mọi rename phải cập nhật OpenAPI, FE usage, BE DTO/mapping, contract test và file này trong cùng change.

