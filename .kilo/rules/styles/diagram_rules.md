# Hệ Thống Tuyển Sinh

## Tổng Quan

Hệ thống tuyển sinh được xây dựng nhằm hỗ trợ:

- Quản lý thí sinh
- Quản lý hồ sơ xét tuyển
- Quản lý trường đại học và ngành học
- Quản lý tổ hợp xét tuyển
- Theo dõi trạng thái hồ sơ
- Gửi thông báo email
- Lưu nhật ký hoạt động hệ thống

Database sử dụng: **MySQL**

---

# Các Enum

## Vai Trò Người Dùng

| Giá trị | Ý nghĩa |
|---|---|
| THI_SINH | Người đăng ký xét tuyển |
| QUAN_TRI_VIEN | Quản trị hệ thống |

---

## Trạng Thái Người Dùng

| Giá trị | Ý nghĩa |
|---|---|
| HOAT_DONG | Tài khoản hoạt động |
| BI_KHOA | Tài khoản bị khóa |
| CHO_XAC_THUC | Chờ xác thực |

---

## Trạng Thái Chung

| Giá trị | Ý nghĩa |
|---|---|
| HOAT_DONG | Đang hoạt động |
| KHONG_HOAT_DONG | Ngừng hoạt động |

---

## Giới Tính

| Giá trị | Ý nghĩa |
|---|---|
| NAM | Nam |
| NU | Nữ |
| KHAC | Khác |

---

## Trạng Thái Hồ Sơ

| Giá trị | Ý nghĩa |
|---|---|
| NHAP | Hồ sơ đang nhập |
| DA_NOP | Đã nộp hồ sơ |
| CHO_DUYET | Chờ duyệt |
| DA_DUYET | Đã duyệt |
| TU_CHOI | Bị từ chối |
| TRUNG_TUYEN | Trúng tuyển |
| KHONG_TRUNG_TUYEN | Không trúng tuyển |

---

## Loại Giấy Tờ

| Giá trị | Ý nghĩa |
|---|---|
| HOC_BA | Học bạ |
| CAN_CUOC_CONG_DAN | CCCD |
| ANH_CHAN_DUNG | Ảnh chân dung |
| CHUNG_CHI | Chứng chỉ |
| KHAC | Tài liệu khác |

---

## Loại Tập Tin

| Giá trị | Ý nghĩa |
|---|---|
| PDF | File PDF |
| JPEG | Ảnh JPEG |
| PNG | Ảnh PNG |

---

## Loại Email

| Giá trị | Ý nghĩa |
|---|---|
| HO_SO_DA_NOP | Thông báo hồ sơ đã nộp |
| THAY_DOI_TRANG_THAI | Thông báo thay đổi trạng thái |
| GUI_THU_CONG | Email gửi thủ công |
| DAT_LAI_MAT_KHAU | Email đặt lại mật khẩu |

---

## Trạng Thái Email

| Giá trị | Ý nghĩa |
|---|---|
| CHO_GUI | Chờ gửi |
| DA_GUI | Đã gửi |
| GUI_LOI | Gửi thất bại |

---

# Danh Sách Bảng

---

# 1. nguoi_dung

Lưu thông tin tài khoản hệ thống.

## Các cột chính

| Cột | Kiểu | Mô tả |
|---|---|---|
| ma_nguoi_dung | bigint | Khóa chính |
| email | varchar | Email đăng nhập |
| mat_khau_ma_hoa | varchar | Mật khẩu mã hóa |
| ho_ten | varchar | Họ tên |
| so_dien_thoai | varchar | Số điện thoại |
| gioi_tinh | varchar | Giới tính |
| vai_tro | enum | Vai trò |
| trang_thai | enum | Trạng thái tài khoản |

---

# 2. ma_dat_lai_mat_khau

Lưu token đặt lại mật khẩu.

## Chức năng

- Hỗ trợ quên mật khẩu
- Quản lý thời hạn token
- Theo dõi token đã sử dụng

---

# 3. truong_dai_hoc

Lưu danh sách trường đại học.

## Thông tin chính

- Mã trường
- Tên trường
- Địa chỉ
- Website
- Thông tin liên hệ

---

# 4. nganh_hoc

Lưu danh sách ngành thuộc trường đại học.

## Quan hệ

- Một trường có nhiều ngành
- Một ngành thuộc một trường

---

# 5. to_hop_xet_tuyen

Lưu các tổ hợp môn xét tuyển.

## Ví dụ

| Mã | Môn |
|---|---|
| A00 | Toán - Lý - Hóa |
| D01 | Toán - Văn - Anh |

---

# 6. nganh_to_hop_xet_tuyen

Liên kết ngành học với tổ hợp xét tuyển.

## Chức năng

- Quy định ngành được xét bởi tổ hợp nào
- Thiết lập điểm sàn cho từng tổ hợp

---

# 7. ho_so_thi_sinh

Lưu hồ sơ cá nhân của thí sinh.

## Thông tin chính

- CCCD
- Họ tên
- Ngày sinh
- Địa chỉ
- Dân tộc
- Tôn giáo

---

# 8. ho_so_xet_tuyen

Lưu hồ sơ đăng ký xét tuyển.

## Thông tin chính

| Cột | Ý nghĩa |
|---|---|
| ma_ho_so | Mã hồ sơ |
| ma_thi_sinh | Thí sinh đăng ký |
| ma_truong | Trường đăng ký |
| ma_nganh | Ngành đăng ký |
| ma_to_hop | Tổ hợp xét tuyển |
| trang_thai | Trạng thái hồ sơ |

## Quy trình hồ sơ

```text
NHAP
→ DA_NOP
→ CHO_DUYET
→ DA_DUYET / TU_CHOI
→ TRUNG_TUYEN / KHONG_TRUNG_TUYEN
```

---

# 9. ket_qua_hoc_tap

Lưu kết quả học tập của thí sinh.

## Bao gồm

- Điểm các môn
- Điểm ưu tiên
- Tổng điểm
- Điểm xét tuyển

---

# 10. qua_trinh_hoc_tap

Lưu quá trình học tập theo từng lớp.

## Ví dụ

- Lớp 10
- Lớp 11
- Lớp 12

---

# 11. giay_to_thi_sinh

Quản lý tài liệu tải lên của thí sinh.

## Bao gồm

- Học bạ
- CCCD
- Ảnh chân dung
- Chứng chỉ

---

# 12. lich_su_trang_thai_ho_so

Lưu lịch sử thay đổi trạng thái hồ sơ.

## Mục đích

- Theo dõi quá trình xét duyệt
- Audit thay đổi trạng thái

---

# 13. thong_bao_email

Lưu lịch sử gửi email.

## Chức năng

- Theo dõi email đã gửi
- Kiểm tra lỗi gửi email
- Queue email chờ gửi

---

# 14. nhat_ky_he_thong

Lưu nhật ký hoạt động hệ thống.

## Bao gồm

- Người thao tác
- Hành động
- Dữ liệu cũ
- Dữ liệu mới
- Địa chỉ IP

---

# Quan Hệ Chính

## Người dùng

- `nguoi_dung` ↔ `ho_so_thi_sinh`
- `nguoi_dung` ↔ `ho_so_xet_tuyen`
- `nguoi_dung` ↔ `thong_bao_email`

---

## Trường - Ngành

- Một trường có nhiều ngành
- Một ngành thuộc một trường

---

## Ngành - Tổ hợp

- Một ngành có nhiều tổ hợp
- Một tổ hợp dùng cho nhiều ngành

---

## Hồ sơ xét tuyển

Liên kết:

- Thí sinh
- Trường
- Ngành
- Tổ hợp xét tuyển

---

# Tính Năng Hệ Thống

## Quản lý tài khoản

- Đăng ký
- Đăng nhập
- Quên mật khẩu
- Phân quyền

---

## Quản lý tuyển sinh

- Tạo hồ sơ
- Nộp hồ sơ
- Xét duyệt hồ sơ
- Quản lý trạng thái

---

## Quản lý tài liệu

- Upload giấy tờ
- Kiểm tra định dạng file
- Quản lý dung lượng file

---

## Thông báo

- Gửi email tự động
- Gửi email thủ công
- Theo dõi trạng thái gửi

---

## Audit hệ thống

- Lưu lịch sử thao tác
- Theo dõi thay đổi dữ liệu
- Kiểm tra log hệ thống

---

# Gợi Ý Index

## Các cột nên đánh index

- email
- ma_truong
- ma_nganh
- trang_thai
- ngay_tao

---

# Công Nghệ Đề Xuất

| Thành phần | Công nghệ |
|---|---|
| Database | MySQL |
| Backend | NestJS / Spring Boot |
| Frontend | React + TailwindCSS |
| ORM | Prisma / TypeORM |
| Upload file | MinIO / S3 |
| Email | SMTP / Resend |

---

# Mục Tiêu Thiết Kế

- Chuẩn hóa dữ liệu
- Dễ mở rộng
- Hỗ trợ audit
- Hỗ trợ realtime notification
- Dễ tích hợp API
- Tối ưu quản lý hồ sơ tuyển sinh