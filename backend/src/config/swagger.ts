const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Tuyen Sinh Backend API",
    version: "1.0.0",
    description: "Tai lieu API cho he thong tuyen sinh",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local server",
    },
  ],
  tags: [
    { name: "Health", description: "Kiem tra trang thai he thong" },
    { name: "Auth", description: "Dang ky, dang nhap, dang xuat, profile" },
    { name: "Universities", description: "Quan ly thong tin truong dai hoc" },
    { name: "Majors", description: "Quan ly thong tin nganh hoc theo truong" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Server healthy",
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Dang ky tai khoan thi sinh",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["citizen_id", "full_name", "email", "password"],
                properties: {
                  citizen_id: {
                    type: "integer",
                    format: "int64",
                    example: 123456789012,
                  },
                  full_name: { type: "string", example: "Nguyen Van A" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "a@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 6,
                    example: "secret123",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Dang ky thanh cong" },
          400: { description: "Du lieu khong hop le" },
          409: { description: "Trung email hoac CCCD" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Dang nhap bang email va mat khau",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "a@example.com",
                  },
                  password: { type: "string", example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Dang nhap thanh cong" },
          401: { description: "Sai thong tin dang nhap" },
          403: { description: "Tai khoan bi khoa" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Dang xuat (stateless)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Dang xuat thanh cong" },
          401: { description: "Khong co token hoac token khong hop le" },
        },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Lay thong tin profile nguoi dang nhap",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Lay profile thanh cong" },
          401: { description: "Khong co token hoac token khong hop le" },
          404: { description: "Khong tim thay user" },
        },
      },
    },
    // ─── Universities ───────────────────────────────────────────
    "/api/universities": {
      post: {
        tags: ["Universities"],
        summary: "Them truong dai hoc moi",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "name"],
                properties: {
                  code: { type: "string", example: "HUST", description: "Mã viết tắt của trường" },
                  name: {
                    type: "string",
                    example: "Học viện Công nghệ bưu chính viễn thông",
                  },
                  address: { type: "string", example: "Hà Đông, Hà nội" },
                  phone: { type: "string", example: "02812345678" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "ptit@ptit.edu.vn",
                  },
                  website: { type: "string", example: "https://ptit.edu.vn" },
                  description: {
                    type: "string",
                    example: "Truong cong nghe hang dau Viet Nam",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Them truong thanh cong" },
          400: { description: "Du lieu khong hop le" },
          409: { description: "Ma truong da ton tai" },
        },
      },
      get: {
        tags: ["Universities"],
        summary: "Danh sach tat ca truong dai hoc (co phan trang)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 10 },
          },
        ],
        responses: {
          200: { description: "Lay danh sach truong thanh cong" },
        },
      },
    },
    "/api/universities/{code}": {
      get: {
        tags: ["Universities"],
        summary: "Chi tiet mot truong dai hoc (tim bang ma viet tat)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "code",
            in: "path",
            required: true,
            schema: { type: "string", example: "HUST", description: "Mã viết tắt của trường" },
          },
        ],
        responses: {
          200: { description: "Lay thong tin truong thanh cong" },
          404: { description: "Khong tim thay truong" },
        },
      },
    },
    "/api/universities/{id}": {
      put: {
        tags: ["Universities"],
        summary: "Sua thong tin truong dai hoc",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^DH\\d{6}$", example: "DH000001", description: "Mã tự động (DH + 6 số)" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: { type: "string", example: "HUST", description: "Mã viết tắt của trường" },
                  name: {
                    type: "string",
                    example: "Truong Dai hoc Cong nghe Thong tin",
                  },
                  address: { type: "string" },
                  phone: { type: "string" },
                  email: { type: "string", format: "email" },
                  website: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cap nhat truong thanh cong" },
          400: { description: "Du lieu khong hop le" },
          404: { description: "Khong tim thay truong" },
          409: { description: "Ma truong da ton tai" },
        },
      },
      delete: {
        tags: ["Universities"],
        summary: "Xoa mem truong dai hoc",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^DH\\d{6}$", example: "DH000001", description: "Mã tự động (DH + 6 số)" },
          },
        ],
        responses: {
          200: { description: "Xoa truong thanh cong" },
          404: { description: "Khong tim thay truong" },
          409: { description: "Co du lieu lien quan, khong the xoa" },
        },
      },
    },
    // ─── Majors ─────────────────────────────────────────────────
    "/api/universities/{universityCode}/majors": {
      get: {
        tags: ["Majors"],
        summary: "Danh sach nganh hoc cua mot truong (tim bang ma viet tat)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "universityCode",
            in: "path",
            required: true,
            schema: { type: "string", example: "HUST", description: "Mã viết tắt của trường" },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, default: 10 },
          },
        ],
        responses: {
          200: { description: "Lay danh sach nganh thanh cong" },
          400: { description: "Du lieu khong hop le" },
          404: { description: "Khong tim thay truong" },
        },
      },
    },
    "/api/universities/{universityId}/majors": {
      post: {
        tags: ["Majors"],
        summary: "Them nganh hoc cho mot truong",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "universityId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "^DH\\d{6}$", example: "DH000001", description: "Mã tự động (DH + 6 số)" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "name", "admission_combinations_id"],
                properties: {
                  code: { type: "string", example: "CNTT", description: "Mã viết tắt của ngành" },
                  name: { type: "string", example: "Cong nghe thong tin" },
                  description: { type: "string" },
                  admission_combinations_id: { type: "integer", example: 1 },
                  min_score: { type: "number", format: "float", example: 22.5 },
                  status: {
                    type: "string",
                    enum: ["ACTIVE", "INACTIVE"],
                    default: "ACTIVE",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Them nganh thanh cong" },
          400: { description: "Du lieu khong hop le" },
          404: { description: "Khong tim thay truong hoac to hop xet tuyen" },
          409: { description: "Ma nganh da ton tai trong truong nay" },
        },
      },
    },
    "/api/universities/{universityCode}/majors/{code}": {
      get: {
        tags: ["Majors"],
        summary: "Chi tiet mot nganh hoc (tim bang ma truong va ma nganh)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "universityCode",
            in: "path",
            required: true,
            schema: { type: "string", example: "HUST", description: "Mã viết tắt của trường" },
          },
          {
            name: "code",
            in: "path",
            required: true,
            schema: { type: "string", example: "CNTT", description: "Mã viết tắt của ngành" },
          },
        ],
        responses: {
          200: { description: "Lay thong tin nganh thanh cong" },
          404: { description: "Khong tim thay nganh" },
        },
      },
    },
    "/api/universities/{universityId}/majors/{majorId}": {
      put: {
        tags: ["Majors"],
        summary: "Sua thong tin nganh hoc",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "universityId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "majorId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: { type: "string", example: "CNTT" },
                  name: { type: "string", example: "Cong nghe thong tin" },
                  description: { type: "string" },
                  admission_combinations_id: { type: "integer", example: 1 },
                  min_score: { type: "number", format: "float" },
                  status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cap nhat nganh thanh cong" },
          400: { description: "Du lieu khong hop le" },
          404: { description: "Khong tim thay nganh" },
          409: { description: "Ma nganh da ton tai trong truong nay" },
        },
      },
      delete: {
        tags: ["Majors"],
        summary: "Xoa mem nganh hoc",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "universityId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "majorId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          200: { description: "Xoa nganh thanh cong" },
          404: { description: "Khong tim thay nganh" },
          409: { description: "Co du lieu lien quan, khong the xoa" },
        },
      },
    },
  },
} as const;

export default swaggerSpec;
