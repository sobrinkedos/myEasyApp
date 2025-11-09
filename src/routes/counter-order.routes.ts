/**
 * Counter Order Routes
 * Rotas para endpoints de Pedidos Balcão
 */

import { Router } from 'express';
import { CounterOrderController } from '@/controllers/counter-order.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const counterOrderController = new CounterOrderController();
const authMiddleware = new AuthMiddleware();

// Aplicar autenticação em todas as rotas
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/counter-orders:
 *   post:
 *     summary: Criar novo pedido balcão
 *     tags: [Counter Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               customerName:
 *                 type: string
 *                 maxLength: 100
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 99
 *                     notes:
 *                       type: string
 *                       maxLength: 200
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 */
router.post(
  '/',
  authMiddleware.authorize('WAITER', 'CASHIER', 'MANAGER', 'ADMIN'),
  counterOrderController.create
);

/**
 * @swagger
 * /api/v1/counter-orders:
 *   get:
 *     summary: Listar pedidos ativos
 *     tags: [Counter Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos ativos
 */
router.get(
  '/',
  authMiddleware.authorize('WAITER', 'CASHIER', 'KITCHEN', 'MANAGER', 'ADMIN'),
  counterOrderController.list
);

/**
 * @swagger
 * /api/v1/counter-orders/pending-payment:
 *   get:
 *     summary: Listar pedidos pendentes de pagamento
 *     tags: [Counter Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos pendentes de pagamento
 */
router.get(
  '/pending-payment',
  authMiddleware.authorize('CASHIER', 'MANAGER', 'ADMIN'),
  counterOrderController.listPendingPayment
);

/**
 * @swagger
 * /api/v1/counter-orders/ready:
 *   get:
 *     summary: Listar pedidos prontos
 *     tags: [Counter Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos prontos
 */
router.get(
  '/ready',
  authMiddleware.authorize('WAITER', 'CASHIER', 'MANAGER', 'ADMIN'),
  counterOrderController.listReady
);

/**
 * @swagger
 * /api/v1/counter-orders/metrics:
 *   get:
 *     summary: Obter métricas de pedidos balcão
 *     tags: [Counter Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Métricas de pedidos balcão
 */
router.get(
  '/metrics',
  authMiddleware.authorize('MANAGER', 'ADMIN'),
  counterOrderController.getMetrics
);

/**
 * @swagger
 * /api/v1/counter-orders/{id}:
 *   get:
 *     summary: Buscar pedido por ID
 *     tags: [Counter Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Pedido encontrado
 */
router.get(
  '/:id',
  authMiddleware.authorize('WAITER', 'CASHIER', 'KITCHEN', 'MANAGER', 'ADMIN'),
  counterOrderController.getById
);

/**
 * @swagger
 * /api/v1/counter-orders/number/{orderNumber}:
 *   get:
 *     summary: Buscar pedido por número
 *     tags: [Counter Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido encontrado
 */
router.get(
  '/number/:orderNumber',
  authMiddleware.authorize('WAITER', 'CASHIER', 'KITCHEN', 'MANAGER', 'ADMIN'),
  counterOrderController.getByNumber
);

/**
 * @swagger
 * /api/v1/counter-orders/{id}/status:
 *   patch:
 *     summary: Atualizar status do pedido
 *     tags: [Counter Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDENTE, PREPARANDO, PRONTO, ENTREGUE]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 */
router.patch(
  '/:id/status',
  authMiddleware.authorize('WAITER', 'KITCHEN', 'MANAGER', 'ADMIN'),
  counterOrderController.updateStatus
);

/**
 * @swagger
 * /api/v1/counter-orders/{id}/confirm-payment:
 *   post:
 *     summary: Confirmar pagamento do pedido
 *     tags: [Counter Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Pagamento confirmado com sucesso
 */
router.post(
  '/:id/confirm-payment',
  authMiddleware.authorize('CASHIER', 'MANAGER', 'ADMIN'),
  counterOrderController.confirmPayment
);

/**
 * @swagger
 * /api/v1/counter-orders/{id}/cancel:
 *   post:
 *     summary: Cancelar pedido
 *     tags: [Counter Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: Pedido cancelado com sucesso
 */
router.post(
  '/:id/cancel',
  authMiddleware.authorize('MANAGER', 'ADMIN'),
  counterOrderController.cancel
);

export default router;
