## 1. Mô hình dữ liệu và cấu hình

- [x] 1.1 Rà soát mapping bảng `users` và `candidate_profiles` theo schema (`users.email` unique, `candidate_profiles.citizen_id` PK) và cập nhật model/entity nếu lệch
- [x] 1.2 Dùng secret JWT đã có sẵn trong env, chỉ bổ sung cấu hình TTL access token nếu còn thiếu trong `.env.example`
- [x] 1.3 Định nghĩa hằng số liên quan auth và mã lỗi dùng chung cho luồng đăng ký/đăng nhập/đăng xuất

## 2. Triển khai Auth API

- [x] 2.1 Triển khai `POST /api/auth/register` với validate bắt buộc `citizen_id`, `full_name`, `email`, `password`, kiểm tra trùng định danh và hash mật khẩu
- [x] 2.2 Triển khai transaction tạo đồng thời `users` + `candidate_profiles` để đảm bảo nhất quán dữ liệu đăng ký
- [x] 2.3 Thiết lập mặc định tài khoản thí sinh mới `status=ACTIVE` ngay sau đăng ký thành công
- [x] 2.4 Triển khai `POST /api/auth/login` với xác thực thông tin đăng nhập, metadata theo role và cấp token
- [x] 2.5 Triển khai cấp JWT access token bằng secret trong env và cập nhật `last_login_at` khi đăng nhập thành công
- [x] 2.6 Triển khai `POST /api/auth/logout` theo cơ chế stateless idempotent (không ghi `audit_logs` trong phạm vi change này)
- [x] 2.7 Kết nối auth routes/controllers/services vào router backend chính và chuẩn hóa response format

## 3. Kiểm thử và gia cố chất lượng

- [x] 3.1 Thêm automated tests cho các kịch bản thành công và thất bại của register/login/logout theo spec
- [x] 3.2 Thêm test authorization và validation cho các nhánh thiếu token, sai credential, tài khoản bị khóa và đăng ký trùng
- [x] 3.3 Chạy toàn bộ backend test suite và smoke test API thủ công (Postman hoặc tương đương) trước khi merge
