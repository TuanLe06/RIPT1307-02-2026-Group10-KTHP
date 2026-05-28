## Context

Backend cần bổ sung nhóm API xác thực cho 2 vai trò chính: thí sinh và quản trị viên. Theo thiết kế CSDL hiện tại (MySQL), bảng `users` dùng `email` unique, còn số CCCD nằm ở `candidate_profiles.citizen_id` (PK) và liên kết 1-1 với `users` qua `user_id`. Vì vậy, luồng đăng ký thí sinh cần tạo dữ liệu nhất quán giữa 2 bảng.

## Goals / Non-Goals

**Goals:**
- Cung cấp endpoint đăng ký bắt buộc có `citizen_id` (CCCD), `full_name`, `email`, `password`.
- Tạo đồng thời bản ghi `users` (role `CANDIDATE`) và `candidate_profiles` để lưu CCCD theo đúng schema.
- Cung cấp endpoint đăng nhập bằng `email` + `password`, trả về JWT access token.
- Cung cấp endpoint đăng xuất theo hợp đồng stateless JWT.
- Chuẩn hóa validate input và cấu trúc lỗi để frontend tích hợp ổn định.

**Non-Goals:**
- Chưa bao gồm quên mật khẩu, đổi mật khẩu, xác thực email OTP.
- Chưa triển khai refresh token/session store hoặc blacklist token server-side.
- Chưa mở rộng SSO hay đăng nhập bằng bên thứ ba.

## Decisions

1. Đăng ký tạo dữ liệu ở cả `users` và `candidate_profiles` trong một transaction.
- Rationale: tránh trạng thái lệch dữ liệu khi một bảng ghi thành công còn bảng kia thất bại.
- Alternative considered: chỉ tạo `users` lúc đăng ký, tạo `candidate_profiles` sau. Không chọn vì yêu cầu bắt buộc CCCD ngay khi đăng ký.

2. Trường bắt buộc của register: `citizen_id`, `full_name`, `email`, `password`.
- Rationale: phù hợp yêu cầu nghiệp vụ tuyển sinh hiện tại.
- Alternative considered: đăng ký tối giản chỉ email/password. Không chọn vì không đáp ứng yêu cầu thu CCCD ngay.

3. Token strategy: JWT access token ký bằng secret đã có sẵn trong env.
- Rationale: tận dụng cấu hình hiện có, triển khai nhanh trong phạm vi auth cơ bản.
- Alternative considered: thêm refresh token + token store. Không chọn trong change này vì tăng phạm vi và chưa có yêu cầu bắt buộc.

4. Logout scope: API logout trả về thành công theo cơ chế stateless; client chịu trách nhiệm xóa token cục bộ.
- Rationale: phù hợp mô hình JWT stateless hiện tại.
- Alternative considered: thu hồi token server-side. Không chọn trong phạm vi change này.

5. Ràng buộc tài khoản theo bảng `users`.
- Rationale: `email` unique; tài khoản `status=LOCKED` không được cấp token.
- Alternative considered: bỏ kiểm tra `status` khi đăng nhập. Không chọn vì không an toàn vận hành.

6. Trạng thái mặc định tài khoản thí sinh mới: `ACTIVE`.
- Rationale: đúng yêu cầu nghiệp vụ hiện tại, cho phép thí sinh đăng nhập ngay sau khi đăng ký thành công.
- Alternative considered: `PENDING` và chặn đăng nhập đến khi duyệt. Không chọn trong phạm vi change này.

## Risks / Trade-offs

- [Không thu hồi JWT ngay lập tức khi logout] -> Mitigation: TTL access token ngắn, client bắt buộc xóa token khi logout.
- [Đăng ký trùng CCCD hoặc email] -> Mitigation: bắt lỗi unique/PK và trả `409 Conflict` với mã lỗi rõ ràng.
- [Lệch dữ liệu giữa `users` và `candidate_profiles`] -> Mitigation: dùng transaction cho toàn bộ bước tạo tài khoản.
- [Sai lệch timezone khi ghi thời gian đăng nhập] -> Mitigation: chuẩn hóa UTC cho `last_login_at`.

## Migration Plan

1. Rà soát `.env`/`.env.example`, giữ secret JWT hiện có và bổ sung TTL access token nếu thiếu.
2. Triển khai module auth (route/controller/service/repository) với transaction cho register.
3. Viết test cho register/login/logout theo spec.
4. Rollback: tắt route auth mới nếu phát hiện lỗi nghiêm trọng.

## Open Questions

- None.
