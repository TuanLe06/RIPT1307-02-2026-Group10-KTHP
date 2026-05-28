# 🚀 MyApp - Fullstack Project Base

React + Ant Design 5 (TypeScript) | Node.js Express | MySQL

## 📁 Cấu trúc dự án

```
project/
├── frontend/               # React + Ant Design 5 + TypeScript
│   └── src/
│       ├── api/            # Axios instances & API calls
│       ├── components/     # Reusable components
│       │   ├── common/     # ProtectedRoute, etc.
│       │   └── layout/     # AppLayout (Sidebar + Header)
│       ├── pages/          # Pages (auth, dashboard, users...)
│       ├── store/          # Zustand state management
│       └── types/          # TypeScript interfaces
│
├── backend/                # Node.js Express + TypeScript
│   └── src/
│       ├── config/         # DB config
│       ├── controllers/    # Route handlers
│       ├── database/       # Migrate & Seed scripts
│       ├── middleware/     # Auth, Error handling
│       ├── models/         # MySQL query models
│       ├── routes/         # Express routers
│       └── types/          # TypeScript types
│
└── docker-compose.yml      # MySQL + Backend + Frontend
```

## ⚡ Bắt đầu nhanh

### 1. Cài đặt dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### 2. Cấu hình môi trường

```bash
# Backend
cp backend/.env.example backend/.env
# Chỉnh sửa DB_PASSWORD, JWT_SECRET trong backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Khởi tạo Database

```bash
# Tạo DB trong MySQL, sau đó chạy migrate
cd backend && npm run db:migrate

# Tạo dữ liệu mẫu (admin & user)
npm run db:seed
```

### 4. Chạy dự án

```bash
# Terminal 1 - Backend (port 5000)
cd backend && npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend && npm run dev
```

## 🔐 Tài khoản mặc định (sau khi seed)

| Vai trò | Email             | Mật khẩu |
| ------- | ----------------- | -------- |
| Admin   | admin@example.com | admin123 |
| User    | user@example.com  | user123  |

## 🛠 Tech Stack

### Frontend

- **React 18** + **TypeScript** + **Vite**
- **Ant Design 5** - UI Components
- **React Router v6** - Routing
- **Zustand** - State Management
- **Axios** - HTTP Client
- **Day.js** - Date formatting

### Backend

- **Node.js** + **Express** + **TypeScript**
- **MySQL2** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **express-validator** - Input validation

### Database

- **MySQL 8.0**

## 📡 API Endpoints

### Auth

| Method | URL                | Mô tả                         |
| ------ | ------------------ | ----------------------------- |
| POST   | /api/auth/register | Đăng ký                       |
| POST   | /api/auth/login    | Đăng nhập                     |
| GET    | /api/auth/profile  | Thông tin cá nhân (cần token) |

### Users (cần token)

| Method | URL            | Mô tả           | Quyền |
| ------ | -------------- | --------------- | ----- |
| GET    | /api/users     | Danh sách users | Admin |
| GET    | /api/users/:id | Chi tiết user   | Auth  |
| PUT    | /api/users/:id | Cập nhật user   | Admin |
| DELETE | /api/users/:id | Xóa user        | Admin |

## 🔧 Mở rộng dự án

Thêm module mới (ví dụ: Products):

1. `backend/src/models/product.model.ts`
2. `backend/src/controllers/product.controller.ts`
3. `backend/src/routes/product.routes.ts`
4. Đăng ký route trong `server.ts`
5. `frontend/src/api/product.api.ts`
6. `frontend/src/pages/products/ProductsPage.tsx`
7. Thêm menu item vào `AppLayout.tsx`
