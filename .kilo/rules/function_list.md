# Danh sách Chức năng Hệ thống Tuyển sinh Đại học trực tuyến
Hệ thống bao gồm hai thành phần chính: **Hệ thống Tuyển sinh (Dành cho Thí sinh)** và **Hệ thống Quản lý (Dành cho Quản trị viên)**.

## 1. Phân hệ Thí sinh (Candidate Portal)

### 1.1 Quản lý Tài khoản
*   **Đăng ký:** Tạo tài khoản mới để tham gia xét tuyển.
*   **Đăng nhập/Đăng xuất:** Truy cập và thoát khỏi hệ thống an toàn.
*   **Quản lý mật khẩu:** Đổi mật khẩu hoặc khôi phục mật khẩu khi quên.

### 1.2 Quản lý Hồ sơ cá nhân
*   **Thông tin cá nhân:** Khai báo và chỉnh sửa thông tin định danh (Họ tên, ngày sinh, CCCD...).
*   **Thông tin học tập:** Nhập điểm số và quá trình học tập.
*   **Quản lý minh chứng:**
    *   Tải lên minh chứng (Học bạ, CCCD...) với định dạng **PDF, JPEG, PNG**.
    *   Xóa minh chứng đã tải lên nếu cần thay đổi.

### 1.3 Đăng ký Xét tuyển
*   **Chọn nguyện vọng:** Lựa chọn Trường, Ngành và Tổ hợp xét tuyển.
*   **Gửi hồ sơ:** Kiểm tra, xác nhận và gửi hồ sơ chính thức lên hệ thống.

### 1.4 Tra cứu & Theo dõi
*   **Trạng thái hồ sơ:** Xem danh sách hồ sơ đã nộp và theo dõi trạng thái: **Chờ duyệt, Đã duyệt, Từ chối**.
*   **Kết quả xét tuyển:** Tra cứu kết quả xét tuyển cuối cùng.

---

## 2. Phân hệ Quản trị viên (Admin Dashboard)

### 2.1 Quản lý Danh mục (Master Data)
*   **Quản lý Trường:** Thêm, sửa, xóa và xem chi tiết danh sách các Trường đại học.
*   **Quản lý Ngành học:** Thêm, sửa, xóa các Ngành học thuộc từng Trường cụ thể.
*   **Quản lý Tổ hợp:** Thiết lập các Tổ hợp xét tuyển tương ứng với từng Ngành học.

### 2.2 Quản lý Hồ sơ nộp
*   **Duyệt hồ sơ:** Xem danh sách và chi tiết hồ sơ thí sinh để xử lý trạng thái (Duyệt/Từ chối).
*   **Tìm kiếm & Lọc:** Tìm kiếm nhanh theo mã hồ sơ hoặc lọc theo Trường, Ngành và Trạng thái.

### 2.3 Quản lý Thông báo & Thống kê
*   **Thông báo:** Gửi email thông báo thủ công cho thí sinh khi có yêu cầu đặc biệt.
*   **Báo cáo & Thống kê:**
    *   Thống kê số lượng hồ sơ theo từng Trường.
    *   Thống kê số liệu theo Ngành học.
    *   Thống kê tỷ lệ hồ sơ theo Trạng thái.

---

## 3. Chức năng Hệ thống tự động
*   **Thông báo Email:** Hệ thống tự động gửi email xác nhận khi thí sinh nộp hồ sơ thành công hoặc khi Quản trị viên thay đổi trạng thái hồ sơ.

---

## 4. Quy trình Đăng ký Tuyển sinh (User Flow)

Trang web dành cho thí sinh cần được thiết kế tuân thủ quy trình 5 bước bắt buộc trước khi chuyển qua bước xử lý của Admin:
1.  **Bước 1:** Chọn nguyện vọng.
2.  **Bước 2:** Khai báo thông tin cá nhân.
3.  **Bước 3:** Nhập thông tin học tập.
4.  **Bước 4:** Tải lên minh chứng.
5.  **Bước 5:** Kiểm tra & Xác nhận.
6.  **Bước 6 (Admin):** Duyệt hồ sơ.