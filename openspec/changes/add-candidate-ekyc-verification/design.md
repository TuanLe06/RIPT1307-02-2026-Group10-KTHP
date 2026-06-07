## Context

Hệ thống hiện có API quản lý hồ sơ thí sinh và API upload tài liệu tại `POST /api/candidate/profile/documents`. API này đang nhận nhiều loại minh chứng, bao gồm CCCD mặt trước, CCCD mặt sau và ảnh chân dung, rồi lưu file vào storage và bảng `candidate_documents`.

Luồng OCR CCCD được mô tả trong `backend/docs/citizen_id_ocr.md` cần được tích hợp như một bước xác thực riêng. Điểm quan trọng là upload tài liệu không đồng nghĩa xác thực thành công; thí sinh phải chủ động đi qua API eKYC riêng để hệ thống kiểm tra loại giấy tờ, khớp số CCCD và đối chiếu khuôn mặt.

## Goals / Non-Goals

**Goals:**

- Tách rõ API upload tài liệu và API xác thực eKYC.
- Thêm trạng thái xác thực định danh cho từng thí sinh.
- Dùng document đã upload làm đầu vào cho OCR/face matching thông qua `document_id`.
- Chặn tạo/nộp hồ sơ xét tuyển khi thí sinh chưa eKYC thành công.
- Không trả raw OCR response, FPT API key hoặc dữ liệu PII nhạy cảm ra frontend.

**Non-Goals:**

- Không thay đổi mục đích storage của `POST /api/candidate/profile/documents`.
- Không thay thế toàn bộ flow upload tài liệu hiện tại.
- Không yêu cầu admin xác thực thủ công trong phạm vi change này.
- Không lưu ảnh CCCD tạm theo `session_id` ở frontend; hệ thống dùng document đã upload làm nguồn xác thực.

## Decisions

### Dùng API eKYC riêng nhận `document_id`

Thêm nhóm API `POST /api/candidate/ekyc/front`, `POST /api/candidate/ekyc/back`, `POST /api/candidate/ekyc/verify` và `GET /api/candidate/ekyc/status`.

Lý do: tài liệu đã upload có ownership, `document_type`, `deleted_at`, `file_url` và metadata sẵn có. Nhận `document_id` giúp backend kiểm soát quyền truy cập, không để client tự gửi URL hoặc raw OCR data. Phương án để upload tự gọi OCR bị loại vì không thể phân biệt “upload thành công” với “xác thực thành công” và khó xử lý retry từng bước.

### Lưu trạng thái eKYC theo thí sinh

Thêm bảng `candidate_identity_verifications` liên kết `user_id`, `front_document_id`, `back_document_id`, `portrait_document_id`, trạng thái từng bước, `overall_status`, `similarity`, `failure_reason`, `verified_at`, `created_at`, `updated_at`.

Lý do: trạng thái eKYC là nghiệp vụ độc lập với file document. Một thí sinh có thể upload lại tài liệu nhiều lần, nhưng chỉ bộ document đang được xác thực mới quyết định khả năng nộp hồ sơ.

### Kiểm tra profile và document trước khi gọi provider

Mỗi API eKYC MUST kiểm tra user là `CANDIDATE`, document thuộc user hiện tại, document chưa bị soft delete và document đúng loại:

- `CITIZEN_ID_Front` cho xác thực mặt trước.
- `CITIZEN_ID_Back` cho xác thực mặt sau.
- `PORTRAIT` cho ảnh chân dung trong bước face matching.

Lý do: giảm rủi ro gọi OCR sai dữ liệu, tránh lộ file của user khác và giữ lỗi nghiệp vụ rõ ràng.

### Chặn tạo/nộp application bằng completeness middleware

Middleware hoàn thiện hồ sơ sẽ bổ sung điều kiện `candidate_identity_verifications.overall_status = VERIFIED`. Nếu chưa đạt, response completeness trả thiếu mục “Xác thực CCCD/eKYC”.

Lý do: `createApplication` và `submitApplication` đã đi qua completeness gate, nên thêm điều kiện ở đây giúp áp dụng đồng nhất.

### Reset trạng thái khi document liên quan thay đổi

Khi thí sinh soft delete hoặc thay mới document đã dùng trong eKYC, hệ thống reset step tương ứng và cập nhật `overall_status` về `UNVERIFIED` hoặc `PARTIAL`.

Lý do: trạng thái verified không còn đáng tin nếu nguồn ảnh đã bị thay đổi/xóa.

## Risks / Trade-offs

- Provider OCR/face matching lỗi hoặc timeout -> Trả lỗi thân thiện, giữ trạng thái hiện tại hoặc đánh dấu step `FAILED` kèm `failure_reason` rút gọn.
- File storage URL không đọc được từ backend -> Service eKYC phải dùng adapter tải file từ storage hiện có và log lỗi nội bộ.
- OCR đọc sai hoặc thiếu số CCCD -> Đánh dấu front step `FAILED`, không ghi đè dữ liệu hồ sơ bằng OCR.
- Tăng thời gian hoàn tất hồ sơ -> Frontend cần stepper/trạng thái rõ ràng để thí sinh biết bước nào cần làm lại.
- Dữ liệu nhạy cảm -> Chỉ lưu metadata cần thiết, không lưu raw OCR response, không trả thông tin PII nhạy cảm cho frontend/admin.
