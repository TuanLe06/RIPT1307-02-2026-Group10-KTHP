## Context

Module candidate profile hiện đã có GET/PUT thông tin cá nhân, nhưng phần học tập (`academic_records`, `academic_progress`) chưa có endpoint riêng. Frontend cần 3 API mới để đọc và cập nhật thông tin học tập theo đúng phân quyền thí sinh (`CANDIDATE`) và luồng hồ sơ hiện có.

## Goals / Non-Goals

**Goals:**
- Cung cấp `GET /api/candidate/profile/academic-record` để trả thông tin học tập tổng quan hiện tại.
- Cung cấp `PUT /api/candidate/profile/academic-record` để cập nhật các trường tổng quan học tập (năm tốt nghiệp, điểm môn, điểm ưu tiên).
- Cung cấp `PUT /api/candidate/profile/academic-progress` để cập nhật tiến trình học theo các khối lớp 10/11/12.
- Tái sử dụng pattern route/controller/service/model và auth/authorize đã có của module profile.

**Non-Goals:**
- Không thay đổi schema bảng học tập trong change này.
- Không bổ sung endpoint xóa/reset dữ liệu học tập.
- Không mở rộng logic tính điểm xét tuyển phức tạp.

## Decisions

1. Đặt cả 3 endpoint dưới namespace `/api/candidate/profile`.
- Rationale: giữ nhất quán module profile và dễ frontend tích hợp.
- Alternative considered: tách thành `/api/candidate/academic/*`; bị loãng module và duplicate middleware.

2. `GET /academic-record` trả đồng thời `academic_record` và `academic_progress` trong một response.
- Rationale: frontend cần cả thông tin tổng quan và tiến trình để prefill form, giảm số lần gọi API.
- Alternative considered: chỉ trả `academic_record`; bắt frontend gọi thêm API riêng để lấy progress.

3. Cập nhật dữ liệu theo cơ chế upsert theo `user_id`.
- Rationale: cho phép user nhập lần đầu hoặc sửa thông tin mà không cần endpoint tạo riêng.
- Alternative considered: tách POST/PUT; tăng độ phức tạp API contract.

4. Validation payload theo whitelist field và ràng buộc numeric range cơ bản.
- Rationale: tránh ghi field ngoài phạm vi và giảm dữ liệu lỗi vào DB.
- Alternative considered: validate nhẹ ở controller; khó bảo trì và dễ bỏ sót.

## Risks / Trade-offs

- [Payload điểm số đa dạng] -> Mitigation: validate numeric và giới hạn range hợp lý cho các điểm môn.
- [Missing bản ghi progress theo từng lớp] -> Mitigation: upsert từng khối lớp theo payload, đảm bảo dữ liệu đồng bộ.
- [Regression vào API profile cũ] -> Mitigation: giữ nguyên handler hiện có, thêm route mới tách biệt và test hồi quy.

## Migration Plan

1. Mở rộng model/service candidate profile với hàm get và upsert academic record/progress.
2. Thêm validator và controller methods cho 3 endpoint mới.
3. Đăng ký route mới + cập nhật Swagger docs.
4. Chạy test/build backend và smoke test 3 endpoint.
5. Rollback: remove các route mới nếu phát hiện sự cố sau deploy.

## Open Questions

- None.
