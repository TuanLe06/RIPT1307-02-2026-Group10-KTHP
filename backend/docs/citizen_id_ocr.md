# eKYC CCCD cho thí sinh

## Tổng quan

Upload tài liệu và xác thực eKYC là hai flow riêng:

- `POST /api/candidate/profile/documents`: chỉ upload/lưu file minh chứng.
- `POST /api/candidate/ekyc/front`: xác thực CCCD mặt trước từ `document_id`.
- `POST /api/candidate/ekyc/back`: xác thực CCCD mặt sau từ `document_id`.
- `POST /api/candidate/ekyc/verify`: đối chiếu chân dung với CCCD mặt trước đã xác thực.
- `GET /api/candidate/ekyc/status`: xem trạng thái eKYC hiện tại.

Upload CCCD/ảnh chân dung thành công không đồng nghĩa eKYC thành công. Thí sinh chỉ được tạo hoặc nộp hồ sơ xét tuyển khi `overall_status = VERIFIED`.

## Flow chi tiết

### 1. Upload tài liệu

Thí sinh upload các tài liệu bằng API document hiện có:

- `CITIZEN_ID_Front`: CCCD mặt trước.
- `CITIZEN_ID_Back`: CCCD mặt sau.
- `PORTRAIT`: ảnh chân dung.

Response upload trả về `document.id`. Frontend dùng các id này để gọi API eKYC riêng.

### 2. Xác thực CCCD mặt trước

`POST /api/candidate/ekyc/front`

```json
{
  "document_id": 123
}
```

Backend xử lý:

- Kiểm tra document thuộc thí sinh hiện tại.
- Kiểm tra document chưa bị soft delete.
- Kiểm tra `document_type = CITIZEN_ID_Front`.
- Gọi FPT IDR.
- Kiểm tra `errorCode = 0`.
- Kiểm tra `type_new = "cccd_12_front"`.
- Kiểm tra số CCCD OCR khớp `candidate_profiles.citizen_id`.
- Lưu `front_status = VERIFIED` nếu hợp lệ.

### 3. Xác thực CCCD mặt sau

`POST /api/candidate/ekyc/back`

```json
{
  "document_id": 124
}
```

Backend xử lý:

- Kiểm tra document thuộc thí sinh hiện tại.
- Kiểm tra document chưa bị soft delete.
- Kiểm tra `document_type = CITIZEN_ID_Back`.
- Gọi FPT IDR.
- Kiểm tra `errorCode = 0`.
- Kiểm tra `type_new = "new_back"`.
- Lưu `back_status = VERIFIED` nếu hợp lệ.

### 4. Đối chiếu chân dung

`POST /api/candidate/ekyc/verify`

```json
{
  "front_document_id": 123,
  "portrait_document_id": 125
}
```

Backend xử lý:

- Yêu cầu CCCD mặt trước đã `VERIFIED`.
- Kiểm tra `front_document_id` và `portrait_document_id` thuộc thí sinh hiện tại.
- Kiểm tra portrait document có `document_type = PORTRAIT`.
- Gọi FPT face matching với ảnh CCCD mặt trước và ảnh chân dung.
- Kiểm tra `isMatch = true`.
- Kiểm tra `similarity >= EKYC_FACE_SIMILARITY_THRESHOLD`.
- Lưu `face_status = VERIFIED`, `similarity` và đặt `overall_status = VERIFIED` nếu các bước bắt buộc đều đạt.

## Trạng thái

Trạng thái từng bước:

- `PENDING`
- `VERIFIED`
- `FAILED`

Trạng thái tổng thể:

- `UNVERIFIED`: chưa có bước nào verified.
- `PARTIAL`: đã verified một phần.
- `VERIFIED`: front, back và face đều verified.
- `FAILED`: một bước xác thực thất bại.

## Lỗi chính

| API | Trường hợp | HTTP |
| --- | --- | --- |
| `/front`, `/back`, `/verify` | `document_id` không hợp lệ | `400` |
| `/front`, `/back`, `/verify` | document không tồn tại, không thuộc user hoặc đã bị xóa | `404` |
| `/front` | gửi sai mặt hoặc OCR không nhận đúng `cccd_12_front` | `422` |
| `/front` | số CCCD OCR không khớp hồ sơ | `422` |
| `/back` | gửi sai mặt hoặc OCR không nhận đúng `new_back` | `422` |
| `/verify` | CCCD mặt trước chưa verified | `409` |
| `/verify` | khuôn mặt không khớp hoặc similarity thấp | `422` |
| Tất cả | provider timeout/rate limit/lỗi tạm thời | `502` hoặc `503` |

## Bảo mật

- FPT API key chỉ nằm ở backend.
- Không trả raw OCR response ra frontend/admin.
- Không trả base64 ảnh gốc hoặc PII nhạy cảm trong response eKYC.
- Admin chỉ xem eKYC summary: trạng thái, similarity, `verified_at`, `failure_reason` rút gọn.
- Khi document đã dùng để verify bị soft delete, trạng thái eKYC liên quan phải reset.

## Biến môi trường

- `FPT_API_KEY` hoặc `FPT_EKYC_API_KEY`
- `FPT_IDR_ENDPOINT`, mặc định `https://api.fpt.ai/vision/idr/vnm/`
- `FPT_FACE_MATCH_ENDPOINT`, mặc định `https://api.fpt.ai/dmp/checkface/v1/`
- `FPT_EKYC_TIMEOUT_MS`, mặc định `15000`
- `EKYC_FACE_SIMILARITY_THRESHOLD`, mặc định `80`
