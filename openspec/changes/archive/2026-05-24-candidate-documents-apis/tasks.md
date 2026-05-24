## 1. Upload and Data Layer

- [x] 1.1 Thêm middleware upload multipart (`multer`) và validate file type PDF/JPEG/PNG
- [x] 1.2 Mở rộng model candidate profile để list documents theo user, tạo document metadata mới (kèm `public_id`), và soft delete theo `documentId`
- [x] 1.3 Tích hợp Cloudinary service để upload file buffer và nhận `secure_url`
- [x] 1.4 Tích hợp Cloudinary delete để xóa file vật lý trước khi cập nhật `deleted_at`

## 2. API Layer

- [x] 2.1 Thêm `GET /api/candidate/profile/documents`
- [x] 2.2 Thêm `POST /api/candidate/profile/documents` (multipart/form-data)
- [x] 2.3 Thêm `DELETE /api/candidate/profile/documents/:documentId`
- [x] 2.4 Cập nhật Swagger docs cho 3 endpoint minh chứng

## 3. Verification

- [x] 3.1 Bổ sung test cho list/upload/delete minh chứng và nhánh lỗi chính
- [x] 3.2 Chạy test backend và build để xác nhận không hồi quy
