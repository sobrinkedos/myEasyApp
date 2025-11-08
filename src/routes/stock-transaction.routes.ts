import { Router } from 'express';
import { StockTransactionController } from '@/controllers/stock-transaction.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const stockTransactionController = new StockTransactionController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     StockTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         ingredientId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [purchase, usage, adjustment, waste]
 *         quantity:
 *           type: number
 *         unitCost:
 *           type: number
 *         totalValue:
 *           type: number
 *         reason:
 *           type: string
 *         reference:
 *           type: string
 *         userId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/stock/transactions:
 *   get:
 *     summary: Listar transações de estoque
 *     tags: [Stock Transactions]
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
 *           enum: [purchase, usage, adjustment, waste]
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de transações
 */
router.get('/', authMiddleware.authenticate, stockTransactionController.getAll);

/**
 * @swagger
 * /api/v1/stock/transactions:
 *   post:
 *     summary: Criar transação de estoque
 *     tags: [Stock Transactions]
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
 *                 enum: [purchase, usage, adjustment, waste]
 *               quantity:
 *                 type: number
 *               unitCost:
 *                 type: number
 *               totalValue:
 *                 type: number
 *               reason:
 *                 type: string
 *               reference:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transação criada
 */
router.post('/', authMiddleware.authenticate, stockTransactionController.create);

/**
 * @swagger
 * /api/v1/stock/transactions/bulk:
 *   post:
 *     summary: Criar múltiplas transações de estoque
 *     tags: [Stock Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactions
 *             properties:
 *               transactions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - ingredientId
 *                     - type
 *                     - quantity
 *                   properties:
 *                     ingredientId:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [purchase, usage, adjustment, waste]
 *                     quantity:
 *                       type: number
 *                     unitCost:
 *                       type: number
 *                     totalValue:
 *                       type: number
 *                     reason:
 *                       type: string
 *                     reference:
 *                       type: string
 *     responses:
 *       201:
 *         description: Transações criadas
 */
router.post('/bulk', authMiddleware.authenticate, stockTransactionController.createBulk);

/**
 * @swagger
 * /api/v1/stock/transactions/purchases/period:
 *   get:
 *     summary: Total de compras por período
 *     tags: [Stock Transactions]
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
 *         description: Total de compras
 */
router.get('/purchases/period', authMiddleware.authenticate, stockTransactionController.getPurchasesByPeriod);

/**
 * @swagger
 * /api/v1/stock/transactions/ingredient/{ingredientId}:
 *   get:
 *     summary: Transações por ingrediente
 *     tags: [Stock Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ingredientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transações do ingrediente
 */
router.get('/ingredient/:ingredientId', authMiddleware.authenticate, stockTransactionController.getByIngredient);

/**
 * @swagger
 * /api/v1/stock/transactions/{id}:
 *   get:
 *     summary: Buscar transação por ID
 *     tags: [Stock Transactions]
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
 *         description: Transação encontrada
 *       404:
 *         description: Transação não encontrada
 */
router.get('/:id', authMiddleware.authenticate, stockTransactionController.getById);

/**
 * @swagger
 * /api/v1/stock/transactions/{id}:
 *   put:
 *     summary: Atualizar transação
 *     tags: [Stock Transactions]
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
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [purchase, usage, adjustment, waste]
 *               quantity:
 *                 type: number
 *               unitCost:
 *                 type: number
 *               totalValue:
 *                 type: number
 *               reason:
 *                 type: string
 *               reference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transação atualizada
 */
router.put('/:id', authMiddleware.authenticate, stockTransactionController.update);

/**
 * @swagger
 * /api/v1/stock/transactions/{id}:
 *   delete:
 *     summary: Deletar transação
 *     tags: [Stock Transactions]
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
 *         description: Transação deletada
 */
router.delete('/:id', authMiddleware.authenticate, stockTransactionController.delete);

export default router;
