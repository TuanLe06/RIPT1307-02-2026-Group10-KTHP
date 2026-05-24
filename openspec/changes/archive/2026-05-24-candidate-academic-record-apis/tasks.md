## 1. Data Layer

- [x] 1.1 Mở rộng model candidate profile để đọc dữ liệu `academic_records` và danh sách `academic_progress` theo `user_id`
- [x] 1.2 Thêm hàm upsert cho `academic_records` theo whitelist field
- [x] 1.3 Thêm hàm upsert `academic_progress` cho các khối lớp 10/11/12

## 2. API Layer

- [x] 2.1 Thêm validator cho payload `PUT /academic-record` (graduation_year, subject scores, priority_score)
- [x] 2.2 Thêm validator cho payload `PUT /academic-progress` (cấu trúc theo lớp và điểm hợp lệ)
- [x] 2.3 Thêm controller/service methods cho GET/PUT academic record và PUT academic progress
- [x] 2.4 Đăng ký 3 routes mới dưới `/api/candidate/profile` với `authenticate` + `authorize('CANDIDATE')`
- [x] 2.5 Cập nhật Swagger docs cho 3 API học tập

## 3. Verification

- [x] 3.1 Bổ sung test cho 3 endpoint (happy path, unauthorized/forbidden, payload invalid)
- [x] 3.2 Chạy test suite backend và build để xác nhận không gây hồi quy
