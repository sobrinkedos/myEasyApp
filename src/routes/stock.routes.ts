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
 * /api/v1/stock/transactions:
 *   post:
 *     summary: Registrar transação de estoque
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ingredientId
 *               - type
 *               - quantity
 *             properties:
 *               ingredientId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [in, out, adjustment]
 *               quantity:
 *                 type: number
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transação registrada
 */
router.post('/transactions', authMiddleware.authorize('admin'), stockController.createTransaction);

/**
 * @swagger
 * /api/v1/stock/transactions:
 *   get:
 *     summary: Listar transações de estoque
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ingredientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [in, out, adjustment]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Lista de transações
 */
router.get('/transactions', stockController.getTransactions);

/**
 * @swagger
 * /api/v1/stock/ingredients/{ingredientId}/transactions:
 *   get:
 *     summary: Listar transações de um insumo específico
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ingredientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de transações do insumo
 */
router.get('/ingredients/:ingredientId/transactions', stockController.getTransactionsByIngredient);

// Import report controller
import { StockReportController } from '@/controllers/stock-report.controller';
const reportController = new StockReportController();

/**
 * @swagger
 * /api/v1/stock/report:
 *   get:
 *     summary: Relatório de estoque atual
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Relatório de estoque
 */
router.get('/report', reportController.getCurrentStock);

/**
 * @swagger
 * /api/v1/stock/report/low:
 *   get:
 *     summary: Relatório de insumos com estoque baixo
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Insumos com estoque baixo
 */
router.get('/report/low', reportController.getLowStock);

/**
 * @swagger
 * /api/v1/stock/report/movement:
 *   get:
 *     summary: Relatório de movimentação de estoque
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Relatório de movimentação
 */
router.get('/report/movement', reportController.getMovementReport);

/**
 * @swagger
 * /api/v1/stock/report/value:
 *   get:
 *     summary: Relatório de valor total do estoque
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Valor total do estoque
 */
router.get('/report/value', reportController.getStockValue);

/**
 * @swagger
 * /api/v1/stock/report/export/csv:
 *   get:
 *     summary: Exportar relatório de estoque em CSV
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Arquivo CSV
 */
router.get('/report/export/csv', reportController.exportCSV);

export default router;
