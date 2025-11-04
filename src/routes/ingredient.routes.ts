import { Router } from 'express';
import { IngredientController } from '@/controllers/ingredient.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const ingredientController = new IngredientController();
const authMiddleware = new AuthMiddleware();

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/ingredients:
 *   get:
 *     summary: Listar todos os insumos
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de insumos
 */
router.get('/', ingredientController.getAll);

/**
 * @swagger
 * /api/v1/ingredients/{id}:
 *   get:
 *     summary: Buscar insumo por ID
 *     tags: [Ingredients]
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
 *         description: Insumo encontrado
 *       404:
 *         description: Insumo não encontrado
 */
router.get('/:id', ingredientController.getById);

/**
 * @swagger
 * /api/v1/ingredients:
 *   post:
 *     summary: Criar novo insumo
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - unit
 *               - currentQuantity
 *               - minimumQuantity
 *               - averageCost
 *             properties:
 *               name:
 *                 type: string
 *               unit:
 *                 type: string
 *                 enum: [kg, g, l, ml, un]
 *               currentQuantity:
 *                 type: number
 *               minimumQuantity:
 *                 type: number
 *               averageCost:
 *                 type: number
 *     responses:
 *       201:
 *         description: Insumo criado
 */
router.post('/', authMiddleware.authorize('admin'), ingredientController.create);

/**
 * @swagger
 * /api/v1/ingredients/{id}:
 *   put:
 *     summary: Atualizar insumo
 *     tags: [Ingredients]
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
 *         description: Insumo atualizado
 */
router.put('/:id', authMiddleware.authorize('admin'), ingredientController.update);

/**
 * @swagger
 * /api/v1/ingredients/{id}/link-product:
 *   post:
 *     summary: Vincular insumo a produto
 *     tags: [Ingredients]
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
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Insumo vinculado ao produto
 */
router.post('/:id/link-product', authMiddleware.authorize('admin'), ingredientController.linkToProduct);

export default router;
