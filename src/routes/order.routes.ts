import { Router } from 'express';
import { OrderController } from '@/controllers/order.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const orderController = new OrderController();
const authMiddleware = new AuthMiddleware();

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Buscar pedido por ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido encontrado
 */
router.get('/:id', orderController.getById);

/**
 * @swagger
 * /api/v1/orders/by-command/{commandId}:
 *   get:
 *     summary: Listar pedidos de uma comanda
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commandId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/by-command/:commandId', orderController.getByCommand);

/**
 * @swagger
 * /api/v1/orders/by-status/{status}:
 *   get:
 *     summary: Listar pedidos por status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, preparing, ready, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/by-status/:status', orderController.getByStatus);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Criar novo pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commandId
 *               - items
 *             properties:
 *               commandId:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
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
 *                     observations:
 *                       type: string
 *     responses:
 *       201:
 *         description: Pedido criado
 */
router.post('/', authMiddleware.authorize('waiter', 'admin'), orderController.create);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   put:
 *     summary: Atualizar status do pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 enum: [pending, preparing, ready, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status atualizado
 */
router.put('/:id/status', authMiddleware.authorize('waiter', 'kitchen', 'admin'), orderController.updateStatus);

/**
 * @swagger
 * /api/v1/orders/{id}/cancel:
 *   post:
 *     summary: Cancelar pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 minLength: 15
 *     responses:
 *       200:
 *         description: Pedido cancelado
 */
router.post('/:id/cancel', authMiddleware.authorize('waiter', 'admin'), orderController.cancel);

/**
 * @swagger
 * /api/v1/orders/{id}/modify:
 *   put:
 *     summary: Modificar pedido (adicionar/remover itens)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addItems:
 *                 type: array
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
 *                     observations:
 *                       type: string
 *               removeItemIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Pedido modificado
 */
router.put('/:id/modify', authMiddleware.authorize('waiter', 'admin'), orderController.modify);

export default router;
