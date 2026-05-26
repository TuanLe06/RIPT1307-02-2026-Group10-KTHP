const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: 'API Hệ thống Tuyển sinh',
    version: '1.0.0',
    description: 'Tài liệu API cho hệ thống tuyển sinh',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Máy chủ địa phương',
    },
  ],
  tags: [
    { name: 'Health', description: 'Kiểm tra trạng thái hệ thống' },
    { name: 'Auth', description: 'Đăng ký, đăng nhập, đăng xuất, hồ sơ' },
    { name: 'Users', description: 'Quản lý tài khoản người dùng (ADMIN)' },
    { name: 'Candidate Profile', description: 'Thông tin hồ sơ cá nhân thí sinh' },
    { name: 'Universities', description: 'Danh sách các trường đại học' },
    { name: 'Majors', description: 'Quản lý thông tin ngành học theo trường' },
    { name: 'Applications', description: 'Quản lý hồ sơ xét tuyển của thí sinh' },
    { name: 'Admin - Universities', description: 'Quản lý trường đại học (ADMIN)' },
    { name: 'Admin - Majors', description: 'Quản lý ngành học (ADMIN)' },
    { name: 'Admin - Combinations', description: 'Quản lý tổ hợp xét tuyển (ADMIN)' },
    { name: 'Admin - Applications', description: 'Quản lý hồ sơ xét tuyển (ADMIN)' },
    { name: 'Admin - Notifications', description: 'Quản lý thông báo (ADMIN)' },
    { name: 'Admin - Reports', description: 'Báo cáo thống kê (ADMIN)' },
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
        tags: ['Health'],
        summary: 'Kiểm tra sức khỏe hệ thống',
        responses: {
          200: {
            description: 'Máy chủ hoạt động bình thường',
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ['Auth'],
        summary: 'Đăng ký tài khoản thí sinh',
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["citizen_id", "full_name", "email", "password"],
                properties: {
                  citizen_id: { type: 'string', pattern: '^[0-9]{12}$', example: '001306651354' },
                  full_name: { type: 'string', example: 'Tống Quang Việt' },
                  email: { type: 'string', format: 'email', example: 'a@example.com' },
                  password: { type: 'string', minLength: 6, example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Đăng ký thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          409: { description: 'Trùng email hoặc CCCD' },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập bằng email và mật khẩu',
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
          200: { description: 'Đăng nhập thành công' },
          401: { description: 'Sai thông tin đăng nhập' },
          403: { description: 'Tài khoản bị khóa' },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ['Auth'],
        summary: 'Đăng xuất (không lưu trạng thái)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Đăng xuất thành công' },
          401: { description: 'Không có token hoặc token không hợp lệ' },
        },
      },
    },
    "/api/auth/profile": {
      get: {
        tags: ['Auth'],
        summary: 'Lấy thông tin hồ sơ người đăng nhập',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lấy hồ sơ thành công' },
          401: { description: 'Không có token hoặc token không hợp lệ' },
          404: { description: 'Không tìm thấy người dùng' },
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
                    example: "Trường công nghệ hàng đầu Việt Nam",
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
            schema: { type: "string", example: "HUST", description: "Mã viết tắt của trường" },
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
                    example: "Trường Đại học Công nghệ Thông tin",
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
            schema: { type: "string", pattern: "^DH\\d{6}$", example: "DH000001", description: "Mã tự động (DH + 6 số)" },
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
                  name: { type: "string", example: "Công nghệ thông tin" },
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
          201: { description: "Thêm ngành thành công" },
          400: { description: "Dữ liệu không hợp lệ" },
          404: { description: "Không tìm thấy trường hoặc tổ hợp xét tuyển" },
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
                  name: { type: "string", example: "Công nghệ thông tin" },
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
          200: { description: "Xóa ngành thành công" },
          404: { description: "Không tìm thấy ngành" },
          409: { description: "Có dữ liệu liên quan, không thể xóa" },
        },
      },
    },
    '/api/candidate/profile': {
      get: {
        tags: ['Candidate Profile'],
        summary: 'Lấy hồ sơ thí sinh (gồm user + candidate_profile)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lấy hồ sơ thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đúng vai trò THÍ SINH' },
          404: { description: 'Không tìm thấy hồ sơ thí sinh' },
        },
      },
      put: {
        tags: ['Candidate Profile'],
        summary: 'Cập nhật hồ sơ cá nhân thí sinh',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string', example: 'Tống Quang Việt' },
                  phone: { type: 'string', example: '0901234567' },
                  date_of_birth: { type: 'string', format: 'date', example: '2006-08-15' },
                  gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
                  citizen_issue_date: { type: 'string', format: 'date', example: '2022-01-01' },
                  citizen_issue_place: { type: 'string', example: 'Công an TP.HCM' },
                  religion: { type: 'string', example: 'Không' },
                  ethnic: { type: 'string', example: 'Kinh' },
                  nation: { type: 'string', example: 'Vietnam' },
                  province: { type: 'string', example: 'TP.HCM' },
                  ward: { type: 'string', example: 'Phường 1' },
                  address: { type: 'string', example: '123 Đường A' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật hồ sơ thành công' },
          400: { description: 'Dữ liệu gửi lên không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đúng vai trò THÍ SINH' },
          404: { description: 'Không tìm thấy hồ sơ thí sinh' },
        },
      },
    },
    '/api/candidate/profile/academic-record': {
      get: {
        tags: ['Candidate Profile'],
        summary: 'Lấy thông tin học tập hiện tại của thí sinh',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lấy thông tin học tập thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đúng vai trò THÍ SINH' },
          404: { description: 'Không tìm thấy hồ sơ thí sinh' },
        },
      },
      put: {
        tags: ['Candidate Profile'],
        summary: 'Nhập/chỉnh sửa điểm học tập tổng quan',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  graduation_year: { type: 'integer', example: 2024 },
                  science_group: { type: 'string', enum: ['NATURAL', 'SOCIAL'] },
                  priority_score: { type: 'number', format: 'float', example: 1.5 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật thông tin học tập thành công' },
          400: { description: 'Dữ liệu gửi lên không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đúng vai trò THÍ SINH' },
          404: { description: 'Không tìm thấy hồ sơ thí sinh' },
        },
      },
    },
    '/api/candidate/profile/academic-progress': {
      put: {
        tags: ['Candidate Profile'],
        summary: 'Nhập/chỉnh sửa tiến trình học theo lớp 10/11/12',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  grade_10: {
                    type: 'object',
                    properties: {
                      school_name: { type: 'string', example: 'THPT A' },
                      avg_score: { type: 'number', format: 'float', example: 8.1 },
                    },
                  },
                  grade_11: {
                    type: 'object',
                    properties: {
                      school_name: { type: 'string', example: 'THPT A' },
                      avg_score: { type: 'number', format: 'float', example: 8.3 },
                    },
                  },
                  grade_12: {
                    type: 'object',
                    properties: {
                      school_name: { type: 'string', example: 'THPT A' },
                      avg_score: { type: 'number', format: 'float', example: 8.6 },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật tiến trình học thành công' },
          400: { description: 'Dữ liệu gửi lên không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đúng vai trò THÍ SINH' },
          404: { description: 'Không tìm thấy hồ sơ thí sinh' },
        },
      },
    },
    '/api/candidate/profile/documents': {
      get: {
        tags: ['Candidate Profile'],
        summary: 'Lấy danh sách minh chứng đã upload',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lấy danh sách minh chứng thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đúng vai trò THÍ SINH' },
          404: { description: 'Không tìm thấy hồ sơ thí sinh' },
        },
      },
      post: {
        tags: ['Candidate Profile'],
        summary: 'Upload minh chứng (PDF/JPEG/PNG)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['document_type', 'file'],
                properties: {
                  document_type: {
                    type: 'string',
                    enum: ['TRANSCRIPT', 'CITIZEN_ID', 'PORTRAIT', 'CERTIFICATE', 'OTHER'],
                  },
                  file: {
                    type: 'string',
                    format: 'binary',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Upload minh chứng thành công' },
          400: { description: 'Dữ liệu gửi lên không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đúng vai trò THÍ SINH' },
          404: { description: 'Không tìm thấy hồ sơ thí sinh' },
        },
      },
    },
    '/api/candidate/profile/documents/{documentId}': {
      delete: {
        tags: ['Candidate Profile'],
        summary: 'Xóa minh chứng (soft delete và xóa file trên Cloudinary)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'documentId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          200: { description: 'Xóa minh chứng thành công' },
          400: { description: 'documentId không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đúng vai trò THÍ SINH' },
          404: { description: 'Không tìm thấy minh chứng' },
          500: { description: 'Xóa Cloudinary hoặc soft delete thất bại' },
        },
      },
    },
    '/api/admin/candidates/{citizenId}/exam-scores-by-group': {
      put: {
        tags: ['Admin'],
        summary: 'Admin cập nhật điểm thi theo khối KHTN/KHXH cho thí sinh',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'citizenId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['science_group', 'scores'],
                properties: {
                  science_group: { type: 'string', enum: ['NATURAL', 'SOCIAL'] },
                  scores: {
                    type: 'object',
                    additionalProperties: { type: 'number', format: 'float', minimum: 0, maximum: 10 },
                    example: { TOAN: 8.5, VAN: 8.25, ANH: 8.0, LY: 8.0, HOA: 7.75, SINH: 8.5 },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật điểm theo khối thành công' },
          400: { description: 'Payload không hợp lệ hoặc sai tổ hợp môn theo khối' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy thí sinh theo citizenId' },
        },
      },
    },
    // ─── USERS MANAGEMENT ────────────────────────────────────────
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'Danh sách tất cả người dùng (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, default: 10 } },
        ],
        responses: {
          200: { description: 'Lấy danh sách người dùng thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Lấy thông tin một người dùng',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Lấy thông tin người dùng thành công' },
          401: { description: 'Chưa xác thực' },
          404: { description: 'Không tìm thấy người dùng' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Cập nhật thông tin người dùng (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['ADMIN', 'CANDIDATE', 'UNIVERSITY'] },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật người dùng thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy người dùng' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Xóa người dùng (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Xóa người dùng thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy người dùng' },
        },
      },
    },
    // ─── APPLICATIONS (CANDIDATE) ───────────────────────────────
    '/api/candidate-applications/applications': {
      post: {
        tags: ['Applications'],
        summary: 'Thí sinh tạo hồ sơ xét tuyển mới (nháp)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['university_id', 'major_id', 'combination_id'],
                properties: {
                  university_id: { type: 'integer', example: 1 },
                  major_id: { type: 'integer', example: 1 },
                  combination_id: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tạo hồ sơ xét tuyển thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          404: { description: 'Không tìm thấy trường, ngành hoặc tổ hợp xét tuyển' },
        },
      },
      get: {
        tags: ['Applications'],
        summary: 'Danh sách hồ sơ xét tuyển của thí sinh',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, default: 10 } },
        ],
        responses: {
          200: { description: 'Lấy danh sách hồ sơ thành công' },
          401: { description: 'Chưa xác thực' },
        },
      },
    },
    '/api/candidate-applications/applications/{application_id}': {
      get: {
        tags: ['Applications'],
        summary: 'Chi tiết một hồ sơ xét tuyển của thí sinh',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'application_id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Lấy chi tiết hồ sơ thành công' },
          401: { description: 'Chưa xác thực' },
          404: { description: 'Không tìm thấy hồ sơ xét tuyển' },
        },
      },
      delete: {
        tags: ['Applications'],
        summary: 'Xóa hồ sơ xét tuyển (chỉ ở trạng thái DRAFT)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'application_id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Xóa hồ sơ thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Hồ sơ không ở trạng thái DRAFT' },
          404: { description: 'Không tìm thấy hồ sơ xét tuyển' },
        },
      },
    },
    '/api/candidate-applications/applications/{application_id}/submit': {
      post: {
        tags: ['Applications'],
        summary: 'Thí sinh nộp hồ sơ xét tuyển',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'application_id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Nộp hồ sơ thành công' },
          401: { description: 'Chưa xác thực' },
          400: { description: 'Hồ sơ không ở trạng thái DRAFT' },
          404: { description: 'Không tìm thấy hồ sơ xét tuyển' },
        },
      },
    },
    '/api/candidate-applications/applications/{application_id}/status': {
      get: {
        tags: ['Applications'],
        summary: 'Kiểm tra trạng thái hồ sơ xét tuyển',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'application_id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Lấy trạng thái hồ sơ thành công' },
          401: { description: 'Chưa xác thực' },
          404: { description: 'Không tìm thấy hồ sơ xét tuyển' },
        },
      },
    },
    '/api/candidate-applications/notifications': {
      get: {
        tags: ['Applications'],
        summary: 'Danh sách thông báo của thí sinh',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, default: 10 } },
        ],
        responses: {
          200: { description: 'Lấy danh sách thông báo thành công' },
          401: { description: 'Chưa xác thực' },
        },
      },
    },
    '/api/candidate-applications/notifications/{id}': {
      get: {
        tags: ['Applications'],
        summary: 'Chi tiết một thông báo',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Lấy chi tiết thông báo thành công' },
          401: { description: 'Chưa xác thực' },
          404: { description: 'Không tìm thấy thông báo' },
        },
      },
    },
    // ─── ADMIN - UNIVERSITIES ──────────────────────────────────
    '/api/admin/universities': {
      post: {
        tags: ['Admin - Universities'],
        summary: 'ADMIN - Tạo trường đại học mới',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'name'],
                properties: {
                  code: { type: 'string', example: 'DH001' },
                  name: { type: 'string', example: 'Đại học Bách Khoa Hà Nội' },
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  website: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tạo trường thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
      get: {
        tags: ['Admin - Universities'],
        summary: 'ADMIN - Danh sách tất cả trường đại học (phân trang)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, max: 100, default: 10 } },
        ],
        responses: {
          200: { description: 'Lấy danh sách trường thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/universities/{id}': {
      get: {
        tags: ['Admin - Universities'],
        summary: 'ADMIN - Chi tiết một trường đại học',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Lấy chi tiết trường thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy trường' },
        },
      },
      put: {
        tags: ['Admin - Universities'],
        summary: 'ADMIN - Cập nhật thông tin trường đại học',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  address: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  website: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật trường thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy trường' },
        },
      },
      delete: {
        tags: ['Admin - Universities'],
        summary: 'ADMIN - Xóa trường đại học',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Xóa trường thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy trường' },
        },
      },
    },
    // ─── ADMIN - MAJORS ─────────────────────────────────────────
    '/api/admin/majors': {
      post: {
        tags: ['Admin - Majors'],
        summary: 'ADMIN - Tạo ngành học mới',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['university_id', 'code', 'name'],
                properties: {
                  university_id: { type: 'integer', example: 1 },
                  code: { type: 'string', example: 'CNTT' },
                  name: { type: 'string', example: 'Công nghệ thông tin' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tạo ngành thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/majors/{id}': {
      get: {
        tags: ['Admin - Majors'],
        summary: 'ADMIN - Chi tiết một ngành học',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Lấy chi tiết ngành thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy ngành' },
        },
      },
      put: {
        tags: ['Admin - Majors'],
        summary: 'ADMIN - Cập nhật ngành học',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật ngành thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy ngành' },
        },
      },
      delete: {
        tags: ['Admin - Majors'],
        summary: 'ADMIN - Xóa ngành học',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Xóa ngành thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy ngành' },
        },
      },
    },
    '/api/admin/universities/{university_id}/majors': {
      get: {
        tags: ['Admin - Majors'],
        summary: 'ADMIN - Danh sách ngành học của một trường',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'university_id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, max: 100, default: 10 } },
        ],
        responses: {
          200: { description: 'Lấy danh sách ngành thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy trường' },
        },
      },
    },
    // ─── ADMIN - COMBINATIONS ──────────────────────────────────
    '/api/admin/admission-combinations': {
      post: {
        tags: ['Admin - Combinations'],
        summary: 'ADMIN - Tạo tổ hợp xét tuyển mới',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'subject_1', 'subject_2', 'subject_3'],
                properties: {
                  code: { type: 'string', example: 'A00' },
                  subject_1: { type: 'string', example: 'TOAN' },
                  subject_2: { type: 'string', example: 'LY' },
                  subject_3: { type: 'string', example: 'HOA' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Tạo tổ hợp thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
      get: {
        tags: ['Admin - Combinations'],
        summary: 'ADMIN - Danh sách tổ hợp xét tuyển (phân trang)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, max: 100, default: 10 } },
        ],
        responses: {
          200: { description: 'Lấy danh sách tổ hợp thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/major-combinations': {
      post: {
        tags: ['Admin - Combinations'],
        summary: 'ADMIN - Thêm tổ hợp xét tuyển vào ngành học',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['major_id', 'combination_id', 'min_score'],
                properties: {
                  major_id: { type: 'integer', example: 1 },
                  combination_id: { type: 'integer', example: 1 },
                  min_score: { type: 'number', format: 'float', minimum: 0, maximum: 30, example: 22.5 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Thêm tổ hợp vào ngành thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/major-combinations/{id}': {
      put: {
        tags: ['Admin - Combinations'],
        summary: 'ADMIN - Cập nhật tổ hợp ngành',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  min_score: { type: 'number', format: 'float', minimum: 0, maximum: 30 },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật tổ hợp ngành thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy tổ hợp ngành' },
        },
      },
      delete: {
        tags: ['Admin - Combinations'],
        summary: 'ADMIN - Xóa tổ hợp ngành',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Xóa tổ hợp ngành thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy tổ hợp ngành' },
        },
      },
    },
    '/api/admin/majors/{major_id}/combinations': {
      get: {
        tags: ['Admin - Combinations'],
        summary: 'ADMIN - Danh sách tổ hợp xét tuyển của ngành',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'major_id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Lấy danh sách tổ hợp thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy ngành' },
        },
      },
    },
    // ─── ADMIN - APPLICATIONS ──────────────────────────────────
    '/api/admin/applications': {
      get: {
        tags: ['Admin - Applications'],
        summary: 'ADMIN - Danh sách hồ sơ xét tuyển (có tìm kiếm và lọc)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, max: 100, default: 10 } },
          { name: 'university_id', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'major_id', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Lấy danh sách hồ sơ thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/applications/search': {
      post: {
        tags: ['Admin - Applications'],
        summary: 'ADMIN - Tìm kiếm hồ sơ xét tuyển',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  university_id: { type: 'integer' },
                  major_id: { type: 'integer' },
                  status: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED'] },
                  keyword: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Tìm kiếm thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/applications/filter': {
      post: {
        tags: ['Admin - Applications'],
        summary: 'ADMIN - Lọc hồ sơ xét tuyển',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  university_id: { type: 'integer' },
                  major_id: { type: 'integer' },
                  status: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Lọc thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/applications/{id}': {
      get: {
        tags: ['Admin - Applications'],
        summary: 'ADMIN - Chi tiết hồ sơ xét tuyển',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Lấy chi tiết hồ sơ thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy hồ sơ xét tuyển' },
        },
      },
    },
    '/api/admin/applications/{id}/status': {
      put: {
        tags: ['Admin - Applications'],
        summary: 'ADMIN - Cập nhật trạng thái hồ sơ xét tuyển',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED'] },
                  reject_reason: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cập nhật trạng thái thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
          404: { description: 'Không tìm thấy hồ sơ xét tuyển' },
        },
      },
    },
    // ─── ADMIN - NOTIFICATIONS ────────────────────────────────
    '/api/admin/notifications/send': {
      post: {
        tags: ['Admin - Notifications'],
        summary: 'ADMIN - Gửi thông báo cho một thí sinh',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['receiver_id', 'receiver_email', 'subject', 'content'],
                properties: {
                  receiver_id: { type: 'integer', example: 1 },
                  receiver_email: { type: 'string', format: 'email', example: 'candidate@example.com' },
                  subject: { type: 'string', example: 'Thông báo kết quả' },
                  content: { type: 'string', example: 'Thí sinh đã đạt' },
                  type: { type: 'string', example: 'RESULT' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Gửi thông báo thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/notifications/send-bulk': {
      post: {
        tags: ['Admin - Notifications'],
        summary: 'ADMIN - Gửi thông báo cho nhiều thí sinh',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['subject', 'content'],
                properties: {
                  university_id: { type: 'integer' },
                  major_id: { type: 'integer' },
                  status: { type: 'string', enum: ['DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PASSED', 'FAILED'] },
                  subject: { type: 'string', example: 'Thông báo kết quả' },
                  content: { type: 'string', example: 'Kết quả xét tuyển đã công bố' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Gửi thông báo hàng loạt thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    // ─── ADMIN - REPORTS ───────────────────────────────────────
    '/api/admin/reports/statistics/overall': {
      get: {
        tags: ['Admin - Reports'],
        summary: 'ADMIN - Thống kê tổng quát',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lấy thống kê tổng quát thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/reports/statistics/by-university': {
      get: {
        tags: ['Admin - Reports'],
        summary: 'ADMIN - Thống kê theo trường đại học',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lấy thống kê theo trường thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/reports/statistics/by-major': {
      get: {
        tags: ['Admin - Reports'],
        summary: 'ADMIN - Thống kê theo ngành học',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lấy thống kê theo ngành thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/reports/statistics/by-status': {
      get: {
        tags: ['Admin - Reports'],
        summary: 'ADMIN - Thống kê theo trạng thái hồ sơ',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lấy thống kê theo trạng thái thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/reports/statistics/by-date-range': {
      get: {
        tags: ['Admin - Reports'],
        summary: 'ADMIN - Thống kê theo khoảng thời gian',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'start_date', in: 'query', required: true, schema: { type: 'string', format: 'date', example: '2024-01-01' } },
          { name: 'end_date', in: 'query', required: true, schema: { type: 'string', format: 'date', example: '2024-12-31' } },
        ],
        responses: {
          200: { description: 'Lấy thống kê theo khoảng thời gian thành công' },
          400: { description: 'Dữ liệu không hợp lệ' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
    '/api/admin/reports/detailed': {
      get: {
        tags: ['Admin - Reports'],
        summary: 'ADMIN - Báo cáo chi tiết',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'university_id', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'major_id', in: 'query', schema: { type: 'integer', minimum: 1 } },
        ],
        responses: {
          200: { description: 'Lấy báo cáo chi tiết thành công' },
          401: { description: 'Chưa xác thực' },
          403: { description: 'Không đủ quyền ADMIN' },
        },
      },
    },
  },
} as const;

export default swaggerSpec;
