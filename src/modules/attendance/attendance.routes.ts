import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { Role } from '../auth/auth.model';

export const attendanceRoutes = Router();
const ctrl = new AttendanceController();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Check-in e check-out via QR Code, histórico e listagens de presença
 */

// ─────────────────────────────────────────────────────────────────────────────
// Rotas do Funcionário  (EMPLOYEE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/attendance/checkin:
 *   post:
 *     summary: Registar entrada (check-in) via QR Code
 *     description: >
 *       O funcionário apresenta o seu QR Code num leitor ou app mobile.
 *       O `token` é o valor codificado no QR Code (UUID opaco — nunca expõe o ID do funcionário).
 *       O sistema calcula automaticamente o atraso com base no horário de trabalho configurado.
 *     tags: [Attendance]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QRCheckRequest'
 *           example:
 *             token: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Check-in efectuado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Check-in efectuado com sucesso." }
 *                 data:
 *                   $ref: '#/components/schemas/CheckInResponse'
 *             examples:
 *               pontual:
 *                 summary: Entrada pontual
 *                 value:
 *                   success: true
 *                   message: "Check-in efectuado com sucesso."
 *                   data:
 *                     record:
 *                       id: clrec123
 *                       date: "2026-05-31"
 *                       checkInAt: "2026-05-31T08:02:00.000Z"
 *                       checkOutAt: null
 *                       status: PRESENT
 *                       lateMinutes: 0
 *                       workedMinutes: null
 *                     employee:
 *                       id: clxyz456
 *                       name: João Tambue
 *                       area: DEV_FULLSTACK
 *               atrasado:
 *                 summary: Entrada com atraso
 *                 value:
 *                   success: true
 *                   message: "Check-in efectuado com sucesso. Atraso de 12 minuto(s)."
 *                   data:
 *                     record:
 *                       id: clrec456
 *                       date: "2026-05-31"
 *                       checkInAt: "2026-05-31T08:27:00.000Z"
 *                       checkOutAt: null
 *                       status: LATE
 *                       lateMinutes: 12
 *                       workedMinutes: null
 *                     employee:
 *                       id: clxyz456
 *                       name: João Tambue
 *                       area: DEV_FULLSTACK
 *       400:
 *         description: QR Code inválido ou revogado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalido:
 *                 value: { success: false, message: "QR Code inválido", data: null }
 *               revogado:
 *                 value: { success: false, message: "QR Code revogado", data: null }
 *       409:
 *         description: Check-in já realizado hoje
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Check-in já realizado hoje. Use o endpoint de check-out."
 *               data: null
 */
attendanceRoutes.post(
  '/checkin',
  authenticate,
  authorize(Role.EMPLOYEE),
  ctrl.checkIn.bind(ctrl),
);

/**
 * @swagger
 * /api/v1/attendance/checkout:
 *   post:
 *     summary: Registar saída (check-out) via QR Code
 *     description: >
 *       O mesmo QR Code usado no check-in serve para o check-out.
 *       O sistema calcula automaticamente o tempo trabalhado em minutos.
 *       É obrigatório ter feito check-in antes.
 *     tags: [Attendance]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QRCheckRequest'
 *           example:
 *             token: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       200:
 *         description: Check-out efectuado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/CheckOutResponse'
 *             example:
 *               success: true
 *               message: "Check-out efectuado. Trabalhou 8h 45min hoje."
 *               data:
 *                 workedMinutes: 525
 *                 record:
 *                   id: clrec123
 *                   date: "2026-05-31"
 *                   checkInAt: "2026-05-31T08:02:00.000Z"
 *                   checkOutAt: "2026-05-31T16:47:00.000Z"
 *                   status: PRESENT
 *                   lateMinutes: 0
 *                   workedMinutes: 525
 *                 employee:
 *                   id: clxyz456
 *                   name: João Tambue
 *                   area: DEV_FULLSTACK
 *       400:
 *         description: Check-in não encontrado ou QR Code inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Check-out já realizado hoje
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
attendanceRoutes.post(
  '/checkout',
  authenticate,
  authorize(Role.EMPLOYEE),
  ctrl.checkOut.bind(ctrl),
);

/**
 * @swagger
 * /api/v1/attendance/my/today:
 *   get:
 *     summary: Estado de presença do funcionário no dia de hoje
 *     description: >
 *       Retorna o registo de hoje (se existir) e dois flags úteis:
 *       `canCheckIn` e `canCheckOut`, que indicam qual a acção disponível.
 *     tags: [Attendance]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de hoje
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/TodayStatusResponse'
 *             examples:
 *               semRegisto:
 *                 summary: Sem registo ainda hoje
 *                 value:
 *                   success: true
 *                   message: Estado de hoje
 *                   data:
 *                     date: "2026-05-31"
 *                     record: null
 *                     canCheckIn: true
 *                     canCheckOut: false
 *               aposCheckin:
 *                 summary: Após check-in, antes do check-out
 *                 value:
 *                   success: true
 *                   message: Estado de hoje
 *                   data:
 *                     date: "2026-05-31"
 *                     record:
 *                       id: clrec123
 *                       checkInAt: "2026-05-31T08:02:00.000Z"
 *                       checkOutAt: null
 *                       status: PRESENT
 *                       lateMinutes: 0
 *                       workedMinutes: null
 *                     canCheckIn: false
 *                     canCheckOut: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
attendanceRoutes.get(
  '/my/today',
  authenticate,
  authorize(Role.EMPLOYEE),
  ctrl.myToday.bind(ctrl),
);

/**
 * @swagger
 * /api/v1/attendance/my/history:
 *   get:
 *     summary: Histórico de presenças do funcionário autenticado
 *     description: >
 *       Retorna os registos num intervalo de datas com um resumo estatístico.
 *       Por defeito, retorna o mês corrente se `from` não for fornecido.
 *     tags: [Attendance]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: "Data de início (YYYY-MM-DD). Omitir = início do mês corrente"
 *         example: "2026-05-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: "Data de fim (YYYY-MM-DD). Omitir = hoje"
 *         example: "2026-05-31"
 *     responses:
 *       200:
 *         description: Histórico obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/AttendanceHistoryResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
attendanceRoutes.get(
  '/my/history',
  authenticate,
  authorize(Role.EMPLOYEE),
  ctrl.myHistory.bind(ctrl),
);

// ─────────────────────────────────────────────────────────────────────────────
// Rotas do Coordenador  (COORDINATOR)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/attendance/today:
 *   get:
 *     summary: Lista completa de todos os funcionários com estado de hoje
 *     description: >
 *       Retorna **todos** os funcionários activos, mesmo os que ainda não
 *       fizeram check-in hoje. Ideal para o painel de controlo do coordenador
 *       visualizar quem já chegou, quem está atrasado e quem ainda não apareceu.
 *     tags: [Attendance]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa com estado de cada funcionário hoje
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Lista de presenças do dia" }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TodayListItem'
 *             example:
 *               success: true
 *               message: Lista de presenças do dia
 *               data:
 *                 - employee:
 *                     id: clxyz456
 *                     name: João Tambue
 *                     area: DEV_FULLSTACK
 *                     email: joao@empresa.ao
 *                     phone: "+244 912 345 678"
 *                   date: "2026-05-31"
 *                   recordId: clrec123
 *                   checkInAt: "2026-05-31T08:02:00.000Z"
 *                   checkOutAt: null
 *                   status: PRESENT
 *                   lateMinutes: 0
 *                   workedMinutes: null
 *                 - employee:
 *                     id: clxyz789
 *                     name: Ana Ferreira
 *                     area: FRONTEND_ENGINEER
 *                     email: ana@empresa.ao
 *                     phone: "+244 923 456 789"
 *                   date: "2026-05-31"
 *                   recordId: null
 *                   checkInAt: null
 *                   checkOutAt: null
 *                   status: NOT_REGISTERED
 *                   lateMinutes: 0
 *                   workedMinutes: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
attendanceRoutes.get(
  '/today',
  authenticate,
  authorize(Role.COORDINATOR),
  ctrl.todayFullList.bind(ctrl),
);