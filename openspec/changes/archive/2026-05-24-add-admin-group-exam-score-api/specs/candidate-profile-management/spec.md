## ADDED Requirements

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
