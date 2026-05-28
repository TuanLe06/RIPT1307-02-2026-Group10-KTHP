## Why

Hệ thống tuyển sinh chưa có API xác thực nên thí sinh và quản trị viên không thể tạo phiên đăng nhập để sử dụng các chức năng được phân quyền. Cần bổ sung ngay đăng ký, đăng nhập và đăng xuất để mở khóa các luồng nghiệp vụ tiếp theo.

## What Changes

- Thêm API `POST /api/auth/register` cho thí sinh với thông tin bắt buộc: số CCCD, họ và tên, email và mật khẩu; mật khẩu được băm hash.
- Thêm API `POST /api/auth/login` cho thí sinh và quản trị viên đăng nhập bằng `email` + `password`, cấp JWT access token.
- Thêm API `POST /api/auth/logout` để kết thúc phiên phía ứng dụng (client hủy token và server ghi nhận sự kiện đăng xuất nếu cần).
- Thêm validate input, mã lỗi thống nhất và middleware xác thực liên quan đến luồng auth.

## Capabilities

### New Capabilities
- `user-authentication`: Cung cấp hành vi đăng ký, đăng nhập và đăng xuất cho người dùng trong hệ thống.

### Modified Capabilities
- None.

## Impact

- Affected code: auth module (route/controller/service/repository), user model, auth middleware.
- APIs: thêm mới nhóm endpoint `/api/auth/*`.
- Dependencies: sử dụng thư viện hash mật khẩu và JWT (secret đã có sẵn trong env).
- Systems: tác động đến luồng đăng nhập của thí sinh và quản trị viên.
