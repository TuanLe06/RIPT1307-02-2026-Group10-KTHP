# candidate-profile-management Specification

## Purpose
TBD - created by archiving change add-candidate-profile-api. Update Purpose after archive.
## Requirements
### Requirement: Candidate can view personal profile
Há»‡ thá»‘ng SHALL cung cáº¥p API `GET /api/candidate/profile` Ä‘á»ƒ thÃ­ sinh Ä‘Ã£ Ä‘Äƒng nháº­p láº¥y há»“ sÆ¡ cÃ¡ nhÃ¢n tá»•ng há»£p tá»« `users` vÃ  `candidate_profiles`, vá»›i cáº¥u trÃºc response gá»“m `user` vÃ  `candidate_profile`.

#### Scenario: Get profile successfully
- **WHEN** thÃ­ sinh Ä‘Äƒng nháº­p há»£p lá»‡ gá»i `GET /api/candidate/profile`
- **THEN** há»‡ thá»‘ng tráº£ `200 OK` vá»›i dá»¯ liá»‡u cÃ³ 2 pháº§n `user` vÃ  `candidate_profile`

#### Scenario: Reject unauthenticated request
- **WHEN** client gá»i `GET /api/candidate/profile` mÃ  khÃ´ng cÃ³ token há»£p lá»‡
- **THEN** há»‡ thá»‘ng tráº£ `401 Unauthorized`

#### Scenario: Reject non-candidate role
- **WHEN** ngÆ°á»i dÃ¹ng cÃ³ role khÃ¡c `CANDIDATE` gá»i `GET /api/candidate/profile`
- **THEN** há»‡ thá»‘ng tráº£ `403 Forbidden`

#### Scenario: Candidate profile not found
- **WHEN** user cÃ³ role `CANDIDATE` nhÆ°ng chÆ°a cÃ³ báº£n ghi tÆ°Æ¡ng á»©ng trong `candidate_profiles`
- **THEN** há»‡ thá»‘ng tráº£ `404 Not Found` vá»›i thÃ´ng bÃ¡o há»“ sÆ¡ chÆ°a tá»“n táº¡i

### Requirement: Candidate can update personal profile
Há»‡ thá»‘ng SHALL cung cáº¥p API `PUT /api/candidate/profile` Ä‘á»ƒ thÃ­ sinh cáº­p nháº­t thÃ´ng tin cÃ¡ nhÃ¢n theo whitelist trÆ°á»ng Ä‘Æ°á»£c phÃ©p, vá»›i `full_name` Ä‘Æ°á»£c lÆ°u chuáº©n táº¡i `candidate_profiles`.

#### Scenario: Update profile successfully
- **WHEN** thÃ­ sinh gá»­i `PUT /api/candidate/profile` vá»›i payload há»£p lá»‡
- **THEN** há»‡ thá»‘ng cáº­p nháº­t cÃ¡c trÆ°á»ng Ä‘Æ°á»£c phÃ©p vÃ  tráº£ `200 OK` vá»›i dá»¯ liá»‡u profile má»›i nháº¥t theo cáº¥u trÃºc `{ user, candidate_profile }`

#### Scenario: Update full_name in candidate profile
- **WHEN** payload cáº­p nháº­t cÃ³ thay Ä‘á»•i `full_name`
- **THEN** há»‡ thá»‘ng cáº­p nháº­t `candidate_profiles.full_name` vÃ  pháº£n há»“i dá»¯ liá»‡u má»›i nháº¥t tá»« nguá»“n chuáº©n nÃ y

#### Scenario: Reject invalid update payload
- **WHEN** thÃ­ sinh gá»­i `PUT /api/candidate/profile` vá»›i trÆ°á»ng khÃ´ng há»£p lá»‡ hoáº·c dá»¯ liá»‡u sai Ä‘á»‹nh dáº¡ng
- **THEN** há»‡ thá»‘ng tráº£ `400 Bad Request` kÃ¨m chi tiáº¿t lá»—i validation

#### Scenario: Reject unauthorized update request
- **WHEN** client gá»i `PUT /api/candidate/profile` mÃ  khÃ´ng cÃ³ token há»£p lá»‡ hoáº·c khÃ´ng pháº£i role `CANDIDATE`
- **THEN** há»‡ thá»‘ng tráº£ `401 Unauthorized` hoáº·c `403 Forbidden` tÆ°Æ¡ng á»©ng

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

### Requirement: Admin can update candidate exam scores by science group
Hệ thống SHALL cung cấp API `PUT /api/admin/candidates/:citizenId/exam-scores-by-group` để admin cập nhật điểm thi theo khối cho thí sinh, với khối `NATURAL` dùng các môn `TOAN`, `LY`, `HOA` và khối `SOCIAL` dùng các môn `VAN`, `SU`, `DIA`.

#### Scenario: Update NATURAL group scores successfully
- **WHEN** admin gọi API với `citizenId` hợp lệ, `science_group = NATURAL`, và payload `scores` chứa đủ `TOAN`, `LY`, `HOA` với điểm trong khoảng `0..10`
- **THEN** hệ thống upsert điểm vào `exam_scores`, cập nhật `academic_records.science_group = NATURAL`, và trả `200 OK`

#### Scenario: Update SOCIAL group scores successfully
- **WHEN** admin gọi API với `citizenId` hợp lệ, `science_group = SOCIAL`, và payload `scores` chứa đủ `VAN`, `SU`, `DIA` với điểm trong khoảng `0..10`
- **THEN** hệ thống upsert điểm vào `exam_scores`, cập nhật `academic_records.science_group = SOCIAL`, và trả `200 OK`

#### Scenario: Reject invalid subject set for selected group
- **WHEN** admin gửi payload `scores` thiếu môn, thừa môn, hoặc dùng mã môn không thuộc tổ hợp của `science_group` đã chọn
- **THEN** hệ thống trả `400 Bad Request` với thông tin lỗi validation

#### Scenario: Reject invalid score range
- **WHEN** admin gửi bất kỳ điểm môn nào nhỏ hơn `0` hoặc lớn hơn `10`
- **THEN** hệ thống trả `400 Bad Request` với thông tin lỗi validation

#### Scenario: Candidate not found
- **WHEN** admin gọi API với `citizenId` không tồn tại trong `candidate_profiles`
- **THEN** hệ thống trả `404 Not Found`

#### Scenario: Reject non-admin caller
- **WHEN** client gọi API mà không có token hợp lệ hoặc không có role `ADMIN`
- **THEN** hệ thống trả `401 Unauthorized` hoặc `403 Forbidden` tương ứng

