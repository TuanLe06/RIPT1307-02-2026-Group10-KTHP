## Context

Module candidate profile đã có thông tin cá nhân, học tập, nhưng chưa có API quản lý minh chứng. Hệ thống đã có bảng `candidate_documents` và đã setup Cloudinary service, vì vậy cần bổ sung endpoint để upload tài liệu và quản lý soft delete.

## Goals / Non-Goals

**Goals:**
- Cung cấp `GET /api/candidate/profile/documents` để liệt kê minh chứng chưa bị xóa.
- Cung cấp `POST /api/candidate/profile/documents` để upload file PDF/JPEG/PNG và lưu metadata vào DB.
- Cung cấp `DELETE /api/candidate/profile/documents/:documentId` để soft delete minh chứng qua `deleted_at` và xóa file tương ứng trên Cloudinary.
- Đảm bảo chỉ role `CANDIDATE` truy cập và response lỗi rõ ràng.

**Non-Goals:**
- Không hỗ trợ update metadata tài liệu trong change này.
- Không triển khai khôi phục tài liệu sau khi đã soft delete và xóa file trên Cloudinary.
- Không bổ sung luồng admin duyệt minh chứng.

## Decisions

1. Dùng `multer` memory storage để nhận multipart file và upload stream lên Cloudinary.
- Rationale: không ghi file tạm vào disk local, phù hợp môi trường deploy ephemeral.
- Alternative considered: disk storage local; không bền vững khi deploy cloud.

2. Lưu metadata tài liệu vào `candidate_documents` với `file_url` là `secure_url` của Cloudinary.
- Rationale: frontend sử dụng trực tiếp URL an toàn https.
- Alternative considered: chỉ lưu `public_id`; cần thêm bước build URL mỗi lần lấy dữ liệu.

3. Dùng soft delete bằng `deleted_at` và xóa file vật lý trên Cloudinary.
- Rationale: giữ audit trail trong DB đồng thời tránh file mồ côi trên cloud storage.
- Alternative considered: chỉ soft delete trong DB; có rủi ro tồn đọng file không còn dùng.

## Risks / Trade-offs

- [Upload file sai mime type] -> Mitigation: validate mime type tại middleware và trả 400.
- [File quá lớn gây lỗi memory] -> Mitigation: đặt giới hạn kích thước file trong multer.
- [Bản ghi document không thuộc user] -> Mitigation: delete query ràng buộc theo `candidate_id` của user đăng nhập.
- [Xóa DB thành công nhưng xóa Cloudinary thất bại] -> Mitigation: thực hiện xóa Cloudinary trước, chỉ cập nhật `deleted_at` sau khi cloud xóa thành công.

## Migration Plan

1. Bổ sung dependency `multer` và middleware upload.
2. Mở rộng model candidate profile cho list/create/soft delete candidate documents và lưu `public_id` để phục vụ delete trên Cloudinary.
3. Thêm controller + route + swagger docs cho 3 endpoint mới.
4. Bổ sung test unit cho luồng thành công/thất bại.
5. Chạy test và build backend.

## Open Questions

- None.
