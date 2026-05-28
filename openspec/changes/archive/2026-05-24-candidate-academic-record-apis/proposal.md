## Why

Hồ sơ thí sinh đã có API thông tin cá nhân, nhưng chưa có API để xem và cập nhật thông tin học tập phục vụ xét tuyển. Bổ sung nhóm API học tập ngay bây giờ giúp frontend hoàn thiện luồng khai báo hồ sơ và giảm thao tác thủ công.

## What Changes

- Thêm API `GET /api/candidate/profile/academic-record` để lấy thông tin học tập hiện tại của thí sinh đang đăng nhập.
- Thêm API `PUT /api/candidate/profile/academic-record` để nhập/chỉnh sửa dữ liệu tổng quan học tập, bao gồm `graduation_year`, điểm các môn và `priority_score`.
- Thêm API `PUT /api/candidate/profile/academic-progress` để nhập/chỉnh sửa tiến trình học theo từng lớp 10/11/12.
- Bổ sung validation payload, giới hạn quyền truy cập role `CANDIDATE`, và chuẩn hóa response lỗi cho nhóm API mới.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `candidate-profile-management`: Mở rộng capability hồ sơ thí sinh để bao phủ hành vi xem và cập nhật thông tin học tập (academic record và academic progress).

## Impact

- Affected code: candidate profile route/controller/service/model va validator middleware trong backend.
- APIs: thêm 3 endpoints mới dưới `/api/candidate/profile`.
- Database: sử dụng/cập nhật dữ liệu trong bảng `academic_records` và `academic_progress` đã thiết kế.
- Documentation: cập nhật Swagger và tài liệu API profile cho phần học tập.
