import { Router } from 'express';
import { StockController } from '@/controllers/stock.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const stockController = new StockController();
const authMiddleware = new AuthMiddleware();

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/stock/items:
 *   get:
 *     summary: Listar itens de estoque
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de itens
 */
router.get('/items', stockController.getAll);

/**
 * @swagger
 * /api/v1/stock/items/{id}:
 *   get:
 *     summary: Buscar item por ID
 *     tags: [Stock]
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
 *         description: Dados do item
 */
router.get('/items/:id', stockController.getById);

/**
 * @swagger
 * /api/v1/stock/items:
 *   post:
 *     summary: Criar novo item
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Item criado
 */
router.post('/items', authMiddleware.authorize('admin', 'manager'), stockController.create);

/**
 * @swagger
 * /api/v1/stock/items/{id}:
 *   put:
 *     summary: Atualizar item
 *     tags: [Stock]
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
 *     responses:
 *       200:
 *         description: Item atualizado
 */
router.put('/items/:id', authMiddleware.authorize('admin', 'manager'), stockController.update);

/**
 * @swagger
 * /api/v1/stock/items/{id}:
 *   delete:
 *     summary: Excluir item
 *     tags: [Stock]
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
 *         description: Item excluído
 */
router.delete('/items/:id', authMiddleware.authorize('admin', 'manager'), stockController.delete);

/**
 * @swagger
 * /api/v1/stock/movements:
 *   post:
 *     summary: Registrar movimentação
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Movimentação registrada
 */
router.post('/movements', authMiddleware.authorize('admin', 'manager'), stockController.createMovement);

/**
 * @swagger
 * /api/v1/stock/movements:
 *   get:
 *     summary: Listar todas as movimentações
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de movimentações
 */
router.get('/movements', stockController.getAllMovements);

/**
 * @swagger
 * /api/v1/stock/items/{id}/movements:
 *   get:
 *     summary: Listar movimentações de um item
 *     tags: [Stock]
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
 *         description: Lista de movimentações do item
 */
router.get('/items/:id/movements', stockController.getMovements);

/**
 * @swagger
 * /api/v1/stock/stats:
 *   get:
 *     summary: Estatísticas do estoque
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas
 */
router.get('/stats', stockController.getStats);

/**
 * @swagger
 * /api/v1/stock/alerts/low-stock:
 *   get:
 *     summary: Itens com estoque baixo
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de itens com estoque baixo
 */
router.get('/alerts/low-stock', stockController.getLowStockItems);

/**
 * @swagger
 * /api/v1/stock/alerts/expiring:
 *   get:
 *     summary: Itens vencendo
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de itens vencendo
 */
router.get('/alerts/expiring', stockController.getExpiringItems);

export default router;
