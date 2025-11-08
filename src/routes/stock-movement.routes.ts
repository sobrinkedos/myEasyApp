import { Router } from 'express';
import { StockMovementController } from '@/controllers/stock-movement.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const stockMovementController = new StockMovementController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * components:
 *   schemas:
 *     StockMovement:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         stockItemId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [purchase, usage, adjustment, waste, sale, return]
 *         quantity:
 *           type: number
 *         costPrice:
 *           type: number
 *         totalCost:
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

router.get('/', authMiddleware.authenticate, stockMovementController.getAll);
router.post('/', authMiddleware.authenticate, stockMovementController.create);
router.post('/bulk', authMiddleware.authenticate, stockMovementController.createBulk);
router.get('/purchases/period', authMiddleware.authenticate, stockMovementController.getPurchasesByPeriod);
router.get('/stock-item/:stockItemId', authMiddleware.authenticate, stockMovementController.getByStockItem);
router.get('/:id', authMiddleware.authenticate, stockMovementController.getById);
router.put('/:id', authMiddleware.authenticate, stockMovementController.update);
router.delete('/:id', authMiddleware.authenticate, stockMovementController.delete);

export default router;
