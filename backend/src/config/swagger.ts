const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Tuyen Sinh Backend API',
    version: '1.0.0',
    description: 'Tai lieu API cho he thong tuyen sinh',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Kiem tra trang thai he thong' },
    { name: 'Auth', description: 'Dang ky, dang nhap, dang xuat, profile' },
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
        summary: 'Health check',
        responses: {
          200: {
            description: 'Server healthy',
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Dang ky tai khoan thi sinh',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['citizen_id', 'full_name', 'email', 'password'],
                properties: {
                  citizen_id: { type: 'integer', format: 'int64', example: 123456789012 },
                  full_name: { type: 'string', example: 'Nguyen Van A' },
                  email: { type: 'string', format: 'email', example: 'a@example.com' },
                  password: { type: 'string', minLength: 6, example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Dang ky thanh cong' },
          400: { description: 'Du lieu khong hop le' },
          409: { description: 'Trung email hoac CCCD' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Dang nhap bang email va mat khau',
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
          200: { description: 'Dang nhap thanh cong' },
          401: { description: 'Sai thong tin dang nhap' },
          403: { description: 'Tai khoan bi khoa' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Dang xuat (stateless)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Dang xuat thanh cong' },
          401: { description: 'Khong co token hoac token khong hop le' },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        tags: ['Auth'],
        summary: 'Lay thong tin profile nguoi dang nhap',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lay profile thanh cong' },
          401: { description: 'Khong co token hoac token khong hop le' },
          404: { description: 'Khong tim thay user' },
        },
      },
    },
  },
} as const;

export default swaggerSpec;
