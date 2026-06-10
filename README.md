<div align="center">

# 🎓 AdmiSX

### Hệ thống Quản lý Đăng ký Tuyển sinh Đại học

Nền tảng quản lý hồ sơ, nguyện vọng xét tuyển và thống kê tuyển sinh — gồm **Admin Panel** cho ban quản lý và **Candidate Portal** cho thí sinh, đồng bộ theo thời gian thực.

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📑 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Bắt đầu nhanh](#-bắt-đầu-nhanh)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)
- [API Endpoints (tổng quan)](#-api-endpoints-tổng-quan)
- [Scripts](#-scripts)
- [Biến môi trường](#-biến-môi-trường)
- [Tài liệu tham khảo](#-tài-liệu-tham-khảo)
- [Đội ngũ](#-đội-ngũ)

---

## 🎯 Giới thiệu

**AdmiSX** là hệ thống tuyển sinh trực tuyến được xây dựng theo mô hình **full-stack TypeScript**, phục vụ hai nhóm người dùng chính:

- **Thí sinh** — đăng ký tài khoản, khai báo hồ sơ (thông tin cá nhân, học bạ, điểm thi, minh chứng), nộp nguyện vọng xét tuyển vào các tổ hợp / ngành / trường.
- **Ban quản lý (Admin)** — quản lý danh mục (trường, ngành, tổ hợp, kỳ thi), duyệt hồ sơ, gửi thông báo thời gian thực, xem báo cáo & thống kê.

Hệ thống hỗ trợ **xác thực OTP qua email** (Brevo SMTP), **upload chứng chỉ / ảnh lên Cloudinary**, **thông báo real-time qua Socket.io** và **thống kê trực quan** trên dashboard.

> Repository này chứa **Admin Panel (`frontend/`)** + **Backend API (`backend/`)**. Candidate Portal nằm ở repo riêng.

---

## ✨ Tính năng chính

### 🔐 Xác thực & Phân quyền
- Đăng ký / đăng nhập (email + mật khẩu, JWT)
- Xác thực OTP khi đăng ký / quên mật khẩu (Brevo SMTP)
- Quản lý phiên (refresh token, logout, profile)
- Phân quyền Admin / User

### 🏛️ Quản lý danh mục
- **Trường đại học** — CRUD, logo, thông tin liên hệ
- **Ngành** — gắn với trường, mã ngành, chỉ tiêu
- **Tổ hợp môn** — tạo / gán tổ hợp cho ngành
- **Đợt xét tuyển** — cấu hình thời gian mở/đóng nộp hồ sơ

### 📄 Hồ sơ thí sinh
- Hồ sơ cá nhân (thông tin, địa chỉ, liên lạc)
- Học bạ (điểm từng năm lớp 10–12)
- Điểm thi theo tổ hợp (Toán, Lý, Hóa, Anh, …)
- Upload chứng chỉ (IELTS, TOEIC, giải thưởng, …) lên Cloudinary
- Kiểm tra đầy đủ hồ sơ trước khi nộp

### 📨 Quản lý hồ sơ ứng tuyển
- Thí sinh chọn nguyện vọng (tổ hợp → ngành → trường)
- Mỗi đợt chỉ nộp tối đa **một hồ sơ** (ràng buộc duy nhất)
- Admin duyệt / từ chối / yêu cầu bổ sung
- Realtime notification cho thí sinh khi trạng thái đổi

### 📊 Thống kê & Báo cáo
- Dashboard tổng quan (số hồ sơ, tỉ lệ duyệt, biểu đồ trạng thái)
- Thống kê theo trường / theo ngành / theo trạng thái
- Biểu đồ trực quan với `@ant-design/charts`

### ⚡ Realtime
- Socket.io cho notification đẩy về client
- Trạng thái đơn từ admin → thí sinh tức thì

---

## 🏗 Kiến trúc hệ thống

```
┌────────────────────┐         ┌──────────────────────┐
│  Candidate Portal  │         │   Admin Panel (FE)   │
│   (repo riêng)     │         │  React 19 + Vite +   │
│  React 19 + Vite   │         │      Ant Design 6    │
└─────────┬──────────┘         └──────────┬───────────┘
          │ HTTPS / REST + Socket.io       │
          └────────────────┬───────────────┘
                           ▼
              ┌────────────────────────┐
              │  Backend API (Node.js) │
              │  Express 5 + TS + JWT  │
              │  Swagger Docs  /api/.. │
              └──────────┬─────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
  ┌──────────┐    ┌──────────────┐   ┌──────────┐
  │  MySQL 8 │    │  Cloudinary  │   │Brevo SMTP│
  │ (admis_db)│    │ (media/PDF)  │   │ (OTP)    │
  └──────────┘    └──────────────┘   └──────────┘
```

---

## 📁 Cấu trúc thư mục

```
QL_DangKyTuyenSinh/
├── backend/                       # Node.js + Express 5 + TypeScript
│   ├── src/
│   │   ├── config/                #   DB, Swagger, env
│   │   ├── controllers/           #   auth, user, application, university, ...
│   │   ├── database/              #   migrate.ts, seed.ts
│   │   ├── docs/                  #   database-schema.md, ERD
│   │   ├── middleware/            #   auth, error handling, validation
│   │   ├── models/                #   MySQL queries
│   │   ├── routes/                #   /api/auth, /api/users, /api/applications, ...
│   │   ├── services/              #   cloudinary, email, local-upload
│   │   ├── tests/                 #   auth & candidate-profile tests
│   │   ├── types/                 #   shared TS types
│   │   ├── utils/                 #   helpers
│   │   └── server.ts              #   entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                      # React 19 + Vite 8 + Ant Design 6
│   ├── src/
│   │   ├── api/                   #   axios clients & API wrappers
│   │   ├── components/            #   common/ (ProtectedRoute, …), layout/
│   │   ├── hooks/                 #   custom React hooks
│   │   ├── pages/
│   │   │   ├── auth/              #     Login, Register, VerifyOtp, ForgotPassword
│   │   │   └── admin/             #     Dashboard, Universities, Majors,
│   │   │                          #     Combinations, Applications, Profile
│   │   ├── routes/                #   router config
│   │   ├── store/                 #   Zustand stores
│   │   ├── types/                 #   TS interfaces
│   │   ├── utils/                 #   formatters, helpers
│   │   └── main.tsx
│   ├── .env.example
│   ├── vite.config.ts
│   └── package.json
│
├── IMPLEMENTATION_GUIDE.md        # Tài liệu triển khai chi tiết
├── openspec/                      # OpenSpec change proposals
└── README.md
```

---

## 🛠 Công nghệ sử dụng

### 🖥️ Backend

| Công nghệ | Mục đích | Phiên bản |
|---|---|---|
| ![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white) | Runtime | 22.x |
| ![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white) | HTTP framework | 5.x |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white) | Ngôn ngữ | 5.x / 6.x |
| ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white) | CSDL quan hệ | 8.0 |
| ![JWT](https://img.shields.io/badge/JWT-9-000000?logo=jsonwebtokens&logoColor=white) | Xác thực | 9.x |
| ![bcrypt](https://img.shields.io/badge/bcryptjs-Password-3178C6?logo=javascript&logoColor=white) | Hash mật khẩu | 3.x |
| ![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io&logoColor=white) | Realtime | 4.x |
| ![Swagger](https://img.shields.io/badge/Swagger-5-85EA2D?logo=swagger&logoColor=black) | API docs | 5.x |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white) | Upload ảnh/PDF | 2.x |

### 🎨 Frontend

| Công nghệ | Mục đích | Phiên bản |
|---|---|---|
| ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) | UI framework | 19.x |
| ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) | Bundler / Dev server | 8.x |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white) | Ngôn ngữ | 5.x / 6.x |
| ![Ant Design](https://img.shields.io/badge/Ant_Design-6-0170FE?logo=antdesign&logoColor=white) | UI component | 6.x |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white) | Utility CSS | 4.x |
| ![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white) | Routing | 7.x |
| ![Zustand](https://img.shields.io/badge/Zustand-State-433103?logo=react&logoColor=white) | State management | 5.x |
| ![Axios](https://img.shields.io/badge/Axios-HTTP-5A29E4?logo=axios&logoColor=white) | HTTP client | 1.x |
| ![Zod](https://img.shields.io/badge/Zod-Validation-3068B7?logo=zod&logoColor=white) | Schema validation | 4.x |
| ![Socket.io Client](https://img.shields.io/badge/Socket.io_Client-4-010101?logo=socket.io&logoColor=white) | Realtime client | 4.x |
| ![Ant Charts](https://img.shields.io/badge/Ant_Design_Charts-2-0170FE?logo=antdesign&logoColor=white) | Biểu đồ | 2.x |
| ![Day.js](https://img.shields.io/badge/Day.js-Date-FF5F4D?logo=javascript&logoColor=white) | Date utils | 1.x |

### 🗄️ Database & Dịch vụ ngoài

| Dịch vụ | Mục đích |
|---|---|
| ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white) | CSDL chính |
| ![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448C5?logo=cloudinary&logoColor=white) | Lưu trữ ảnh / PDF chứng chỉ |
| ![Brevo](https://img.shields.io/badge/Brevo_SMTP-Email-0B996E?logo=maildotru&logoColor=white) | Gửi OTP qua email |
| ![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white) | Deploy frontend |
| ![Railway](https://img.shields.io/badge/Railway-Deploy-0B0D0E?logo=railway&logoColor=white) | Deploy backend |

---

## 🚀 Bắt đầu nhanh

### 📋 Yêu cầu

- **Node.js** ≥ 20
- **npm** ≥ 9
- **MySQL** ≥ 8.0
- Tài khoản **Cloudinary** (free tier OK) — cho upload ảnh/PDF
- Tài khoản **Brevo** (SMTP key) — cho gửi OTP

### 1️⃣ Clone & cài đặt

```bash
git clone https://github.com/TuanLe06/RIPT1307-02-2026-Group10-KTHP.git
cd RIPT1307-02-2026-Group10-KTHP

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2️⃣ Cấu hình môi trường

```bash
# Backend
cp backend/.env.example backend/.env
# Chỉnh: DB_*, JWT_SECRET, BREVO_SMTP_*, CLOUDINARY_*, ADMIN_EMAIL, ADMIN_PASSWORD

# Frontend
cp frontend/.env.example frontend/.env
# Chỉnh: VITE_API_URL=http://localhost:5000/api
```

### 3️⃣ Khởi tạo Database

```bash
# Tạo schema trong MySQL
mysql -u root -p -e "CREATE DATABASE admis_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Chạy migrate (tạo bảng)
cd backend
npm run db:migrate

# Seed tài khoản admin mặc định
npm run db:seed
```

### 4️⃣ Chạy dev

```bash
# Terminal 1 — Backend (http://localhost:5000, Swagger tại /api-docs)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Mở [http://localhost:5173](http://localhost:5173) và đăng nhập bằng tài khoản admin mặc định.

---

## 🌐 Triển khai

| Ứng dụng | URL |
|----------|-----|
| **Candidate Portal** | [https://admisx.vercel.app](https://admisx.vercel.app) |
| **Backend API** | [https://qldangkytuyensinh.up.railway.app](https://qldangkytuyensinh.up.railway.app) |
| **Swagger Docs** | [https://qldangkytuyensinh.up.railway.app/api-docs](https://qldangkytuyensinh.up.railway.app/api-docs) |

Frontend được deploy trên **Vercel**, backend được deploy trên **Railway**.

### Repository liên quan

**Candidate Portal** (giao diện thí sinh): [AdmiSX_Frontend](https://github.com/Kmisiz/AdmiSX_Frontend) — React 19 + Vite 8, nộp hồ sơ, eKYC, real-time notifications.

---

## 👤 Tài khoản mặc định

Sau khi `npm run db:seed`, tài khoản admin được tạo theo biến `ADMIN_EMAIL` / `ADMIN_PASSWORD` trong `backend/.env`.

| Vai trò | Email | Mật khẩu | Lưu ý |
|---|---|---|---|
| Admin | `admin@admisx.com` | *(giá trị trong `.env`)* | Toàn quyền quản lý |
| Candidate | *(tự đăng ký tại portal)* | — | Tạo qua `/api/auth/register` |

> ⚠️ **Đổi mật khẩu admin ngay sau lần đăng nhập đầu tiên** trong môi trường production.

---

## 📡 API Endpoints (tổng quan)

Backend base URL: `http://localhost:5000/api` — Swagger UI: `/api-docs`
> Production: `https://qldangkytuyensinh.up.railway.app/api`

### 🔑 Auth (`/api/auth`)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/register` | Đăng ký thí sinh |
| POST | `/verify-otp` | Xác thực OTP email |
| POST | `/login` | Đăng nhập |
| POST | `/forgot-password` | Yêu cầu reset mật khẩu |
| POST | `/reset-password` | Reset bằng OTP |
| POST | `/logout` | Đăng xuất |
| GET | `/profile` | Thông tin user hiện tại |

### 👤 Users (`/api/users`) — Admin only
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Danh sách users |
| GET | `/:id` | Chi tiết user |
| PUT | `/:id` | Cập nhật user |
| DELETE | `/:id` | Xóa user |
| POST | `/me/avatar` | Upload avatar (Cloudinary) |

### 🏛️ Universities & Majors
| Method | Endpoint | Mô tả |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/universities` | CRUD trường |
| GET/POST/PUT/DELETE | `/api/majors` | CRUD ngành |
| GET/POST/PUT/DELETE | `/api/combinations` | CRUD tổ hợp |
| GET/POST/PUT/DELETE | `/api/admission-combinations` | CRUD tổ hợp xét tuyển |
| GET/POST/PUT/DELETE | `/api/combination-assignments` | Gán tổ hợp cho ngành |

### 📄 Candidate Profile
| Method | Endpoint | Mô tả |
|---|---|---|
| GET/PUT | `/api/candidate/profile` | Hồ sơ cá nhân |
| GET | `/api/candidate/academic-record` | Học bạ |
| GET/POST/PUT/DELETE | `/api/candidate/exam-scores-by-group` | Điểm thi theo tổ hợp |
| GET/DELETE | `/api/candidate/documents/:id` | Chứng chỉ / minh chứng |
| GET | `/api/candidate/deadline` | Thời hạn nộp hồ sơ |
| GET | `/api/candidate/completeness` | Độ đầy đủ hồ sơ |

### 📨 Applications
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/candidate/applications` | Nộp hồ sơ (1/đợt) |
| GET | `/api/admin/applications` | Danh sách (admin) |
| PUT | `/api/admin/applications/:id` | Duyệt / từ chối |

### 🔔 Notifications & 📊 Reports
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/admin/notifications` | Danh sách thông báo |
| POST | `/api/admin/notifications` | Tạo broadcast |
| PUT | `/api/admin/notifications/:id/status` | Cập nhật trạng thái |
| GET | `/api/admin/reports/overall` | Thống kê tổng quan |
| GET | `/api/admin/reports/by-university` | Theo trường |
| GET | `/api/admin/reports/by-major` | Theo ngành |
| GET | `/api/admin/reports/by-status` | Theo trạng thái |

---

## 📜 Scripts

### Backend (`/backend`)
| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev với nodemon + ts-node |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Chạy production từ `dist/server.js` |
| `npm run db:migrate` | Chạy migrate schema |
| `npm run db:seed` | Seed tài khoản admin + dữ liệu mẫu |
| `npm run test:auth` | Test auth flow |
| `npm run test:candidate-profile` | Test candidate profile |
| `npm test` | Chạy toàn bộ test |

### Frontend (`/frontend`)
| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Vite dev server (HMR) |
| `npm run build` | Type-check + build production |
| `npm run preview` | Xem bản build |
| `npm run lint` | ESLint |

---

## 🔐 Biến môi trường

Xem chi tiết trong `backend/.env.example` và `frontend/.env.example`. Tóm tắt:

### `backend/.env`
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=...
DB_NAME=admis_db
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_LOGIN=...
BREVO_SMTP_KEY=...
BREVO_FROM_EMAIL=...
BREVO_FROM_NAME=AdmisX

OTP_EXPIRES_IN=5
OTP_RESEND_COOLDOWN=60

APPLICATION_START_DATE=02/07/2025
APPLICATION_END_DATE=12/07/2025

ADMIN_EMAIL=admin@admisx.com
ADMIN_PASSWORD=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_CANDIDATE_URL=
```

---

## 📚 Tài liệu tham khảo

- 📘 [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) — Triển khai chi tiết các tính năng
- 🗄️ [`backend/docs/database-schema.md`](./backend/docs/database-schema.md) — ERD + sơ đồ quan hệ
- 🛠️ [`backend/docs/database-physical-design.md`](./backend/docs/database-physical-design.md) — DDL
- 🌐 `http://localhost:5000/api-docs` — Swagger UI (khi chạy dev)
- 🌐 `https://qldangkytuyensinh.up.railway.app/api-docs` — Swagger UI (production)
- 📂 [`openspec/`](./openspec) — OpenSpec change proposals

---

## 👥 Đội ngũ

| Thành viên | Vai trò | GitHub |
|---|---|---|
| **Lê Anh Tuấn** | Backend | [TuanLe06](https://github.com/TuanLe06) |
| **Đỗ Quốc Khánh** | Frontend Lead | [Kmisiz](https://github.com/Kmisiz) |
| **Tống Quang Việt** | Backend Lead| [Tống Việt](https://github.com/tongviet-hub) |
| **Phùng Đăng Dương** | Frontend | [Dwngphun](https://github.com/Dwngphun) |

---

<div align="center">

Made with ❤️ by the AdmiSX team · © 2026

</div>
