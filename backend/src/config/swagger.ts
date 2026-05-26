const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "API Hệ thống Tuyển sinh",
    version: "1.0.0",
    description: "Tài liệu API cho hệ thống tuyển sinh",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Máy chủ địa phương",
    },
  ],
  tags: [
    { name: "Health", description: "Kiểm tra trạng thái hệ thống" },
    { name: "Auth", description: "Đăng ký, đăng nhập, đăng xuất, hồ sơ" },
    {
      name: "Candidate Profile",
      description: "Thông tin hồ sơ cá nhân thí sinh",
    },
    { name: "Admin", description: "Các API quản trị hệ thống" },
    { name: "Majors", description: "Quản lý thông tin ngành học theo trường" },
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
        summary: "Kiểm tra sức khỏe hệ thống",
        responses: {
          200: {
            description: "Máy chủ hoạt động bình thường",
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Đăng ký tài khoản thí sinh",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["citizen_id", "full_name", "email", "password"],
                properties: {
                  citizen_id: {
                    type: "string",
                    pattern: "^[0-9]{12}$",
                    example: "001306651354",
                  },
                  full_name: { type: "string", example: "Tống Quang Việt" },
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
          201: { description: "Đăng ký thành công" },
          400: { description: "Dữ liệu không hợp lệ" },
          409: { description: "Trùng email hoặc CCCD" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Đăng nhập bằng email và mật khẩu",
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
          200: { description: "Đăng nhập thành công" },
          401: { description: "Sai thông tin đăng nhập" },
          403: { description: "Tài khoản bị khóa" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Đăng xuất (không lưu trạng thái)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Đăng xuất thành công" },
          401: { description: "Không có token hoặc token không hợp lệ" },
        },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ["Auth"],
        summary: "Lấy thông tin hồ sơ người đăng nhập",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Lấy hồ sơ thành công" },
          401: { description: "Không có token hoặc token không hợp lệ" },
          404: { description: "Không tìm thấy người dùng" },
        },
      },
    },
    // ─── Universities ───────────────────────────────────────────
    "/api/universities": {
      post: {
        tags: ["Universities"],
        summary: "Thêm trường đại học mới",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "name"],
                properties: {
                  code: {
                    type: "string",
                    example: "HUST",
                    description: "Mã viết tắt của trường",
                  },
                  name: {
                    type: "string",
                    example: "Đại học Bách khoa Hà Nội",
                  },
                  address: {
                    type: "string",
                    example: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
                  },
                  phone: { type: "string", example: "02438695172" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "info@hust.edu.vn",
                  },
                  website: { type: "string", example: "https://hust.edu.vn" },
                  description: {
                    type: "string",
                    example: "Trường đại học kỹ thuật hàng đầu Việt Nam",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Thêm trường thành công" },
          400: { description: "Dữ liệu không hợp lệ" },
          409: { description: "Mã trường đã tồn tại" },
        },
      },
      get: {
        tags: ["Universities"],
        summary: "Danh sách tất cả trường đại học (có phân trang)",
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
          200: { description: "Lấy danh sách trường thành công" },
        },
      },
    },
    "/api/universities/{code}": {
      get: {
        tags: ["Universities"],
        summary: "Chi tiết một trường đại học (tìm bằng mã viết tắt)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "code",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "HUST",
              description: "Mã viết tắt của trường",
            },
          },
        ],
        responses: {
          200: { description: "Lấy thông tin trường thành công" },
          404: { description: "Không tìm thấy trường" },
        },
      },
    },
    "/api/universities/{id}": {
      put: {
        tags: ["Universities"],
        summary: "Sửa thông tin trường đại học",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^DH\\d{6}$",
              example: "DH000001",
              description: "Mã tự động (DH + 6 số)",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  code: {
                    type: "string",
                    example: "NEU",
                    description: "Mã viết tắt của trường",
                  },
                  name: {
                    type: "string",
                    example: "Trường Đại học Kinh tế Quốc dân",
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
          200: { description: "Cập nhật trường thành công" },
          400: { description: "Dữ liệu không hợp lệ" },
          404: { description: "Không tìm thấy trường" },
          409: { description: "Mã trường đã tồn tại" },
        },
      },
      delete: {
        tags: ["Universities"],
        summary: "Xóa mềm trường đại học",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^DH\\d{6}$",
              example: "DH000001",
              description: "Mã tự động (DH + 6 số)",
            },
          },
        ],
        responses: {
          200: { description: "Xóa trường thành công" },
          404: { description: "Không tìm thấy trường" },
          409: { description: "Có dữ liệu liên quan, không thể xóa" },
        },
      },
    },
    // ─── Majors ─────────────────────────────────────────────────
    "/api/universities/{universityCode}/majors": {
      get: {
        tags: ["Majors"],
        summary: "Danh sách ngành học của một trường (tìm bằng mã viết tắt)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "universityCode",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "HUST",
              description: "Mã viết tắt của trường",
            },
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
          200: { description: "Lấy danh sách ngành thành công" },
          400: { description: "Dữ liệu không hợp lệ" },
          404: { description: "Không tìm thấy trường" },
        },
      },
    },
    "/api/universities/{universityId}/majors": {
      post: {
        tags: ["Majors"],
        summary: "Thêm ngành học cho một trường",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "universityId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^DH\\d{6}$",
              example: "DH000001",
              description: "Mã tự động (DH + 6 số)",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "name"],
                properties: {
                  code: {
                    type: "string",
                    example: "CNTT",
                    description: "Mã viết tắt của ngành",
                  },
                  name: { type: "string", example: "Công nghệ thông tin" },
                  description: { type: "string" },
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
          201: { description: "Thêm ngành thành công" },
          400: { description: "Dữ liệu không hợp lệ" },
          404: { description: "Không tìm thấy trường" },
          409: { description: "Mã ngành đã tồn tại trong trường này" },
        },
      },
    },
    "/api/universities/{universityCode}/majors/{code}": {
      get: {
        tags: ["Majors"],
        summary: "Chi tiết một ngành học (tìm bằng mã trường và mã ngành)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "universityCode",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "HUST",
              description: "Mã viết tắt của trường",
            },
          },
          {
            name: "code",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "CNTT",
              description: "Mã viết tắt của ngành",
            },
          },
        ],
        responses: {
          200: { description: "Lấy thông tin ngành thành công" },
          404: { description: "Không tìm thấy ngành" },
        },
      },
    },
    "/api/universities/{universityId}/majors/{majorId}": {
      put: {
        tags: ["Majors"],
        summary: "Sửa thông tin ngành học",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "universityId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^DH\\d{6}$",
              example: "DH000001",
            },
          },
          {
            name: "majorId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^NH\\d{6}$",
              example: "NH000001",
            },
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
                  name: { type: "string", example: "Công nghệ thông tin" },
                  description: { type: "string" },
                  min_score: { type: "number", format: "float" },
                  status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cập nhật ngành thành công" },
          400: { description: "Dữ liệu không hợp lệ" },
          404: { description: "Không tìm thấy ngành" },
          409: { description: "Mã ngành đã tồn tại trong trường này" },
        },
      },
      delete: {
        tags: ["Majors"],
        summary: "Xóa mềm ngành học",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "universityId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^DH\\d{6}$",
              example: "DH000001",
            },
          },
          {
            name: "majorId",
            in: "path",
            required: true,
            schema: {
              type: "string",
              pattern: "^NH\\d{6}$",
              example: "NH000001",
            },
          },
        ],
        responses: {
          200: { description: "Xóa ngành thành công" },
          404: { description: "Không tìm thấy ngành" },
          409: { description: "Có dữ liệu liên quan, không thể xóa" },
        },
      },
    },
    "/api/candidate/profile": {
      get: {
        tags: ["Candidate Profile"],
        summary: "Lấy hồ sơ thí sinh (gồm user + candidate_profile)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Lấy hồ sơ thành công" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không đúng vai trò THÍ SINH" },
          404: { description: "Không tìm thấy hồ sơ thí sinh" },
        },
      },
      put: {
        tags: ["Candidate Profile"],
        summary: "Cập nhật hồ sơ cá nhân thí sinh",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  full_name: { type: "string", example: "Tống Quang Việt" },
                  phone: { type: "string", example: "0901234567" },
                  date_of_birth: {
                    type: "string",
                    format: "date",
                    example: "2006-08-15",
                  },
                  gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] },
                  citizen_issue_date: {
                    type: "string",
                    format: "date",
                    example: "2022-01-01",
                  },
                  citizen_issue_place: {
                    type: "string",
                    example: "Công an TP.HCM",
                  },
                  religion: { type: "string", example: "Không" },
                  ethnic: { type: "string", example: "Kinh" },
                  nation: { type: "string", example: "Vietnam" },
                  province: { type: "string", example: "TP.HCM" },
                  ward: { type: "string", example: "Phường 1" },
                  address: { type: "string", example: "123 Đường A" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cập nhật hồ sơ thành công" },
          400: { description: "Dữ liệu gửi lên không hợp lệ" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không đúng vai trò THÍ SINH" },
          404: { description: "Không tìm thấy hồ sơ thí sinh" },
        },
      },
    },
    "/api/candidate/profile/academic-record": {
      get: {
        tags: ["Candidate Profile"],
        summary: "Lấy thông tin học tập hiện tại của thí sinh",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Lấy thông tin học tập thành công" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không đúng vai trò THÍ SINH" },
          404: { description: "Không tìm thấy hồ sơ thí sinh" },
        },
      },
      put: {
        tags: ["Candidate Profile"],
        summary: "Nhập/chỉnh sửa điểm học tập tổng quan",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  graduation_year: { type: "integer", example: 2024 },
                  science_group: {
                    type: "string",
                    enum: ["NATURAL", "SOCIAL"],
                  },
                  priority_score: {
                    type: "number",
                    format: "float",
                    example: 1.5,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cập nhật thông tin học tập thành công" },
          400: { description: "Dữ liệu gửi lên không hợp lệ" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không đúng vai trò THÍ SINH" },
          404: { description: "Không tìm thấy hồ sơ thí sinh" },
        },
      },
    },
    "/api/candidate/profile/academic-progress": {
      put: {
        tags: ["Candidate Profile"],
        summary: "Nhập/chỉnh sửa tiến trình học theo lớp 10/11/12",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  grade_10: {
                    type: "object",
                    properties: {
                      school_name: { type: "string", example: "THPT A" },
                      avg_score: {
                        type: "number",
                        format: "float",
                        example: 8.1,
                      },
                    },
                  },
                  grade_11: {
                    type: "object",
                    properties: {
                      school_name: { type: "string", example: "THPT A" },
                      avg_score: {
                        type: "number",
                        format: "float",
                        example: 8.3,
                      },
                    },
                  },
                  grade_12: {
                    type: "object",
                    properties: {
                      school_name: { type: "string", example: "THPT A" },
                      avg_score: {
                        type: "number",
                        format: "float",
                        example: 8.6,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cập nhật tiến trình học thành công" },
          400: { description: "Dữ liệu gửi lên không hợp lệ" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không đúng vai trò THÍ SINH" },
          404: { description: "Không tìm thấy hồ sơ thí sinh" },
        },
      },
    },
    "/api/candidate/profile/documents": {
      get: {
        tags: ["Candidate Profile"],
        summary: "Lấy danh sách minh chứng đã upload",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Lấy danh sách minh chứng thành công" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không đúng vai trò THÍ SINH" },
          404: { description: "Không tìm thấy hồ sơ thí sinh" },
        },
      },
      post: {
        tags: ["Candidate Profile"],
        summary: "Upload minh chứng (PDF/JPEG/PNG)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["document_type", "file"],
                properties: {
                  document_type: {
                    type: "string",
                    enum: [
                      "TRANSCRIPT",
                      "CITIZEN_ID",
                      "PORTRAIT",
                      "CERTIFICATE",
                      "OTHER",
                    ],
                  },
                  file: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Upload minh chứng thành công" },
          400: { description: "Dữ liệu gửi lên không hợp lệ" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không đúng vai trò THÍ SINH" },
          404: { description: "Không tìm thấy hồ sơ thí sinh" },
        },
      },
    },
    "/api/candidate/profile/documents/{documentId}": {
      delete: {
        tags: ["Candidate Profile"],
        summary: "Xóa minh chứng (soft delete và xóa file trên Cloudinary)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "documentId",
            in: "path",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          200: { description: "Xóa minh chứng thành công" },
          400: { description: "documentId không hợp lệ" },
          401: { description: "Chưa xác thực" },
          403: { description: "Không đúng vai trò THÍ SINH" },
          404: { description: "Không tìm thấy minh chứng" },
          500: { description: "Xóa Cloudinary hoặc soft delete thất bại" },
        },
      },
    },
    "/api/admin/candidates/{citizenId}/exam-scores-by-group": {
      put: {
        tags: ["Admin"],
        summary: "Admin cập nhật điểm thi theo khối KHTN/KHXH cho thí sinh",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "citizenId",
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
                required: ["science_group", "scores"],
                properties: {
                  science_group: {
                    type: "string",
                    enum: ["NATURAL", "SOCIAL"],
                  },
                  scores: {
                    type: "object",
                    additionalProperties: {
                      type: "number",
                      format: "float",
                      minimum: 0,
                      maximum: 10,
                    },
                    example: {
                      TOAN: 8.5,
                      VAN: 8.25,
                      ANH: 8.0,
                      LY: 8.0,
                      HOA: 7.75,
                      SINH: 8.5,
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Cập nhật điểm theo khối thành công" },
          400: {
            description: "Payload không hợp lệ hoặc sai tổ hợp môn theo khối",
          },
          401: { description: "Chưa xác thực" },
          403: { description: "Không đủ quyền ADMIN" },
          404: { description: "Không tìm thấy thí sinh theo citizenId" },
        },
      },
    },
    // ─── Admission Combinations (per Major) ──────────────────────
    "/api/universities/{universityCode}/majors/{majorCode}/combinations": {
      get: {
        tags: ["AdmissionCombinations"],
        summary: "Danh sach to hop xet tuyen cua mot nganh (co phan trang)",
        parameters: [
          {
            name: "universityCode",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "HUST",
              description: "Mã viết tắt của trường",
            },
          },
          {
            name: "majorCode",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "CNTT",
              description: "Mã viết tắt của ngành",
            },
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
          200: { description: "Lay danh sach to hop thanh cong" },
          404: { description: "Khong tim thay truong hoac nganh" },
        },
      },
      post: {
        tags: ["AdmissionCombinations"],
        summary: "Them to hop xet tuyen cho mot nganh",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "universityCode",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "HUST",
              description: "Mã viết tắt của trường",
            },
          },
          {
            name: "majorCode",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "CNTT",
              description: "Mã viết tắt của ngành",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "subject_1", "subject_2", "subject_3"],
                properties: {
                  code: {
                    type: "string",
                    example: "A00",
                    description: "Mã tổ hợp",
                  },
                  subject_1: { type: "string", example: "Toán" },
                  subject_2: { type: "string", example: "Lý" },
                  subject_3: { type: "string", example: "Hóa" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Thêm tổ hợp thành công" },
          400: { description: "Dữ liệu không hợp lệ" },
          404: { description: "Không tìm thấy trường hoặc ngành" },
          409: { description: "Mã tổ hợp đã tồn tại trong ngành này" },
        },
      },
    },
    "/api/universities/{universityCode}/majors/{majorCode}/combinations/{combinationId}":
      {
        get: {
          tags: ["AdmissionCombinations"],
          summary: "Chi tiết tổ hợp xét tuyển (tìm bằng id TH+6)",
          parameters: [
            {
              name: "universityCode",
              in: "path",
              required: true,
              schema: {
                type: "string",
                example: "HUST",
                description: "Mã viết tắt của trường",
              },
            },
            {
              name: "majorCode",
              in: "path",
              required: true,
              schema: {
                type: "string",
                example: "CNTT",
                description: "Mã viết tắt của ngành",
              },
            },
            {
              name: "combinationId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                pattern: "^TH\\d{6}$",
                example: "TH000001",
                description: "Mã tự động (TH + 6 số)",
              },
            },
          ],
          responses: {
            200: { description: "Lấy thông tin tổ hợp thành công" },
            404: { description: "Không tìm thấy tổ hợp" },
          },
        },
        put: {
          tags: ["AdmissionCombinations"],
          summary: "Sửa tổ hợp xét tuyển của một ngành",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "universityCode",
              in: "path",
              required: true,
              schema: {
                type: "string",
                example: "HUST",
                description: "Mã viết tắt của trường",
              },
            },
            {
              name: "majorCode",
              in: "path",
              required: true,
              schema: {
                type: "string",
                example: "CNTT",
                description: "Mã viết tắt của ngành",
              },
            },
            {
              name: "combinationId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                pattern: "^TH\\d{6}$",
                example: "TH000001",
                description: "Mã tự động (TH + 6 số)",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    code: { type: "string", example: "A00" },
                    subject_1: { type: "string", example: "Toán" },
                    subject_2: { type: "string", example: "Lý" },
                    subject_3: { type: "string", example: "Hóa" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Cập nhật tổ hợp thành công" },
            400: { description: "Dữ liệu không hợp lệ" },
            404: { description: "Không tìm thấy tổ hợp" },
            409: { description: "Mã tổ hợp đã tồn tại trong ngành này" },
          },
        },
        delete: {
          tags: ["AdmissionCombinations"],
          summary: "Xóa tổ hợp xét tuyển của một ngành",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "universityCode",
              in: "path",
              required: true,
              schema: {
                type: "string",
                example: "HUST",
                description: "Mã viết tắt của trường",
              },
            },
            {
              name: "majorCode",
              in: "path",
              required: true,
              schema: {
                type: "string",
                example: "CNTT",
                description: "Mã viết tắt của ngành",
              },
            },
            {
              name: "combinationId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                pattern: "^TH\\d{6}$",
                example: "TH000001",
                description: "Mã tự động (TH + 6 số)",
              },
            },
          ],
          responses: {
            200: { description: "Xóa tổ hợp thành công" },
            404: { description: "Không tìm thấy trường, ngành, hoặc tổ hợp" },
          },
        },
      },
  },
} as const;

export default swaggerSpec;
