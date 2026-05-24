## Context

Sau khi có auth API, hệ thống tuyển sinh cần cho thí sinh xem và cập nhật hồ sơ cá nhân. Dữ liệu hồ sơ phân tách ở 2 bảng: `users` (email, role, status) và `candidate_profiles` (citizen_id, full_name, phone, gender, date_of_birth, địa chỉ, nơi cấp CCCD...). Nhóm API hồ sơ cá nhân cần đọc dữ liệu hợp nhất từ cả hai bảng nhưng vẫn kiểm soát chặt quyền truy cập.

## Goals / Non-Goals

**Goals:**
- Cung cấp `GET /api/candidate/profile` để trả profile tổng hợp theo cấu trúc `{ user, candidate_profile }`.
- Cung cấp `PUT /api/candidate/profile` để cập nhật thông tin cá nhân theo nghiệp vụ tuyển sinh.
- Giới hạn quyền truy cập cho role `CANDIDATE`, trả lỗi phù hợp cho `401`, `403`, `404`, `400`.
- Sử dụng `candidate_profiles.full_name` làm nguồn chuẩn duy nhất cho họ tên thí sinh.

**Non-Goals:**
- Chưa bao gồm upload/xóa minh chứng.
- Chưa bao gồm thông tin học tập (`academic_records`, `academic_progress`).
- Chưa triển khai audit log cho thao tác cập nhật hồ sơ trong change này.

## Decisions

1. Thiết kế endpoint theo resource nghiệp vụ `candidate/profile`.
- Rationale: tách rõ khỏi auth endpoints và phản ánh đúng module hồ sơ cá nhân.

2. Response `GET /api/candidate/profile` dùng join `users` + `candidate_profiles` theo `user_id`, trả về `{ user, candidate_profile }`.
- Rationale: một API trả đủ dữ liệu cho cả màn hình tổng quan và form profile.

3. Không duy trì endpoint `/api/candidate/profile/full`.
- Rationale: giảm trùng lặp API và tránh 2 contract gần giống nhau.

4. `PUT` cập nhật trực tiếp `candidate_profiles.full_name` như nguồn chuẩn.
- Rationale: giảm trùng lặp dữ liệu và loại bỏ nhu cầu đồng bộ chéo bảng.

5. Validation đầu vào theo whitelist field.
- Rationale: tránh ghi ngoài phạm vi nghiệp vụ, giảm rủi ro ghi đè dữ liệu không liên quan.

## Risks / Trade-offs

- [Họ tên bị sửa ngoài luồng profile] -> Mitigation: quy ước toàn bộ nghiệp vụ chỉ cập nhật `full_name` tại `candidate_profiles`.
- [Payload không hợp lệ làm hỏng dữ liệu] -> Mitigation: validate chặt kiểu dữ liệu, độ dài, enum `gender`.
- [Không tìm thấy candidate profile cho user hợp lệ] -> Mitigation: trả `404` với thông báo rõ ràng.
- [Rò rỉ dữ liệu nếu thiếu kiểm tra role] -> Mitigation: bắt buộc `authenticate` + `authorize('CANDIDATE')`.

## Migration Plan

1. Tạo route/controller/service/model cho `/api/candidate/profile` (GET, PUT).
2. Thêm query join đọc hồ sơ và query update `candidate_profiles` theo whitelist field.
3. Thêm validation middleware cho payload cập nhật.
4. Viết test cho các nhánh thành công/thất bại chính, sau đó chạy build + test.
5. Rollback: tắt route mới nếu phát hiện lỗi nghiêm trọng.

## Open Questions

- None.
