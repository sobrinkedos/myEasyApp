import { Router } from 'express';
import { CategoryController } from '@/controllers/category.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const categoryController = new CategoryController();
const authMiddleware = new AuthMiddleware();

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Listar todas as categorias
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/', categoryController.getAll);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Buscar categoria por ID
 *     tags: [Categories]
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
 *         description: Categoria encontrada
 *       404:
 *         description: Categoria não encontrada
 */
router.get('/:id', categoryController.getById);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Criar nova categoria
 *     tags: [Categories]
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
 *               - displayOrder
 *             properties:
 *               name:
 *                 type: string
 *               displayOrder:
 *                 type: number
 *     responses:
 *       201:
 *         description: Categoria criada
 */
router.post('/', authMiddleware.authorize('admin'), categoryController.create);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Atualizar categoria
 *     tags: [Categories]
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
 *         description: Categoria atualizada
 */
router.put('/:id', authMiddleware.authorize('admin'), categoryController.update);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Remover categoria
 *     tags: [Categories]
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
 *         description: Categoria removida
 */
router.delete('/:id', authMiddleware.authorize('admin'), categoryController.delete);

export default router;
