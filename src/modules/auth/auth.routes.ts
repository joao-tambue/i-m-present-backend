import { Router } from 'express';

import { AuthController } from './auth.controller';
import { authenticate } from '../../middlewares/authenticate';
import {
  validate,
  loginSchema,
  registerCoordinatorSchema,
  registerEmployeeSchema,
} from '../../middlewares/validate';

export const authRoutes = Router();
const ctrl = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registo e autenticação de coordenadores e funcionários
 */

/**
 * @swagger
 * /api/v1/auth/register/coordinator:
 *   post:
 *     summary: Registar um novo coordenador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterCoordinatorRequest'
 *           example:
 *             name: Maria Santos
 *             email: maria@empresa.ao
 *             phone: "+244 923 456 789"
 *             password: Senha1234
 *     responses:
 *       201:
 *         description: Coordenador registado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: Coordenador registado com sucesso
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   id: clxyz123abc
 *                   name: Maria Santos
 *                   email: maria@empresa.ao
 *                   phone: "+244 923 456 789"
 *                   role: COORDINATOR
 *                   createdAt: "2026-05-31T00:00:00.000Z"
 *       409:
 *         description: Email já registado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Email já registado
 *               data: null
 *       422:
 *         description: Dados de entrada inválidos (validação Zod)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
authRoutes.post(
  '/register/coordinator',
  validate(registerCoordinatorSchema),
  ctrl.registerCoordinator.bind(ctrl),
);

/**
 * @swagger
 * /api/v1/auth/register/employee:
 *   post:
 *     summary: Registar um novo funcionário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterEmployeeRequest'
 *           example:
 *             name: João Tambue
 *             email: joao@empresa.ao
 *             phone: "+244 912 345 678"
 *             area: DEV_FULLSTACK
 *             password: Senha1234
 *     responses:
 *       201:
 *         description: Funcionário registado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: Funcionário registado com sucesso
 *               data:
 *                 token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   id: clxyz456def
 *                   name: João Tambue
 *                   email: joao@empresa.ao
 *                   phone: "+244 912 345 678"
 *                   area: DEV_FULLSTACK
 *                   role: EMPLOYEE
 *                   createdAt: "2026-05-31T00:00:00.000Z"
 *       409:
 *         description: Email já registado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             example:
 *               success: false
 *               message: Dados inválidos
 *               data: null
 *               error: '{"area":["Área inválida. Valores aceites: DEV_FULLSTACK, AI_ENGINEER, ..."]}'
 */
authRoutes.post(
  '/register/employee',
  validate(registerEmployeeSchema),
  ctrl.registerEmployee.bind(ctrl),
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login de coordenador ou funcionário
 *     description: >
 *       Endpoint único de login para ambos os roles.
 *       O sistema detecta automaticamente o role pelo email fornecido.
 *       Copie o token da resposta e cole no botão Authorize (canto superior direito).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             funcionario:
 *               summary: Login como Funcionário
 *               value:
 *                 email: joao@empresa.ao
 *                 password: Senha1234
 *             coordenador:
 *               summary: Login como Coordenador
 *               value:
 *                 email: maria@empresa.ao
 *                 password: Senha1234
 *     responses:
 *       200:
 *         description: Login efectuado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Credenciais inválidas
 *               data: null
 *       422:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
authRoutes.post(
  '/login',
  validate(loginSchema),
  ctrl.login.bind(ctrl),
);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Obter perfil do utilizador autenticado
 *     description: Retorna os dados do utilizador associado ao token JWT fornecido.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Perfil obtido
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/CoordinatorUser'
 *                     - $ref: '#/components/schemas/EmployeeUser'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               semToken:
 *                 summary: Sem token
 *                 value:
 *                   success: false
 *                   message: Token de autenticação não fornecido
 *                   data: null
 *               tokenExpirado:
 *                 summary: Token expirado
 *                 value:
 *                   success: false
 *                   message: Token expirado
 *                   data: null
 *               tokenInvalido:
 *                 summary: Token inválido
 *                 value:
 *                   success: false
 *                   message: Token inválido
 *                   data: null
 *       404:
 *         description: Utilizador não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRoutes.get(
  '/me',
  authenticate,
  ctrl.me.bind(ctrl),
);