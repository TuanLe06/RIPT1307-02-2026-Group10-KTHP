## Why

Hồ sơ thí sinh cần lưu minh chứng để nộp xét tuyển, nhưng backend hiện chưa có API quản lý tài liệu upload. Bổ sung nhóm API minh chứng giúp frontend hoàn tất quy trình nộp hồ sơ và đồng bộ trạng thái tài liệu.

## What Changes

- Thêm API `GET /api/candidate/profile/documents` để lấy danh sách minh chứng đã upload (bỏ qua bản ghi đã soft delete).
- Thêm API `POST /api/candidate/profile/documents` để upload minh chứng qua `multipart/form-data`, validate định dạng PDF/JPEG/PNG, upload lên Cloudinary và lưu metadata vào `candidate_documents`.
- Thêm API `DELETE /api/candidate/profile/documents/:documentId` để soft delete minh chứng bằng cách set `deleted_at`, đồng thời xóa file tương ứng trên Cloudinary.
- Giới hạn truy cập role `CANDIDATE`, chuẩn hóa response lỗi 400/401/403/404 cho nhóm API mới.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `candidate-profile-management`: Mở rộng capability hồ sơ thí sinh để bao phủ nghiệp vụ quản lý minh chứng (xem danh sách, upload, soft delete + xóa file trên Cloudinary).

## Impact

- Affected code: candidate profile route/controller/model, cloudinary service integration, upload middleware.
- APIs: thêm 3 endpoints mới dưới `/api/candidate/profile/documents`.
- Database: sử dụng bảng `candidate_documents` hiện có và cập nhật trường `deleted_at` cho soft delete.
- Dependencies: bổ sung middleware upload file (`multer`) để nhận multipart/form-data.
