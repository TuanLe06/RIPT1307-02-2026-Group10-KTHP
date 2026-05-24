## Why

Hiện hệ thống chỉ có API để thí sinh tự cập nhật học bạ, chưa có API để admin cập nhật điểm thi theo đúng tổ hợp khối xét tuyển. Cần bổ sung API admin để chuẩn hóa quy trình nhập điểm và hỗ trợ vận hành tuyển sinh.

## What Changes

- Thêm API admin `PUT /api/admin/candidates/:citizenId/exam-scores-by-group`.
- API nhận `science_group` (`NATURAL` hoặc `SOCIAL`) và điểm theo bộ 3 môn cố định của khối.
- Khối `NATURAL` (KHTN) dùng `TOAN`, `LY`, `HOA`; khối `SOCIAL` (KHXH) dùng `VAN`, `SU`, `DIA`.
- Backend upsert điểm vào `exam_scores` và cập nhật `academic_records.science_group` của thí sinh.
- Trả lỗi rõ ràng cho các trường hợp payload không hợp lệ, thí sinh không tồn tại, hoặc caller không đủ quyền.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `candidate-profile-management`: mở rộng capability để admin có thể cập nhật điểm thi theo khối cho thí sinh bằng `citizen_id`.

## Impact

- Affected code: admin routes, candidate profile controller/model, validation layer, swagger docs, tests.
- APIs: thêm mới endpoint admin cập nhật điểm theo khối.
- Database: tái sử dụng `academic_records` và `exam_scores` hiện có (không thêm bảng mới).
- Security: endpoint mới yêu cầu `authenticate + authorize('ADMIN')`.
