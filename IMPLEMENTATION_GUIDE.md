# Tài liệu Triển khai Các Tính năng Mới

## Tổng quan

Đã triển khai hoàn chỉnh các tính năng theo yêu cầu từ các phần 4, 5, 6, 7, 8 của quy trình đăng ký tuyển sinh.

---

## I. BACKEND (Node.js/TypeScript)

### 1. Models (Mô hình dữ liệu)

#### 1.1 Application Model (`src/models/application.model.ts`)

- Quản lý thông tin hồ sơ nộp
- Các phương thức:
  - `create()`: Tạo hồ sơ mới
  - `findById()`: Lấy chi tiết hồ sơ
  - `findByCandidateId()`: Lấy hồ sơ của thí sinh
  - `findAllByAdmin()`: Lấy danh sách hồ sơ với lọc
  - `submit()`: Nộp hồ sơ
  - `updateStatus()`: Cập nhật trạng thái
  - `getStatistics()`: Lấy thống kê

#### 1.2 Combination Models (`src/models/combination.model.ts`)

- **AdmissionCombinationModel**: Quản lý tổ hợp xét tuyển
  - `create()`, `findById()`, `findByCode()`, `findAll()`
- **MajorCombinationModel**: Kết nối ngành với tổ hợp
  - `create()`, `findById()`, `findByMajorId()`, `update()`, `delete()`

#### 1.3 Notification Models (`src/models/notification.model.ts`)

- **EmailNotificationModel**: Quản lý thông báo email
  - `create()`, `findById()`, `findPending()`, `updateStatus()`, `findByReceiverId()`
- **ApplicationStatusLogModel**: Ghi log các thay đổi trạng thái
  - `create()`, `findById()`, `findByApplicationId()`, `findByChangedBy()`

### 2. Controllers (Bộ điều khiển)

#### 2.1 Catalog Management Controller (`src/controllers/catalog-management.controller.ts`)

Quản lý danh mục trường và ngành:

- `createUniversity()`, `updateUniversity()`, `deleteUniversity()`
- `listUniversities()`, `getUniversityDetails()`
- `createMajor()`, `updateMajor()`, `deleteMajor()`
- `listMajorsByUniversity()`, `getMajorDetails()`

#### 2.2 Combination Controller (`src/controllers/combination.controller.ts`)

Quản lý tổ hợp xét tuyển:

- `createAdmissionCombination()`, `listAdmissionCombinations()`
- `addCombinationToMajor()`, `updateMajorCombination()`, `removeCombinationFromMajor()`
- `listCombinationsByMajor()`

#### 2.3 Application Controller (`src/controllers/application.controller.ts`)

Theo dõi hồ sơ của thí sinh:

- `createApplication()`: Tạo hồ sơ mới
- `submitApplication()`: Nộp hồ sơ
- `getApplications()`: Xem danh sách hồ sơ
- `getApplicationDetails()`: Xem chi tiết hồ sơ
- `getApplicationStatus()`: Xem trạng thái hồ sơ
- `deleteApplication()`: Xóa hồ sơ (chỉ trạng thái DRAFT)

#### 2.4 Admin Application Controller (`src/controllers/admin-application.controller.ts`)

Quản lý hồ sơ từ phía admin:

- `listApplications()`: Xem danh sách hồ sơ
- `searchApplications()`: Tìm kiếm hồ sơ
- `filterApplications()`: Lọc hồ sơ
- `getApplicationDetailAdmin()`: Xem chi tiết hồ sơ
- `updateApplicationStatus()`: Cập nhật trạng thái hồ sơ

#### 2.5 Notification Controller (`src/controllers/notification.controller.ts`)

Quản lý thông báo email:

- `sendManualNotification()`: Gửi thông báo từng người
- `sendNotificationToMultipleCandidates()`: Gửi hàng loạt
- `getNotifications()`: Xem thông báo
- `getNotificationDetail()`: Chi tiết thông báo
- `getPendingNotifications()`: Xem thông báo chưa gửi
- `updateNotificationStatus()`: Cập nhật trạng thái thông báo

#### 2.6 Report Controller (`src/controllers/report.controller.ts`)

Báo cáo và thống kê:

- `getStatisticsByUniversity()`: Thống kê theo trường
- `getStatisticsByMajor()`: Thống kê theo ngành
- `getStatisticsByStatus()`: Thống kê theo trạng thái
- `getOverallStatistics()`: Tổng quan thống kê
- `getStatisticsByDateRange()`: Thống kê theo khoảng thời gian
- `getDetailedReport()`: Báo cáo chi tiết

### 3. Routes (Đường dẫn API)

#### 3.1 Admin Routes (`src/routes/admin-full.routes.ts`)

- **Quản lý Trường**: POST, PUT, DELETE, GET `/universities`
- **Quản lý Ngành**: POST, PUT, DELETE, GET `/majors`
- **Quản lý Tổ hợp**: POST, GET `/admission-combinations`, `/major-combinations`
- **Quản lý Hồ sơ**: GET, POST `/applications`, PUT `/applications/:id/status`
- **Thông báo**: POST `/notifications/send`, `/notifications/send-bulk`
- **Báo cáo**: GET `/reports/statistics/*`

#### 3.2 Candidate Routes (`src/routes/candidate.routes.ts`)

- **Hồ sơ**: POST, GET, DELETE `/applications`, POST `/applications/:id/submit`
- **Thông báo**: GET `/notifications`

### 4. Integration

- Cập nhật `server.ts` để đăng ký các routes mới

---

## II. FRONTEND (React/TypeScript)

### 1. Candidate Pages (Trang thí sinh)

#### 1.1 Application Tracking Page (`src/pages/candidate/ApplicationTrackingPage.tsx`)

**Tính năng:**

- Xem danh sách hồ sơ đã nộp
- Lọc theo trạng thái
- Xem chi tiết hồ sơ
- Nộp hồ sơ (từ trạng thái DRAFT)
- Xóa hồ sơ nháp

#### 1.2 Result Query Page (`src/pages/candidate/ResultQueryPage.tsx`)

**Tính năng:**

- Tra cứu kết quả xét tuyển
- Xem thống kê: tổng số, đã đỗ, không đỗ
- Xem danh sách hồ sơ có kết quả

### 2. Admin Pages (Trang quản trị)

#### 2.1 Catalog Management Page (`src/pages/admin/CatalogManagementPage.tsx`)

**Tính năng:**

- Quản lý danh sách trường (thêm, sửa, xóa)
- Quản lý danh sách ngành (thêm, sửa, xóa)
- Tab chuyên biệt cho mỗi loại danh mục

#### 2.2 Application Management Page (`src/pages/admin/ApplicationManagementPage.tsx`)

**Tính năng:**

- Xem danh sách hồ sơ
- Tìm kiếm hồ sơ (tên, email, mã hồ sơ)
- Lọc theo trạng thái
- Xem chi tiết hồ sơ
- Cập nhật trạng thái hồ sơ
- Thêm lý do từ chối

#### 2.3 Statistics Page (`src/pages/admin/StatisticsPage.tsx`)

**Tính năng:**

- Thống kê tổng quan (tổng hồ sơ, trường, ngành, ứng viên)
- Thống kê trạng thái hồ sơ
- Thống kê theo trường
- Thống kê theo ngành
- Hiển thị 3 tab với dữ liệu chi tiết

#### 2.4 Notification Management Page (`src/pages/admin/NotificationManagementPage.tsx`)

**Tính năng:**

- Gửi thông báo từng ứng viên
- Gửi thông báo hàng loạt
- Lọc ứng viên theo trường, ngành, trạng thái
- Lưu lịch sử thông báo

#### 2.5 Combination Management Page (`src/pages/admin/CombinationManagementPage.tsx`)

**Tính năng:**

- Xem danh sách tổ hợp xét tuyển
- Thêm tổ hợp mới
- Thêm tổ hợp cho từng ngành
- Xóa tổ hợp khỏi ngành
- Cập nhật điểm tối thiểu

---

## III. Các Trạng thái Hồ sơ

1. **DRAFT**: Nháp - chưa nộp
2. **SUBMITTED**: Đã nộp - chờ xem xét
3. **PENDING_REVIEW**: Chờ duyệt - đang được xem xét
4. **APPROVED**: Đã duyệt - hồ sơ được chấp thuận
5. **REJECTED**: Từ chối - hồ sơ bị loại
6. **PASSED**: Đã đỗ - ứng viên trúng tuyển
7. **FAILED**: Không đỗ - ứng viên không trúng tuyển

---

## IV. Các Tính năng Chính

### 4.1 Theo dõi Trạng thái (Section 4)

- ✅ Xem danh sách hồ sơ đã nộp
- ✅ Xem chi tiết trạng thái hồ sơ
- ✅ Tra cứu kết quả xét tuyển cuối cùng

### 4.2 Quản lý Danh mục (Section 5)

- ✅ Thêm/Sửa/Xóa Trường
- ✅ Xem danh sách Trường
- ✅ Thêm/Sửa/Xóa Ngành
- ✅ Xem danh sách Ngành theo Trường
- ✅ Quản lý Tổ hợp xét tuyển

### 4.3 Quản lý Hồ sơ Nộp (Section 6)

- ✅ Xem danh sách hồ sơ
- ✅ Tìm kiếm hồ sơ
- ✅ Lọc hồ sơ
- ✅ Xem chi tiết hồ sơ
- ✅ Xử lý trạng thái hồ sơ

### 4.4 Quản lý Thông báo (Section 7)

- ✅ Tự động gửi email khi nộp hồ sơ
- ✅ Tự động gửi email khi thay đổi trạng thái
- ✅ Gửi email thủ công cho thí sinh
- ✅ Gửi email hàng loạt

### 4.5 Báo cáo & Thống kê (Section 8)

- ✅ Thống kê theo Trường
- ✅ Thống kê theo Ngành
- ✅ Thống kê theo Trạng thái
- ✅ Tổng quan thống kê
- ✅ Thống kê theo khoảng thời gian

---

## V. Hướng dẫn Sử dụng API

### Endpoints Chính

#### Candidate

```
POST   /api/candidate-applications/applications                  # Tạo hồ sơ
POST   /api/candidate-applications/applications/:id/submit       # Nộp hồ sơ
GET    /api/candidate-applications/applications                  # Xem danh sách
GET    /api/candidate-applications/applications/:id              # Chi tiết
DELETE /api/candidate-applications/applications/:id              # Xóa
```

#### Admin - Quản lý Danh mục

```
POST   /api/admin/universities                                    # Thêm trường
PUT    /api/admin/universities/:id                               # Sửa trường
DELETE /api/admin/universities/:id                               # Xóa trường
GET    /api/admin/universities                                   # Danh sách trường

POST   /api/admin/majors                                          # Thêm ngành
PUT    /api/admin/majors/:id                                     # Sửa ngành
DELETE /api/admin/majors/:id                                     # Xóa ngành
GET    /api/admin/universities/:id/majors                        # Danh sách ngành
```

#### Admin - Quản lý Hồ sơ

```
GET    /api/admin/applications                                   # Danh sách
POST   /api/admin/applications/search                            # Tìm kiếm
POST   /api/admin/applications/filter                            # Lọc
GET    /api/admin/applications/:id                               # Chi tiết
PUT    /api/admin/applications/:id/status                        # Cập nhật trạng thái
```

#### Admin - Thông báo

```
POST   /api/admin/notifications/send                             # Gửi từng người
POST   /api/admin/notifications/send-bulk                        # Gửi hàng loạt
GET    /api/admin/notifications                                  # Danh sách
```

#### Admin - Báo cáo

```
GET    /api/admin/reports/statistics/overall                     # Tổng quan
GET    /api/admin/reports/statistics/by-university               # Theo trường
GET    /api/admin/reports/statistics/by-major                    # Theo ngành
GET    /api/admin/reports/statistics/by-status                   # Theo trạng thái
```

---

## VI. Lưu ý Quan trọng

1. **Database**: Tất cả các bảng cần được tạo theo schema trong `database-schema.md`
2. **Authentication**: Tất cả endpoints (trừ auth) đều yêu cầu token JWT
3. **Authorization**: Admin endpoints yêu cầu role='ADMIN'
4. **Email**: Hiện tại thực hiện tạo records, cần setup email service để thực sự gửi email
5. **File Upload**: Có thể mở rộng để upload tài liệu liên quan hồ sơ

---

## VII. Cấu trúc Thư mục

### Backend

```
src/
├── models/
│   ├── application.model.ts
│   ├── combination.model.ts
│   └── notification.model.ts
├── controllers/
│   ├── catalog-management.controller.ts
│   ├── combination.controller.ts
│   ├── application.controller.ts
│   ├── admin-application.controller.ts
│   ├── notification.controller.ts
│   └── report.controller.ts
└── routes/
    ├── admin-full.routes.ts
    └── candidate.routes.ts
```

### Frontend

```
src/pages/
├── candidate/
│   ├── ApplicationTrackingPage.tsx
│   └── ResultQueryPage.tsx
└── admin/
    ├── CatalogManagementPage.tsx
    ├── ApplicationManagementPage.tsx
    ├── StatisticsPage.tsx
    ├── NotificationManagementPage.tsx
    └── CombinationManagementPage.tsx
```

---

## VIII. Tiếp theo

1. Setup email service (nodemailer hoặc SendGrid) để gửi email thực tế
2. Thêm upload tài liệu hồ sơ
3. Thêm xác thực email
4. Thêm reset mật khẩu
5. Triển khai các tính năng nâng cao (AI matching, etc.)
