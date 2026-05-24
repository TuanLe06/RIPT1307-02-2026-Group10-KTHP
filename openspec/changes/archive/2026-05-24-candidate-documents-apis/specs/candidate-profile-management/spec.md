## ADDED Requirements

### Requirement: Candidate can list uploaded documents
Hệ thống SHALL cung cấp API `GET /api/candidate/profile/documents` để thí sinh lấy danh sách minh chứng đã upload, chỉ bao gồm các bản ghi chưa bị soft delete.

#### Scenario: List documents successfully
- **WHEN** thí sinh có token hợp lệ gọi `GET /api/candidate/profile/documents`
- **THEN** hệ thống trả `200 OK` với danh sách documents thuộc candidate đang đăng nhập

#### Scenario: Reject unauthorized document list request
- **WHEN** client gọi `GET /api/candidate/profile/documents` mà không có token hợp lệ hoặc không phải role `CANDIDATE`
- **THEN** hệ thống trả `401 Unauthorized` hoặc `403 Forbidden` tương ứng

### Requirement: Candidate can upload supporting document
Hệ thống SHALL cung cấp API `POST /api/candidate/profile/documents` để thí sinh upload minh chứng bằng `multipart/form-data`, chỉ chấp nhận file type PDF/JPEG/PNG.

#### Scenario: Upload document successfully
- **WHEN** thí sinh gọi `POST /api/candidate/profile/documents` với file hợp lệ
- **THEN** hệ thống upload file lên cloud storage, tạo bản ghi trong `candidate_documents` và trả `201 Created`

#### Scenario: Reject invalid file type
- **WHEN** thí sinh upload file không thuộc PDF/JPEG/PNG
- **THEN** hệ thống trả `400 Bad Request` với thông báo lỗi validate file type

### Requirement: Candidate can soft delete uploaded document
Hệ thống SHALL cung cấp API `DELETE /api/candidate/profile/documents/:documentId` để soft delete minh chứng thuộc candidate đang đăng nhập bằng cách set `deleted_at`, đồng thời xóa file vật lý tương ứng trên Cloudinary.

#### Scenario: Soft delete document successfully
- **WHEN** thí sinh gọi `DELETE /api/candidate/profile/documents/:documentId` với document thuộc quyền sở hữu
- **THEN** hệ thống xóa file trên Cloudinary, set `deleted_at` và trả `200 OK`

#### Scenario: Document not found for candidate
- **WHEN** thí sinh gọi xóa với `documentId` không tồn tại hoặc không thuộc candidate
- **THEN** hệ thống trả `404 Not Found`

#### Scenario: Cloudinary delete failed
- **WHEN** hệ thống không thể xóa file trên Cloudinary
- **THEN** hệ thống trả lỗi phù hợp và KHÔNG cập nhật `deleted_at`
