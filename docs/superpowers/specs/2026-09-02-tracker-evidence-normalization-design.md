# Tracker Evidence Normalization Design

## Mục tiêu

Chuẩn hóa `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md` để checkbox phản ánh đúng tiến độ triển khai thực tế. Sau bước này, mỗi task `[x][DONE]` phải có artifact và evidence kiểm chứng được; task chưa đủ điều kiện được trả về trạng thái phù hợp trước khi tiếp tục implementation.

## Lý do thực hiện trước implementation tiếp theo

Tracker hiện khai báo 379 task và khoảng 358 task `[x][DONE]`, nhưng Evidence Registry chỉ có bốn dòng. Source audit cũng cho thấy một số task đã tick chưa có artifact tương ứng, ví dụ các health deliverable được ghi `DONE` trong khi source chưa có route `/api/v1/health`. Nếu tiếp tục dựa trên các trạng thái này, dependency gate và số liệu tiến độ sẽ sai.

## Phạm vi

Phase này chỉ audit và chuẩn hóa tracker. Không thay đổi API, schema, business logic hoặc production code.

Các artifact được đối chiếu:

- Requirement và technical rule theo thứ tự ưu tiên đã chốt.
- Chín tài liệu dự án ở workspace root.
- Backend/frontend source, tests, Prisma schema/migrations và deployment files.
- Command evidence có thể tái chạy trong môi trường hiện tại.
- Bốn evidence rows đã có và execution logs liên quan.

## Quy tắc phân loại

### DONE

Giữ hoặc chuyển sang `[x][DONE]` chỉ khi:

- deliverable tồn tại đúng phạm vi task;
- dependency bắt buộc đã được chứng minh;
- acceptance có verification phù hợp;
- Evidence Registry có một dòng trỏ tới artifact, command/result hoặc approval source cụ thể.

### IN_PROGRESS

Chuyển sang `[ ][IN_PROGRESS]` khi artifact đã tồn tại một phần nhưng thiếu acceptance, verification hoặc evidence hoàn chỉnh. Không dùng trạng thái này cho task chỉ mới được mô tả trong tài liệu.

### BLOCKED

Chuyển hoặc giữ `[ ][BLOCKED]` khi thiếu contract/decision, dependency chưa hợp lệ, cần môi trường ngoài chưa có, hoặc source gốc còn mâu thuẫn. Lý do blocker phải được ghi trực tiếp hoặc liên kết tới issue/dependency.

### READY

Chỉ dùng `[ ][READY]` khi mọi dependency đã có evidence hợp lệ và task có thể bắt đầu mà không cần giả định thêm.

## Cách audit

1. Parse toàn bộ checklist declarations, ID, loại task và status.
2. Map mỗi task `DONE` sang evidence hiện có và artifact được nêu trong acceptance.
3. Chia review theo nhóm độc lập: contract/decision, backend/database, frontend, infrastructure/QA.
4. Tác nhân reviewer chỉ đề xuất trạng thái và bằng chứng; không tự chỉnh production code.
5. Main agent hợp nhất kết quả, xử lý trùng/mâu thuẫn và cập nhật tracker bằng một patch có thể kiểm tra.
6. Chạy integrity validation: ID duy nhất, checkbox/status khớp, evidence ID duy nhất, mọi task `DONE` resolve được evidence, mọi dependency reference có declaration/namespace hợp lệ.

## Bảo toàn evidence đã xác minh

Không hạ trạng thái bốn task đã có command/review evidence hợp lệ:

- `BLD-BE-BE-01` — `EV-20260902-001`.
- `TST-BE-QA-01` — `EV-20260902-002`.
- `IMPL-FE-QA-01` — `EV-20260902-003`.
- `P1-PRISMA-BE-01` — `EV-20260902-004`.

Các task khác không được giữ `DONE` chỉ vì checkbox hiện tại đang được tick. Chúng phải vượt qua cùng quy tắc evidence.

## Kết quả đầu ra

- Tracker có baseline tiến độ mới và số lượng theo status.
- Evidence Registry đồng bộ với mọi task `DONE`.
- Execution log ghi rõ đợt normalization và số task thay đổi trạng thái.
- Một hàng đợi task kỹ thuật `READY` được xác định từ dependency/evidence thực tế.
- Các task nghiệp vụ thiếu cơ sở tiếp tục `BLOCKED`; không tự bổ sung contract.

## Tiêu chí hoàn thành

- Không có task `[x]` ngoài status `DONE` và không có task `DONE` chưa tick.
- Không có declared task ID hoặc Evidence ID trùng.
- Mọi task `DONE` có Evidence ID hợp lệ.
- Số liệu baseline khớp trực tiếp với checklist sau normalization.
- Ít nhất hai reviewer độc lập xác nhận không có task thiếu evidence bị giữ `DONE`.
- Không có production source file nào thay đổi trong phase này.

## Bước tiếp theo sau normalization

Chọn task kỹ thuật đầu tiên ở trạng thái `READY`, tạo design/plan riêng, triển khai theo TDD, review chéo, ghi evidence và tick. Không gom các subsystem auth, survey, scheduling, notification, RikuOp và database migration vào cùng một implementation plan.
