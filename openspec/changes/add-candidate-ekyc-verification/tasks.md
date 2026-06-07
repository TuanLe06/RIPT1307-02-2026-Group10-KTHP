## 1. Database và model

- [x] 1.1 Thêm migration tạo bảng `candidate_identity_verifications` với liên kết user/document, trạng thái từng bước, `overall_status`, `similarity`, `failure_reason`, `verified_at` và timestamps.
- [x] 1.2 Thêm model/repository để đọc, tạo mới, cập nhật trạng thái eKYC theo `user_id`.
- [x] 1.3 Thêm helper kiểm tra document thuộc thí sinh hiện tại, đúng `document_type` và chưa bị soft delete.

## 2. Provider và service eKYC

- [x] 2.1 Thêm cấu hình backend cho FPT OCR/face matching, gồm API key, base URL, timeout và ngưỡng similarity.
- [x] 2.2 Thêm adapter tải file từ storage hiện có bằng document metadata để gửi sang provider.
- [x] 2.3 Implement service xác thực CCCD mặt trước, kiểm tra `errorCode = 0`, `type_new = cccd_12_front` và số CCCD khớp hồ sơ.
- [x] 2.4 Implement service xác thực CCCD mặt sau, kiểm tra `errorCode = 0` và `type_new = new_back`.
- [x] 2.5 Implement service đối chiếu chân dung với CCCD mặt trước đã verified và cập nhật `overall_status`.
- [x] 2.6 Chuẩn hóa lỗi provider để không trả raw OCR response, API key hoặc PII nhạy cảm ra client.

## 3. API candidate eKYC

- [x] 3.1 Thêm route candidate `GET /api/candidate/ekyc/status`.
- [x] 3.2 Thêm route candidate `POST /api/candidate/ekyc/front` nhận `document_id`.
- [x] 3.3 Thêm route candidate `POST /api/candidate/ekyc/back` nhận `document_id`.
- [x] 3.4 Thêm route candidate `POST /api/candidate/ekyc/verify` nhận `front_document_id` và `portrait_document_id`.
- [x] 3.5 Mount route eKYC dưới middleware authentication và role `CANDIDATE`.

## 4. Tích hợp hồ sơ và tài liệu

- [x] 4.1 Cập nhật completeness middleware để yêu cầu eKYC `overall_status = VERIFIED`.
- [x] 4.2 Cập nhật response hồ sơ chưa hoàn thiện để báo thiếu mục “Xác thực CCCD/eKYC”.
- [x] 4.3 Giữ API upload document là storage-only và không gọi OCR/face matching trong flow upload.
- [x] 4.4 Reset trạng thái eKYC liên quan khi thí sinh soft delete document đã dùng cho front/back/portrait verification.

## 5. Admin và frontend

- [x] 5.1 Bổ sung eKYC summary an toàn vào API admin xem chi tiết thí sinh hoặc hồ sơ xét tuyển.
- [x] 5.2 Cập nhật frontend thí sinh để hiển thị tiến trình eKYC và gọi API eKYC riêng sau khi upload document.
- [x] 5.3 Khóa thao tác tạo/nộp hồ sơ trên frontend khi eKYC chưa `VERIFIED`.
- [x] 5.4 Cập nhật màn admin để hiển thị trạng thái eKYC, similarity, `verified_at` và `failure_reason` rút gọn.

## 6. Tests và tài liệu

- [x] 6.1 Thêm test upload CCCD thành công nhưng eKYC vẫn chưa `VERIFIED`.
- [x] 6.2 Thêm test eKYC từ chối document sai loại, document không thuộc user và document đã soft delete.
- [x] 6.3 Thêm test OCR sai mặt, CCCD mismatch, face mismatch và provider timeout/rate limit.
- [x] 6.4 Thêm test luồng thành công đủ front, back, portrait và chuyển `overall_status` thành `VERIFIED`.
- [x] 6.5 Thêm test completeness middleware chặn tạo/nộp hồ sơ khi eKYC chưa verified.
- [x] 6.6 Cập nhật `backend/docs/citizen_id_ocr.md` và tài liệu chức năng để mô tả flow dùng API eKYC riêng với `document_id`.
