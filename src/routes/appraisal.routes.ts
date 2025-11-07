import { Router } from 'express';
import { AppraisalController } from '@/controllers/appraisal.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new AppraisalController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * tags:
 *   name: Appraisals
 *   description: Conferência de estoque endpoints
 */

/**
 * @swagger
 * /api/v1/appraisals:
 *   post:
 *     summary: Criar nova conferência de estoque
 *     tags: [Appraisals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - type
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conferência criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', authMiddleware.authenticate, controller.create);

/**
 * @swagger
 * /api/v1/appraisals:
 *   get:
 *     summary: Listar conferências de estoque
 *     tags: [Appraisals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, approved]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de conferências
 *       401:
 *         description: Não autenticado
 */
router.get('/', authMiddleware.authenticate, controller.getAll);

/**
 * @swagger
 * /api/v1/appraisals/{id}:
 *   get:
 *     summary: Buscar conferência por ID
 *     tags: [Appraisals]
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
 *         description: Conferência encontrada
 *       404:
 *         description: Conferência não encontrada
 *       401:
 *         description: Não autenticado
 */
router.get('/:id', authMiddleware.authenticate, controller.getById);

/**
 * @swagger
 * /api/v1/appraisals/{id}:
 *   put:
 *     summary: Atualizar conferência
 *     tags: [Appraisals]
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
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conferência atualizada
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Conferência não encontrada
 *       401:
 *         description: Não autenticado
 */
router.put('/:id', authMiddleware.authenticate, controller.update);

/**
 * @swagger
 * /api/v1/appraisals/{id}:
 *   delete:
 *     summary: Excluir conferência
 *     tags: [Appraisals]
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
 *         description: Conferência excluída
 *       404:
 *         description: Conferência não encontrada
 *       401:
 *         description: Não autenticado
 */
router.delete('/:id', authMiddleware.authenticate, controller.delete);

/**
 * @swagger
 * /api/v1/appraisals/{id}/items:
 *   post:
 *     summary: Adicionar item à conferência
 *     tags: [Appraisals]
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
 *               - ingredientId
 *               - theoreticalQuantity
 *               - unitCost
 *             properties:
 *               ingredientId:
 *                 type: string
 *                 format: uuid
 *               theoreticalQuantity:
 *                 type: number
 *               unitCost:
 *                 type: number
 *     responses:
 *       201:
 *         description: Item adicionado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Conferência não encontrada
 *       401:
 *         description: Não autenticado
 */
router.post('/:id/items', authMiddleware.authenticate, controller.addItem);

/**
 * @swagger
 * /api/v1/appraisals/{id}/items/{itemId}:
 *   put:
 *     summary: Atualizar item da conferência
 *     tags: [Appraisals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
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
 *             properties:
 *               physicalQuantity:
 *                 type: number
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item atualizado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Item não encontrado
 *       401:
 *         description: Não autenticado
 */
router.put('/:id/items/:itemId', authMiddleware.authenticate, controller.updateItem);

/**
 * @swagger
 * /api/v1/appraisals/{id}/items/{itemId}:
 *   delete:
 *     summary: Remover item da conferência
 *     tags: [Appraisals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item removido
 *       404:
 *         description: Item não encontrado
 *       401:
 *         description: Não autenticado
 */
router.delete('/:id/items/:itemId', authMiddleware.authenticate, controller.removeItem);

/**
 * @swagger
 * /api/v1/appraisals/{id}/complete:
 *   post:
 *     summary: Completar conferência
 *     tags: [Appraisals]
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
 *         description: Conferência completada
 *       400:
 *         description: Conferência não pode ser completada
 *       404:
 *         description: Conferência não encontrada
 *       401:
 *         description: Não autenticado
 */
router.post('/:id/complete', authMiddleware.authenticate, controller.complete);

/**
 * @swagger
 * /api/v1/appraisals/{id}/approve:
 *   post:
 *     summary: Aprovar conferência (apenas gerentes)
 *     tags: [Appraisals]
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
 *         description: Conferência aprovada
 *       400:
 *         description: Conferência não pode ser aprovada
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Conferência não encontrada
 *       401:
 *         description: Não autenticado
 */
router.post(
  '/:id/approve',
  authMiddleware.authenticate,
  authMiddleware.authorize('manager', 'admin'),
  controller.approve
);

/**
 * @swagger
 * /api/v1/appraisals/{id}/accuracy:
 *   get:
 *     summary: Calcular acurácia da conferência
 *     tags: [Appraisals]
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
 *         description: Acurácia calculada
 *       404:
 *         description: Conferência não encontrada
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/accuracy', authMiddleware.authenticate, controller.getAccuracy);

export default router;
