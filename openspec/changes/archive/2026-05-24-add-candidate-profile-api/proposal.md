## Why

Hệ thống tuyển sinh đã có đăng ký/đăng nhập nhưng cần API hồ sơ cá nhân cho thí sinh để xem và cập nhật thông tin phục vụ nộp hồ sơ xét tuyển.

## What Changes

- Thêm API `GET /api/candidate/profile` để lấy hồ sơ cá nhân của thí sinh đăng nhập, response gồm cả dữ liệu từ `users` và `candidate_profiles` theo cấu trúc `{ user, candidate_profile }`.
- Thêm API `PUT /api/candidate/profile` để khai báo/chỉnh sửa thông tin cá nhân như `full_name`, `phone`, `gender`, `date_of_birth`, địa chỉ, nơi cấp CCCD, tôn giáo, dân tộc.
- Chuẩn hóa validate input, xử lý quyền truy cập chỉ cho role `CANDIDATE`, và định dạng lỗi thống nhất.
- `full_name` được lưu và cập nhật tập trung tại `candidate_profiles` (không dùng `users.full_name`).

## Capabilities

### New Capabilities
- `candidate-profile-management`: Cung cấp hành vi xem và cập nhật hồ sơ cá nhân thí sinh qua 2 API (`GET /profile`, `PUT /profile`).

### Modified Capabilities
- None.

## Impact

- Affected code: candidate profile route/controller/service/repository, auth middleware (role guard), user/profile model.
- APIs: thêm mới `/api/candidate/profile` với `GET`, `PUT`.
- Dependencies: tận dụng `express-validator`, không cần dependency mới.
- Systems: tác động trực tiếp đến luồng hoàn thiện hồ sơ cá nhân trước khi nộp xét tuyển.
