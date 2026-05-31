import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'QR Attendance API',
      version: '1.0.0',
      description:
        'API de controlo de presença de funcionários via QR Code. ' +
        'Autentique-se com `/api/v1/auth/login` e use o token JWT no botão **Authorize** acima.',
      contact: {
        name: 'Equipa de Desenvolvimento',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT obtido no login. Exemplo: `eyJhbGci...`',
        },
      },
      schemas: {
        Role: {
          type: 'string',
          enum: ['COORDINATOR', 'EMPLOYEE'],
          example: 'EMPLOYEE',
        },
        Area: {
          type: 'string',
          enum: [
            'DEV_FULLSTACK',
            'AI_ENGINEER',
            'FRONTEND_ENGINEER',
            'BACKEND_ENGINEER',
            'DEVOPS',
            'INFRASTRUCTURE',
            'OTHER',
          ],
          example: 'DEV_FULLSTACK',
        },

        RegisterCoordinatorRequest: {
          type: 'object',
          required: ['name', 'email', 'phone', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              example: 'Maria Santos',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'maria@empresa.ao',
            },
            phone: {
              type: 'string',
              example: '+244 923 456 789',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Mínimo 8 caracteres, 1 maiúscula, 1 número',
              example: 'Senha1234',
            },
          },
        },
        RegisterEmployeeRequest: {
          type: 'object',
          required: ['name', 'email', 'phone', 'area', 'password'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              example: 'João Tambue',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@empresa.ao',
            },
            phone: {
              type: 'string',
              example: '+244 912 345 678',
            },
            area: {
              $ref: '#/components/schemas/Area',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Mínimo 8 caracteres, 1 maiúscula, 1 número',
              example: 'Senha1234',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'joao@empresa.ao',
            },
            password: {
              type: 'string',
              example: 'Senha1234',
            },
          },
        },

        CoordinatorUser: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxyz123abc' },
            name: { type: 'string', example: 'Maria Santos' },
            email: { type: 'string', example: 'maria@empresa.ao' },
            phone: { type: 'string', example: '+244 923 456 789' },
            role: { $ref: '#/components/schemas/Role' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        EmployeeUser: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clxyz456def' },
            name: { type: 'string', example: 'João Tambue' },
            email: { type: 'string', example: 'joao@empresa.ao' },
            phone: { type: 'string', example: '+244 912 345 678' },
            area: { $ref: '#/components/schemas/Area' },
            role: { $ref: '#/components/schemas/Role' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login efectuado com sucesso' },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                user: {
                  oneOf: [
                    { $ref: '#/components/schemas/CoordinatorUser' },
                    { $ref: '#/components/schemas/EmployeeUser' },
                  ],
                  discriminator: {
                    propertyName: 'role',
                    mapping: {
                      COORDINATOR: '#/components/schemas/CoordinatorUser',
                      EMPLOYEE: '#/components/schemas/EmployeeUser',
                    },
                  },
                },
              },
            },
          },
        },

        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Credenciais inválidas' },
            data: { type: 'null', example: null },
            error: { type: 'string', nullable: true, example: null },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Dados inválidos' },
            data: { type: 'null', example: null },
            error: {
              type: 'string',
              example: '{"email":["Email inválido"],"password":["A senha deve ter pelo menos 8 caracteres"]}',
            },
          },
        },
      },
    },
    security: [],
  },
  apis: ['./src/modules/**/**.routes.ts', './src/modules/**/**.routes.js'],
};

export const swaggerSpec = swaggerJsdoc(options);