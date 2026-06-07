## Why

Hiện tại API upload tài liệu của thí sinh chỉ lưu file minh chứng nhưng dễ bị hiểu nhầm là đã xác thực CCCD thành công. Hệ thống cần một luồng eKYC riêng để kiểm tra CCCD mặt trước, mặt sau và đối chiếu chân dung trước khi cho thí sinh tạo hoặc nộp hồ sơ xét tuyển.

## What Changes

- Giữ `POST /api/candidate/profile/documents` là API upload/lưu tài liệu, không gọi OCR và không tự đánh dấu xác thực định danh.
- Thêm nhóm API eKYC riêng cho thí sinh: xác thực CCCD mặt trước, CCCD mặt sau, đối chiếu chân dung và xem trạng thái eKYC.
- Lưu trạng thái xác thực định danh theo thí sinh, gồm trạng thái từng bước và trạng thái tổng thể `UNVERIFIED`, `PARTIAL`, `VERIFIED`, `FAILED`.
- Bắt buộc thí sinh có eKYC `VERIFIED` trước khi tạo hoặc nộp hồ sơ xét tuyển.
- Reset trạng thái eKYC liên quan khi tài liệu CCCD hoặc chân dung đã dùng để xác thực bị xóa/thay mới.
- Cho admin xem trạng thái eKYC, thời gian xác thực, độ tương đồng khuôn mặt và lý do thất bại ở mức an toàn, không trả raw OCR hoặc PII nhạy cảm.

## Capabilities

### New Capabilities

- `candidate-ekyc-verification`: Xác thực định danh thí sinh bằng CCCD mặt trước, CCCD mặt sau và đối chiếu chân dung qua API riêng.

### Modified Capabilities

- `candidate-profile-management`: Làm rõ upload tài liệu chỉ là lưu trữ minh chứng và bổ sung điều kiện hồ sơ hoàn thiện phải có eKYC đã xác thực.

## Impact

- Backend API: thêm route/controller/service/model cho eKYC thí sinh.
- Database: thêm bảng lưu trạng thái xác thực định danh và liên kết document đã dùng để xác thực.
- Middleware hoàn thiện hồ sơ: bổ sung kiểm tra eKYC `VERIFIED`.
- Tài liệu kỹ thuật: cập nhật flow CCCD OCR để dùng `document_id` từ tài liệu đã upload thay vì coi upload là xác thực.
- Frontend candidate/admin: cần hiển thị tiến trình eKYC, trạng thái lỗi và khóa thao tác tạo/nộp hồ sơ khi chưa verified.
