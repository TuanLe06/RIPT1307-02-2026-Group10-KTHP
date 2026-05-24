## ADDED Requirements

### Requirement: User registration for candidate accounts
Hệ thống SHALL cung cấp API để đăng ký tài khoản thí sinh mới với các trường bắt buộc `citizen_id` (số CCCD), `full_name`, `email`, `password`, đồng thời lưu dữ liệu với mật khẩu được hash an toàn.

#### Scenario: Register candidate successfully
- **WHEN** client gửi request `POST /api/auth/register` hợp lệ với `citizen_id`, `full_name`, `email`, `password`
- **THEN** hệ thống tạo bản ghi mới trong `users` với `role=CANDIDATE`, `status=ACTIVE`, tạo bản ghi liên kết trong `candidate_profiles` với `citizen_id` và `full_name`, và trả về phản hồi thành công không lộ dữ liệu mật khẩu

#### Scenario: Reject duplicate registration identity
- **WHEN** client gửi `POST /api/auth/register` với `email` đã tồn tại trong `users` hoặc `citizen_id` đã tồn tại trong `candidate_profiles`
- **THEN** hệ thống trả về `409 Conflict` kèm mã lỗi trùng định danh rõ ràng

#### Scenario: Reject invalid registration payload
- **WHEN** client gửi `POST /api/auth/register` thiếu `citizen_id`, `full_name`, `email`, `password` hoặc mật khẩu không đạt chính sách
- **THEN** hệ thống trả về `400 Bad Request` kèm chi tiết lỗi validation

#### Scenario: Roll back registration when profile creation fails
- **WHEN** hệ thống đã tạo bản ghi `users` nhưng tạo `candidate_profiles` thất bại trong cùng request đăng ký
- **THEN** toàn bộ giao dịch bị rollback và không để lại tài khoản đăng ký dở dang

### Requirement: User login for candidate and admin roles
Hệ thống SHALL cung cấp API xác thực tài khoản thí sinh hoặc quản trị viên bằng `email` và `password`, sau đó cấp JWT access token cho phiên hợp lệ.

#### Scenario: Login successfully and receive tokens
- **WHEN** client gửi thông tin đăng nhập hợp lệ đến `POST /api/auth/login`
- **THEN** hệ thống xác thực thông tin, trả về JWT access token và bao gồm vai trò người dùng trong metadata phản hồi

#### Scenario: Reject invalid credentials
- **WHEN** client gửi `POST /api/auth/login` với mật khẩu sai hoặc tài khoản không tồn tại
- **THEN** hệ thống trả về `401 Unauthorized` với lỗi xác thực thất bại dạng tổng quát

#### Scenario: Reject disabled or blocked account
- **WHEN** client gửi thông tin hợp lệ cho tài khoản bị đánh dấu inactive hoặc blocked
- **THEN** hệ thống trả về `403 Forbidden` và không cấp token

### Requirement: Session logout with stateless JWT contract
Hệ thống SHALL cung cấp API đăng xuất phiên hiện tại theo cơ chế stateless JWT, trả về phản hồi thành công để client hủy token cục bộ.

#### Scenario: Logout successfully
- **WHEN** client gửi request `POST /api/auth/logout` hợp lệ với ngữ cảnh xác thực
- **THEN** hệ thống trả về phản hồi thành công và kết thúc phiên ở phía ứng dụng

#### Scenario: Logout idempotent for already invalidated token
- **WHEN** client gọi `POST /api/auth/logout` nhiều lần cho cùng một phiên đăng nhập
- **THEN** hệ thống trả về phản hồi tương đương thành công (idempotent)

#### Scenario: Reject logout without authentication context
- **WHEN** client gọi `POST /api/auth/logout` mà không có ngữ cảnh xác thực/session token bắt buộc
- **THEN** hệ thống trả về `401 Unauthorized`
