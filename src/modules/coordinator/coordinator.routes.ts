import { Router } from 'express';
import { CoordinatorController } from './coordinator.controller';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { Role } from '../auth/auth.model';

export const coordinatorRoutes = Router();
const ctrl = new CoordinatorController();

// Todos os endpoints deste módulo requerem autenticação + role COORDINATOR
coordinatorRoutes.use(authenticate, authorize(Role.COORDINATOR));

/**
 * @swagger
 * tags:
 *   name: Coordinator
 *   description: Gestão de funcionários e presenças (apenas Coordenadores)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Employees
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/coordinator/employees:
 *   get:
 *     summary: Listar todos os funcionários
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: area
 *         schema:
 *           $ref: '#/components/schemas/Area'
 *         description: Filtrar por área
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (activo/inactivo)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pesquisar por nome ou email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de funcionários com paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Funcionários obtidos }
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EmployeeListItem'
 *                     meta:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
coordinatorRoutes.get('/employees', ctrl.listEmployees.bind(ctrl));

/**
 * @swagger
 * /api/v1/coordinator/employees/{id}:
 *   get:
 *     summary: Detalhe de um funcionário (inclui horário e QR Code)
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeId'
 *     responses:
 *       200:
 *         description: Detalhe do funcionário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/EmployeeDetail'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
coordinatorRoutes.get('/employees/:id', ctrl.getEmployee.bind(ctrl));

/**
 * @swagger
 * /api/v1/coordinator/employees/{id}:
 *   patch:
 *     summary: Actualizar dados de um funcionário
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmployeeRequest'
 *           example:
 *             name: João Tambue Silva
 *             phone: "+244 921 111 222"
 *             area: BACKEND_ENGINEER
 *     responses:
 *       200:
 *         description: Funcionário actualizado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
coordinatorRoutes.patch('/employees/:id', ctrl.updateEmployee.bind(ctrl));

/**
 * @swagger
 * /api/v1/coordinator/employees/{id}/activate:
 *   patch:
 *     summary: Activar funcionário
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeId'
 *     responses:
 *       200:
 *         description: Funcionário activado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
coordinatorRoutes.patch('/employees/:id/activate', ctrl.activateEmployee.bind(ctrl));

/**
 * @swagger
 * /api/v1/coordinator/employees/{id}/deactivate:
 *   patch:
 *     summary: Desactivar funcionário (sem o eliminar)
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeId'
 *     responses:
 *       200:
 *         description: Funcionário desactivado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
coordinatorRoutes.patch('/employees/:id/deactivate', ctrl.deactivateEmployee.bind(ctrl));

// ─────────────────────────────────────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/coordinator/stats:
 *   get:
 *     summary: Estatísticas gerais (totais, activos, por área)
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/EmployeeStats'
 */
coordinatorRoutes.get('/stats', ctrl.getStats.bind(ctrl));

// ─────────────────────────────────────────────────────────────────────────────
// Work Schedules
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/coordinator/employees/{id}/schedule:
 *   put:
 *     summary: Criar ou actualizar horário de trabalho do funcionário
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpsertScheduleRequest'
 *           example:
 *             expectedCheckIn: "08:00"
 *             expectedCheckOut: "17:00"
 *             lateToleranceMinutes: 15
 *     responses:
 *       200:
 *         description: Horário guardado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         description: Formato de hora inválido
 */
coordinatorRoutes.put('/employees/:id/schedule', ctrl.upsertSchedule.bind(ctrl));

/**
 * @swagger
 * /api/v1/coordinator/employees/{id}/schedule:
 *   delete:
 *     summary: Remover horário de trabalho do funcionário
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeId'
 *     responses:
 *       200:
 *         description: Horário removido
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
coordinatorRoutes.delete('/employees/:id/schedule', ctrl.deleteSchedule.bind(ctrl));

// ─────────────────────────────────────────────────────────────────────────────
// Attendance (visão do coordenador)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/coordinator/attendance/today:
 *   get:
 *     summary: Lista de registos de presença do dia de hoje
 *     description: Retorna apenas os funcionários que já têm registo hoje (check-in ou check-out).
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Registos do dia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecordWithEmployee'
 */
coordinatorRoutes.get('/attendance/today', ctrl.getTodayAttendance.bind(ctrl));

/**
 * @swagger
 * /api/v1/coordinator/attendance/summary:
 *   get:
 *     summary: Resumo estatístico de presenças de um dia
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: "Data no formato YYYY-MM-DD (omitir = hoje)"
 *         example: "2026-05-31"
 *     responses:
 *       200:
 *         description: Resumo do dia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/DailyAttendanceSummary'
 */
coordinatorRoutes.get('/attendance/summary', ctrl.getDailySummary.bind(ctrl));

/**
 * @swagger
 * /api/v1/coordinator/employees/{id}/attendance:
 *   get:
 *     summary: Histórico de presenças de um funcionário
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/EmployeeId'
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-05-01"
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-05-31"
 *     responses:
 *       200:
 *         description: Histórico de presenças
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
coordinatorRoutes.get('/employees/:id/attendance', ctrl.getEmployeeHistory.bind(ctrl));

/**
 * @swagger
 * /api/v1/coordinator/attendance/manual:
 *   post:
 *     summary: Registar ou corrigir presença manualmente
 *     description: Permite ao coordenador criar ou substituir o registo de presença de um funcionário para qualquer data.
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ManualAttendanceRequest'
 *           example:
 *             employeeId: "clxyz456def"
 *             date: "2026-05-30"
 *             checkInAt: "08:10"
 *             checkOutAt: "17:05"
 *             notes: "Registo manual — sistema estava em manutenção"
 *     responses:
 *       200:
 *         description: Presença registada manualmente
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
coordinatorRoutes.post('/attendance/manual', ctrl.manualAttendance.bind(ctrl));

/**
 * @swagger
 * /api/v1/coordinator/attendance/{recordId}/note:
 *   patch:
 *     summary: Adicionar ou editar nota num registo de presença
 *     tags: [Coordinator]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recordId
 *         required: true
 *         schema:
 *           type: string
 *         example: "clrecord123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [notes]
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Funcionário avisou atraso com antecedência"
 *     responses:
 *       200:
 *         description: Nota adicionada com sucesso
 */
coordinatorRoutes.patch('/attendance/:recordId/note', ctrl.addNote.bind(ctrl));
