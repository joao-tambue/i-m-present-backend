import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/authenticate';
import { Role } from '../auth/auth.model';
import { QRCodeController } from './qrcode.controller';

export const qrCodeRoutes = Router();
const ctrl = new QRCodeController();

/**
 * @swagger
 * tags:
 *   name: QR Code
 *   description: Emissão, consulta e revogação de QR Codes de funcionários
 */

/**
 * @swagger
 * /api/v1/qr-code/list:
 *   get:
 *     summary: Listar todos os QR Codes (com paginação)
 *     tags: [QR Code]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Itens por página (default 20)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Procurar por nome ou email
 *     responses:
 *       200:
 *         description: QR Codes listados
 */
qrCodeRoutes.get(
  '/list',
  authenticate,
  authorize(Role.COORDINATOR),
  ctrl.list.bind(ctrl),
);

/**
 * @swagger
 * /api/v1/qr-code/employees/{id}:
 *   get:
 *     summary: Obter QR Code de um funcionário específico (com imagens)
 *     tags: [QR Code]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do funcionário
 *     responses:
 *       200:
 *         description: QR Code obtido com imageDataUrl e svg
 */
qrCodeRoutes.get(
  '/employees/:id',
  authenticate,
  authorize(Role.COORDINATOR),
  ctrl.getByEmployeeId.bind(ctrl),
);

/**
 * @swagger
 * /api/v1/qr-code/my:
 *   get:
 *     summary: Obter o QR Code do funcionário autenticado
 *     tags: [QR Code]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: QR Code obtido
 */
qrCodeRoutes.get(
  '/my',
  authenticate,
  authorize(Role.EMPLOYEE),
  ctrl.getMyQRCode.bind(ctrl),
);

/**
 * @swagger
 * /api/v1/qr-code/employees/{id}/regenerate:
 *   post:
 *     summary: Gerar ou regenerar QR Code de um funcionário
 *     tags: [QR Code]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: QR Code gerado
 */
qrCodeRoutes.post(
  '/employees/:id/regenerate',
  authenticate,
  authorize(Role.COORDINATOR),
  ctrl.regenerate.bind(ctrl),
);

/**
 * @swagger
 * /api/v1/qr-code/employees/{id}/revoke:
 *   patch:
 *     summary: Revogar QR Code de um funcionário
 *     tags: [QR Code]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: QR Code revogado
 */
qrCodeRoutes.patch(
  '/employees/:id/revoke',
  authenticate,
  authorize(Role.COORDINATOR),
  ctrl.revoke.bind(ctrl),
);
