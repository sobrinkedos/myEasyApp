import { Router } from 'express';
import { TableController } from '@/controllers/table.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const tableController = new TableController();
const authMiddleware = new AuthMiddleware();

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/tables:
 *   get:
 *     summary: Listar todas as mesas
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mesas
 */
router.get('/', tableController.getAll);

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   get:
 *     summary: Buscar mesa por ID
 *     tags: [Tables]
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
 *         description: Mesa encontrada
 */
router.get('/:id', tableController.getById);

/**
 * @swagger
 * /api/v1/tables:
 *   post:
 *     summary: Criar nova mesa
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - capacity
 *             properties:
 *               number:
 *                 type: integer
 *               capacity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Mesa criada
 */
router.post('/', authMiddleware.authorize('admin'), tableController.create);

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   put:
 *     summary: Atualizar mesa
 *     tags: [Tables]
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
 *         description: Mesa atualizada
 */
router.put('/:id', authMiddleware.authorize('admin'), tableController.update);

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   delete:
 *     summary: Remover mesa
 *     tags: [Tables]
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
 *         description: Mesa removida
 */
router.delete('/:id', authMiddleware.authorize('admin'), tableController.delete);

export default router;
