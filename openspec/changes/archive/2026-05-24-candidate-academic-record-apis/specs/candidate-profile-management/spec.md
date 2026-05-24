## ADDED Requirements

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
