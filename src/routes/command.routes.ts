import { Router } from 'express';
import { CommandController } from '@/controllers/command.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const commandController = new CommandController();
const authMiddleware = new AuthMiddleware();

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/commands:
 *   get:
 *     summary: Listar todas as comandas
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comandas
 */
router.get('/', commandController.getAll);

/**
 * @swagger
 * /api/v1/commands/open:
 *   get:
 *     summary: Listar comandas abertas
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comandas abertas
 */
router.get('/open', commandController.getOpen);

/**
 * @swagger
 * /api/v1/commands/{id}:
 *   get:
 *     summary: Buscar comanda por ID
 *     tags: [Commands]
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
 *         description: Comanda encontrada
 */
router.get('/:id', commandController.getById);

/**
 * @swagger
 * /api/v1/commands/waiter/{waiterId}:
 *   get:
 *     summary: Listar comandas de um garçom
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: waiterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de comandas do garçom
 */
router.get('/waiter/:waiterId', commandController.getByWaiter);

/**
 * @swagger
 * /api/v1/commands:
 *   post:
 *     summary: Abrir nova comanda
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numberOfPeople
 *               - type
 *             properties:
 *               tableId:
 *                 type: string
 *                 format: uuid
 *               numberOfPeople:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [table, counter]
 *     responses:
 *       201:
 *         description: Comanda aberta
 */
router.post('/', authMiddleware.authorize('waiter', 'admin'), commandController.openCommand);

/**
 * @swagger
 * /api/v1/commands/{id}/close:
 *   post:
 *     summary: Fechar comanda
 *     tags: [Commands]
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
 *               serviceChargePercentage:
 *                 type: number
 *                 default: 10
 *     responses:
 *       200:
 *         description: Comanda fechada
 */
router.post('/:id/close', authMiddleware.authorize('waiter', 'admin'), commandController.closeCommand);

/**
 * @swagger
 * /api/v1/commands/{id}/confirm-payment:
 *   post:
 *     summary: Confirmar pagamento da comanda
 *     tags: [Commands]
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
 *         description: Pagamento confirmado
 */
router.post('/:id/confirm-payment', authMiddleware.authorize('cashier', 'admin'), commandController.confirmPayment);

export default router;
