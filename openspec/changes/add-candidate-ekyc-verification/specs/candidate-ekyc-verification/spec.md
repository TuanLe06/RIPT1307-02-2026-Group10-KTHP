## ADDED Requirements

### Requirement: Candidate can view eKYC status
Hệ thống SHALL cung cấp API `GET /api/candidate/ekyc/status` để thí sinh đang đăng nhập xem trạng thái xác thực định danh hiện tại, bao gồm trạng thái tổng thể, trạng thái từng bước, document đang được dùng, độ tương đồng khuôn mặt nếu có, thời gian xác thực và lý do thất bại rút gọn nếu có.

#### Scenario: Get eKYC status with no verification yet
- **WHEN** thí sinh chưa từng thực hiện eKYC gọi `GET /api/candidate/ekyc/status`
- **THEN** hệ thống trả `200 OK` với `overall_status` là `UNVERIFIED`

#### Scenario: Get existing eKYC status
- **WHEN** thí sinh đã thực hiện một hoặc nhiều bước eKYC gọi `GET /api/candidate/ekyc/status`
- **THEN** hệ thống trả `200 OK` với trạng thái từng bước và không trả raw OCR response hoặc PII nhạy cảm

#### Scenario: Reject unauthorized eKYC status request
- **WHEN** client không có token hợp lệ hoặc không phải role `CANDIDATE` gọi `GET /api/candidate/ekyc/status`
- **THEN** hệ thống trả `401 Unauthorized` hoặc `403 Forbidden` tương ứng

### Requirement: Candidate can verify citizen ID front document
Hệ thống SHALL cung cấp API `POST /api/candidate/ekyc/front` để xác thực CCCD mặt trước từ document đã upload, với payload chứa `document_id`.

#### Scenario: Verify front document successfully
- **WHEN** thí sinh gửi `document_id` thuộc tài liệu `CITIZEN_ID_Front`, chưa bị xóa, OCR trả `errorCode = 0`, `type_new = cccd_12_front` và số CCCD khớp hồ sơ thí sinh
- **THEN** hệ thống lưu `front_status` là `VERIFIED`, cập nhật `front_document_id`, cập nhật `overall_status` phù hợp và trả `200 OK`

#### Scenario: Reject front verification with wrong document type
- **WHEN** thí sinh gửi `document_id` không thuộc loại `CITIZEN_ID_Front`
- **THEN** hệ thống trả `400 Bad Request` và không gọi OCR provider

#### Scenario: Reject front verification with non-owned document
- **WHEN** thí sinh gửi `document_id` không tồn tại, đã bị soft delete hoặc không thuộc quyền sở hữu của mình
- **THEN** hệ thống trả `404 Not Found`

#### Scenario: Front OCR detects wrong side
- **WHEN** OCR trả kết quả không phải `type_new = cccd_12_front`
- **THEN** hệ thống lưu `front_status` là `FAILED`, lưu `failure_reason` rút gọn và trả `422 Unprocessable Entity`

#### Scenario: Front OCR citizen ID mismatch
- **WHEN** OCR đọc được số CCCD nhưng số đó không khớp với `candidate_profiles.citizen_id`
- **THEN** hệ thống lưu `front_status` là `FAILED`, không cập nhật hồ sơ cá nhân và trả `422 Unprocessable Entity`

### Requirement: Candidate can verify citizen ID back document
Hệ thống SHALL cung cấp API `POST /api/candidate/ekyc/back` để xác thực CCCD mặt sau từ document đã upload, với payload chứa `document_id`.

#### Scenario: Verify back document successfully
- **WHEN** thí sinh gửi `document_id` thuộc tài liệu `CITIZEN_ID_Back`, chưa bị xóa, OCR trả `errorCode = 0` và `type_new = new_back`
- **THEN** hệ thống lưu `back_status` là `VERIFIED`, cập nhật `back_document_id`, cập nhật `overall_status` phù hợp và trả `200 OK`

#### Scenario: Reject back verification with wrong document type
- **WHEN** thí sinh gửi `document_id` không thuộc loại `CITIZEN_ID_Back`
- **THEN** hệ thống trả `400 Bad Request` và không gọi OCR provider

#### Scenario: Reject back verification with non-owned document
- **WHEN** thí sinh gửi `document_id` không tồn tại, đã bị soft delete hoặc không thuộc quyền sở hữu của mình
- **THEN** hệ thống trả `404 Not Found`

#### Scenario: Back OCR detects wrong side
- **WHEN** OCR trả kết quả không phải `type_new = new_back`
- **THEN** hệ thống lưu `back_status` là `FAILED`, lưu `failure_reason` rút gọn và trả `422 Unprocessable Entity`

### Requirement: Candidate can verify portrait against citizen ID
Hệ thống SHALL cung cấp API `POST /api/candidate/ekyc/verify` để đối chiếu ảnh chân dung đã upload với CCCD mặt trước đã xác thực, với payload chứa `front_document_id` và `portrait_document_id`.

#### Scenario: Verify portrait successfully
- **WHEN** thí sinh gửi `front_document_id` đã được xác thực mặt trước và `portrait_document_id` thuộc tài liệu `PORTRAIT`, face matching trả `isMatch = true` và similarity đạt ngưỡng cấu hình
- **THEN** hệ thống lưu `face_status` là `VERIFIED`, lưu `portrait_document_id`, lưu `similarity`, đặt `overall_status` là `VERIFIED` khi các bước bắt buộc đều đạt và trả `200 OK`

#### Scenario: Reject portrait verification before front verification
- **WHEN** thí sinh gọi `POST /api/candidate/ekyc/verify` nhưng CCCD mặt trước chưa được xác thực thành công
- **THEN** hệ thống trả `409 Conflict`

#### Scenario: Reject portrait verification with wrong portrait document type
- **WHEN** `portrait_document_id` không thuộc loại `PORTRAIT`
- **THEN** hệ thống trả `400 Bad Request` và không gọi face matching provider

#### Scenario: Portrait face mismatch
- **WHEN** face matching trả `isMatch = false` hoặc similarity thấp hơn ngưỡng cấu hình
- **THEN** hệ thống lưu `face_status` là `FAILED`, lưu `failure_reason` rút gọn, không đặt `overall_status` là `VERIFIED` và trả `422 Unprocessable Entity`

### Requirement: eKYC verification protects sensitive provider data
Hệ thống MUST giữ FPT API key và raw provider response ở backend, đồng thời SHALL chỉ trả dữ liệu trạng thái đã rút gọn cho frontend và admin.

#### Scenario: Provider response is sanitized
- **WHEN** một bước eKYC hoàn tất, thất bại hoặc provider trả lỗi
- **THEN** response API không chứa FPT API key, raw OCR response, ảnh gốc dạng base64 hoặc PII nhạy cảm ngoài dữ liệu tối thiểu cần hiển thị trạng thái

#### Scenario: Provider rate limit or timeout
- **WHEN** OCR hoặc face matching provider bị rate limit, timeout hoặc lỗi tạm thời
- **THEN** hệ thống trả lỗi phù hợp, lưu `failure_reason` rút gọn nếu cần và không đánh dấu bước đó là `VERIFIED`

### Requirement: Admin can view candidate eKYC summary
Hệ thống SHALL cho admin xem tóm tắt trạng thái eKYC của thí sinh trong ngữ cảnh xem hồ sơ hoặc hồ sơ xét tuyển, bao gồm trạng thái tổng thể, thời gian xác thực, similarity và lý do thất bại rút gọn nếu có.

#### Scenario: Admin views eKYC summary
- **WHEN** admin mở chi tiết thí sinh hoặc hồ sơ xét tuyển
- **THEN** hệ thống trả kèm thông tin eKYC summary an toàn và không trả raw OCR response hoặc PII nhạy cảm
