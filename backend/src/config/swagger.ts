const swaggerSpec = {
  openapi: '3.0.3',
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
    { name: 'Candidate Profile', description: 'Thông tin hồ sơ cá nhân thí sinh' },
    { name: 'Admin', description: 'Các API quản trị hệ thống' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
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
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng ký tài khoản thí sinh',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['citizen_id', 'full_name', 'email', 'password'],
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
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập bằng email và mật khẩu',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'a@example.com' },
                  password: { type: 'string', example: 'secret123' },
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
    '/api/auth/logout': {
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
    '/api/auth/profile': {
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
  },
} as const;

export default swaggerSpec;
