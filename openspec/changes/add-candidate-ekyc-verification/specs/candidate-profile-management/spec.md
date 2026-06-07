## MODIFIED Requirements

### Requirement: Candidate can upload supporting document
Hệ thống SHALL cung cấp API `POST /api/candidate/profile/documents` để thí sinh upload minh chứng bằng `multipart/form-data`, chỉ chấp nhận file type PDF/JPEG/PNG. API này SHALL chỉ lưu file và tạo bản ghi tài liệu; upload thành công MUST NOT được hiểu là xác thực CCCD/eKYC thành công.

#### Scenario: Upload document successfully
- **WHEN** thí sinh gọi `POST /api/candidate/profile/documents` với file hợp lệ
- **THEN** hệ thống upload file lên cloud storage, tạo bản ghi trong `candidate_documents` và trả `201 Created`

#### Scenario: Upload citizen ID document without verification
- **WHEN** thí sinh upload tài liệu loại `CITIZEN_ID_Front`, `CITIZEN_ID_Back` hoặc `PORTRAIT` thành công
- **THEN** hệ thống chỉ tạo bản ghi tài liệu và không tự gọi OCR, không tự gọi face matching, không tự đặt trạng thái eKYC là `VERIFIED`

#### Scenario: Reject invalid file type
- **WHEN** thí sinh upload file không thuộc PDF/JPEG/PNG
- **THEN** hệ thống trả `400 Bad Request` với thông báo lỗi validate file type

## ADDED Requirements

### Requirement: Profile completeness requires verified eKYC
Hệ thống SHALL xem hồ sơ thí sinh là chưa hoàn thiện nếu thí sinh chưa có trạng thái eKYC tổng thể là `VERIFIED`.

#### Scenario: Block application creation when eKYC is not verified
- **WHEN** thí sinh có thông tin hồ sơ và minh chứng khác hợp lệ nhưng eKYC chưa `VERIFIED` tạo hồ sơ xét tuyển
- **THEN** hệ thống chặn request bằng completeness middleware và trả thông tin thiếu mục “Xác thực CCCD/eKYC”

#### Scenario: Block application submission when eKYC is not verified
- **WHEN** thí sinh có application nháp nhưng eKYC chưa `VERIFIED` nộp hồ sơ xét tuyển
- **THEN** hệ thống chặn request bằng completeness middleware và trả thông tin thiếu mục “Xác thực CCCD/eKYC”

#### Scenario: Allow application flow when eKYC is verified
- **WHEN** thí sinh đã có eKYC `VERIFIED` và các điều kiện hoàn thiện hồ sơ khác đều đạt
- **THEN** hệ thống cho phép tiếp tục luồng tạo hoặc nộp hồ sơ xét tuyển theo quy định hiện có

### Requirement: eKYC status resets when verified documents change
Hệ thống SHALL reset trạng thái eKYC liên quan khi tài liệu CCCD hoặc chân dung đã dùng để xác thực bị soft delete hoặc được thay bằng tài liệu mới.

#### Scenario: Reset front verification when front document is deleted
- **WHEN** thí sinh soft delete document đang được lưu là `front_document_id`
- **THEN** hệ thống reset `front_status`, `face_status` nếu phụ thuộc vào mặt trước đó và cập nhật `overall_status` không còn là `VERIFIED`

#### Scenario: Reset back verification when back document is deleted
- **WHEN** thí sinh soft delete document đang được lưu là `back_document_id`
- **THEN** hệ thống reset `back_status` và cập nhật `overall_status` không còn là `VERIFIED`

#### Scenario: Reset face verification when portrait document is deleted
- **WHEN** thí sinh soft delete document đang được lưu là `portrait_document_id`
- **THEN** hệ thống reset `face_status` và cập nhật `overall_status` không còn là `VERIFIED`
