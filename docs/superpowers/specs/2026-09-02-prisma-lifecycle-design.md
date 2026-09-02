# Prisma Lifecycle Refactor Design

## Mục tiêu

Hoàn thành atom `P1-PRISMA-BE-01`: loại bỏ mọi `new PrismaClient()` khỏi `backend/src` và đưa Prisma vào NestJS dependency injection với lifecycle được quản lý tập trung. Thay đổi này chỉ tác động đến persistence wiring; không thay đổi API, DTO, schema, route, trạng thái hay logic nghiệp vụ.

## Nguồn và phạm vi

- Nguồn task: `DEVELOPMENT-TASK-BY-PHASES-TRACKING-LOGS.md`, atom `P1-PRISMA-BE-01`.
- Áp dụng cho service, guard, interceptor và worker trong `backend/src` đang tự khởi tạo `PrismaClient`.
- `backend/prisma/seed.ts` không thuộc phạm vi vì đây là CLI entry point độc lập, không chạy trong NestJS application lifecycle.
- Không sửa `schema.prisma`, migrations, controller, DTO, route strings, business state transitions hoặc queue semantics.
- Không commit theo chỉ dẫn hiện tại của người dùng.

## Kiến trúc được chọn

Tạo `PrismaService` kế thừa `PrismaClient` và thực thi `OnModuleInit`/`OnModuleDestroy`. Một `PrismaModule` global cung cấp và export duy nhất service này. `AppModule` import `PrismaModule`; các consumer nhận `PrismaService` qua constructor injection.

Thiết kế này giữ nguyên API truy vấn Prisma hiện có vì `PrismaService` vẫn cung cấp các model delegates và `$transaction` từ `PrismaClient`. NestJS chịu trách nhiệm tạo một instance cho application container, kết nối khi module khởi tạo và ngắt kết nối khi module bị hủy.

## Thành phần thay đổi

### Persistence infrastructure

- `backend/src/infrastructure/prisma/prisma.service.ts`: lifecycle-managed Prisma client.
- `backend/src/infrastructure/prisma/prisma.module.ts`: global provider/export boundary.
- `backend/src/app.module.ts`: import persistence module một lần tại composition root.

### Consumers

Các file trong `backend/src` hiện khai báo module-level `const prisma = new PrismaClient()` sẽ chuyển sang constructor injection. Mọi lời gọi `prisma.<model>` được đổi thành `this.prisma.<model>` nhưng giữ nguyên đối số, transaction boundary và kết quả.

Worker/processor vẫn được Nest/BullMQ tạo qua DI; guard và interceptor vẫn dùng cùng metadata/request flow. Không thêm fallback client hoặc service locator.

## Error và lifecycle behavior

- Lỗi `$connect()` được truyền nguyên lên Nest startup; application không giả vờ ready khi DB connection thất bại.
- `$disconnect()` chạy trong module teardown.
- Không catch hoặc remap Prisma/business errors trong refactor này.
- Không tạo client tại import time, nhờ đó unit tests có thể cung cấp mock provider mà không kết nối DB ngầm.

## Kiểm thử và acceptance

Thực hiện theo TDD:

1. Thêm static architecture test quét `backend/src` và fail nếu còn `new PrismaClient()` hoặc import trực tiếp `PrismaClient` ngoài file infrastructure được phép.
2. Thêm lifecycle unit test cho `PrismaService` để xác nhận `$connect()` khi init và `$disconnect()` khi destroy bằng spy, không gọi DB thật.
3. Refactor từng consumer và test module để inject mock Prisma boundary.
4. Chạy focused tests, toàn bộ `npm.cmd test`, `npm.cmd run build` và `npm.cmd run lint` trong backend.
5. Review chéo độc lập; chỉ sau khi pass mới thêm evidence và chuyển `P1-PRISMA-BE-01` thành `[x][DONE]`.

## Ngoài phạm vi

- Tạo hoặc chạy migration.
- Thay đổi repository/domain abstraction rộng hơn atom hiện tại.
- Sửa nghiệp vụ auth, survey, token, notification, reminder, schedule hoặc RikuOp.
- Thay đổi cấu hình database, pool, retry, timeout hoặc observability chưa được requirement chốt.
