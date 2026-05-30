# candidate-profile-management Specification

## Purpose
TBD - created by archiving change add-candidate-profile-api. Update Purpose after archive.
## Requirements
### Requirement: Candidate can view personal profile
Hệ thống SHALL cung cấp API `GET /api/candidate/profile` để thí sinh đã đăng nhập lấy hồ sơ cá nhân tổng hợp từ `users` và `candidate_profiles`, với cấu trúc response gồm `user` và `candidate_profile`.

#### Scenario: Get profile successfully
- **WHEN** thí sinh đăng nhập hợp lệ gọi `GET /api/candidate/profile`
- **THEN** hệ thống trả `200 OK` với dữ liệu có 2 phần `user` và `candidate_profile`

#### Scenario: Reject unauthenticated request
- **WHEN** client gọi `GET /api/candidate/profile` mà không có token hợp lệ
- **THEN** hệ thống trả `401 Unauthorized`

#### Scenario: Reject non-candidate role
- **WHEN** người dùng có role khác `CANDIDATE` gọi `GET /api/candidate/profile`
- **THEN** hệ thống trả `403 Forbidden`

#### Scenario: Candidate profile not found
- **WHEN** user có role `CANDIDATE` nhưng chưa có bản ghi tương ứng trong `candidate_profiles`
- **THEN** hệ thống trả `404 Not Found` với thông báo hồ sơ chưa tồn tại

### Requirement: Candidate can update personal profile
Hệ thống SHALL cung cấp API `PUT /api/candidate/profile` để thí sinh cập nhật thông tin cá nhân theo whitelist trường được phép, với `full_name` được lưu chuẩn tại `candidate_profiles`.

#### Scenario: Update profile successfully
- **WHEN** thí sinh gửi `PUT /api/candidate/profile` với payload hợp lệ
- **THEN** hệ thống cập nhật các trường được phép và trả `200 OK` với dữ liệu profile mới nhất theo cấu trúc `{ user, candidate_profile }`

#### Scenario: Update full_name in candidate profile
- **WHEN** payload cập nhật có thay đổi `full_name`
- **THEN** hệ thống cập nhật `candidate_profiles.full_name` và phản hồi dữ liệu mới nhất từ nguồn chuẩn này

#### Scenario: Reject invalid update payload
- **WHEN** thí sinh gửi `PUT /api/candidate/profile` với trường không hợp lệ hoặc dữ liệu sai định dạng
- **THEN** hệ thống trả `400 Bad Request` kèm chi tiết lỗi validation

#### Scenario: Reject unauthorized update request
- **WHEN** client gọi `PUT /api/candidate/profile` mà không có token hợp lệ hoặc không phải role `CANDIDATE`
- **THEN** hệ thống trả `401 Unauthorized` hoặc `403 Forbidden` tương ứng

### Requirement: Candidate can view academic record
Hệ thống SHALL cung cấp API `GET /api/candidate/profile/academic-record` để thí sinh đang đăng nhập lấy thông tin học tập hiện tại, bao gồm dữ liệu tổng quan và tiến trình học theo lớp.

#### Scenario: Get academic record successfully
- **WHEN** thí sinh có token hợp lệ gọi `GET /api/candidate/profile/academic-record`
- **THEN** hệ thống trả `200 OK` với payload chứa `academic_record` và `academic_progress`

#### Scenario: Reject unauthorized academic record request
- **WHEN** client gọi `GET /api/candidate/profile/academic-record` mà không có token hợp lệ hoặc không phải role `CANDIDATE`
- **THEN** hệ thống trả `401 Unauthorized` hoặc `403 Forbidden` tương ứng

### Requirement: Candidate can update academic record overview
Hệ thống SHALL cung cấp API `PUT /api/candidate/profile/academic-record` để thí sinh tạo mới hoặc cập nhật thông tin học tập tổng quan gồm `graduation_year`, điểm các môn, `priority_score` theo whitelist field.

#### Scenario: Upsert academic record overview successfully
- **WHEN** thí sinh gọi `PUT /api/candidate/profile/academic-record` với payload hợp lệ
- **THEN** hệ thống upsert bản ghi `academic_records` theo `user_id` và trả `200 OK` với dữ liệu mới nhất

#### Scenario: Reject invalid academic record payload
- **WHEN** thí sinh gọi `PUT /api/candidate/profile/academic-record` với trường không hợp lệ hoặc sai định dạng
- **THEN** hệ thống trả `400 Bad Request` kèm chi tiết validation

### Requirement: Candidate can update academic progress by grade
Hệ thống SHALL cung cấp API `PUT /api/candidate/profile/academic-progress` để thí sinh tạo mới hoặc cập nhật tiến trình học theo từng lớp 10/11/12.

#### Scenario: Upsert academic progress successfully
- **WHEN** thí sinh gọi `PUT /api/candidate/profile/academic-progress` với dữ liệu hợp lệ cho các lớp
- **THEN** hệ thống upsert các bản ghi `academic_progress` tương ứng và trả `200 OK` với dữ liệu progress mới nhất

#### Scenario: Reject invalid academic progress payload
- **WHEN** payload tiến trình học không đúng cấu trúc hoặc giá trị không hợp lệ
- **THEN** hệ thống trả `400 Bad Request` kèm thông tin lỗi validation

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

### Requirement: Candidate can update exam scores with exam certificate
System SHALL provide `PUT /api/candidate/profile/exam-scores-by-group` for the logged-in candidate to update exam scores and upload an `exam_certificate` file in the same `multipart/form-data` request.

#### Scenario: Update exam scores and certificate successfully
- **WHEN** candidate sends valid `scores` (JSON string with valid 4-subject rule), optional `foreign_language` (when `NGOAINGU` is present), and a valid `exam_certificate` file (PDF/JPEG/PNG)
- **THEN** system upserts `exam_scores`, soft-deletes old `EXAM_CERTIFICATE` documents, creates a new `EXAM_CERTIFICATE` document, and returns `200 OK`

#### Scenario: Reject request missing exam certificate
- **WHEN** candidate calls the API without `exam_certificate`
- **THEN** system returns `400 Bad Request`

#### Scenario: Reject malformed multipart JSON fields
- **WHEN** `scores` or `foreign_language` cannot be parsed as JSON
- **THEN** system returns `400 Bad Request`

#### Scenario: Reject invalid scores payload
- **WHEN** payload violates score rules (not exactly 4 subjects, missing TOAN/VAN, invalid optional subjects, or score out of 0..10)
- **THEN** system returns `400 Bad Request` with validation error details

#### Scenario: Candidate profile not found
- **WHEN** authenticated user has no candidate profile
- **THEN** system returns `404 Not Found`

#### Scenario: Profile completeness requires exam certificate
- **WHEN** candidate has complete score data but has no active `EXAM_CERTIFICATE` document
- **THEN** completeness middleware marks profile incomplete and blocks application submission
