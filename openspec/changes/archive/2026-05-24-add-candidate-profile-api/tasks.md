## 1. Data Access and Validation Setup

- [x] 1.1 Tạo hoặc cập nhật model/repository để đọc hồ sơ hợp nhất từ `users` + `candidate_profiles` theo `user_id`
- [x] 1.2 Tạo hoặc cập nhật hàm update profile theo whitelist field trong `candidate_profiles`
- [x] 1.3 Thêm validation middleware cho `PUT /api/candidate/profile` (kiểu dữ liệu, enum `gender`, độ dài chuỗi)

## 2. API Implementation

- [x] 2.1 Triển khai `GET /api/candidate/profile` với `authenticate` + `authorize('CANDIDATE')`, response `{ user, candidate_profile }`
- [x] 2.2 Triển khai `PUT /api/candidate/profile` với quyền `CANDIDATE`, xử lý cập nhật và trả dữ liệu mới nhất theo cùng cấu trúc
- [x] 2.3 Triển khai cập nhật `full_name` trực tiếp tại `candidate_profiles` theo nguồn chuẩn
- [x] 2.4 Chuẩn hóa response lỗi cho các nhánh `401`, `403`, `404`, `400`
- [x] 2.5 Kết nối route `/api/candidate/profile` vào router chính, cập nhật Swagger docs

## 3. Verification

- [x] 3.1 Thêm automated tests cho GET/PUT profile: thành công, thiếu token, sai role, hồ sơ không tồn tại
- [x] 3.2 Thêm test validation cho payload update không hợp lệ
- [x] 3.3 Chạy build, test suite backend, và smoke test API profile trước khi merge
