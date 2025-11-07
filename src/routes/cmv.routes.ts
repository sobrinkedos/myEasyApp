import { Router } from 'express';
import { CMVController } from '@/controllers/cmv.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new CMVController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * tags:
 *   name: CMV
 *   description: CMV (Custo de Mercadoria Vendida) endpoints
 */

/**
 * @swagger
 * /api/v1/cmv/periods:
 *   post:
 *     summary: Criar novo período CMV
 *     tags: [CMV]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *               - type
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Data inicial do período
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Data final do período
 *               type:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *                 description: Tipo do período
 *     responses:
 *       201:
 *         description: Período CMV criado com sucesso
 *       400:
 *         description: Dados inválidos ou período sobreposto
 *       401:
 *         description: Não autenticado
 */
router.post('/', authMiddleware.authenticate, controller.create);

/**
 * @swagger
 * /api/v1/cmv/periods:
 *   get:
 *     summary: Listar períodos CMV
 *     tags: [CMV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar por data inicial
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filtrar por data final
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Filtrar por tipo
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de períodos CMV
 *       401:
 *         description: Não autenticado
 */
router.get('/', authMiddleware.authenticate, controller.getAll);

/**
 * @swagger
 * /api/v1/cmv/periods/{id}:
 *   get:
 *     summary: Buscar período CMV por ID
 *     tags: [CMV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do período
 *     responses:
 *       200:
 *         description: Período CMV encontrado
 *       404:
 *         description: Período não encontrado
 *       401:
 *         description: Não autenticado
 */
router.get('/:id', authMiddleware.authenticate, controller.getById);

/**
 * @swagger
 * /api/v1/cmv/periods/{id}:
 *   put:
 *     summary: Atualizar período CMV
 *     tags: [CMV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do período
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               type:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *     responses:
 *       200:
 *         description: Período atualizado
 *       400:
 *         description: Dados inválidos ou período fechado
 *       404:
 *         description: Período não encontrado
 *       401:
 *         description: Não autenticado
 */
router.put('/:id', authMiddleware.authenticate, controller.update);

/**
 * @swagger
 * /api/v1/cmv/periods/{id}:
 *   delete:
 *     summary: Excluir período CMV
 *     tags: [CMV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do período
 *     responses:
 *       200:
 *         description: Período excluído
 *       400:
 *         description: Período fechado não pode ser excluído
 *       404:
 *         description: Período não encontrado
 *       401:
 *         description: Não autenticado
 */
router.delete('/:id', authMiddleware.authenticate, controller.delete);

/**
 * @swagger
 * /api/v1/cmv/periods/{id}/close:
 *   post:
 *     summary: Fechar período CMV (apenas gerentes)
 *     tags: [CMV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do período
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               closingAppraisalId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da conferência de estoque final (opcional)
 *     responses:
 *       200:
 *         description: Período fechado com sucesso
 *       400:
 *         description: Período não pode ser fechado ou falta conferência final
 *       403:
 *         description: Sem permissão (apenas gerentes)
 *       404:
 *         description: Período não encontrado
 *       401:
 *         description: Não autenticado
 */
router.post(
  '/:id/close',
  authMiddleware.authenticate,
  authMiddleware.authorize('manager', 'admin'),
  controller.close
);

/**
 * @swagger
 * /api/v1/cmv/periods/{id}/calculate:
 *   get:
 *     summary: Calcular CMV do período
 *     tags: [CMV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do período
 *     responses:
 *       200:
 *         description: CMV calculado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     openingStock:
 *                       type: number
 *                       description: Estoque inicial em R$
 *                     purchases:
 *                       type: number
 *                       description: Compras do período em R$
 *                     closingStock:
 *                       type: number
 *                       description: Estoque final em R$
 *                     cmv:
 *                       type: number
 *                       description: CMV calculado em R$
 *                     revenue:
 *                       type: number
 *                       description: Receita do período em R$
 *                     cmvPercentage:
 *                       type: number
 *                       description: CMV em percentual da receita
 *                     grossMargin:
 *                       type: number
 *                       description: Margem bruta em R$
 *                     grossMarginPercentage:
 *                       type: number
 *                       description: Margem bruta em percentual
 *       400:
 *         description: Período não tem conferência final
 *       404:
 *         description: Período não encontrado
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/calculate', authMiddleware.authenticate, controller.calculate);

/**
 * @swagger
 * /api/v1/cmv/periods/{id}/products:
 *   get:
 *     summary: Obter CMV por produto
 *     tags: [CMV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do período
 *     responses:
 *       200:
 *         description: CMV por produto calculado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       productName:
 *                         type: string
 *                       quantitySold:
 *                         type: number
 *                       revenue:
 *                         type: number
 *                       cost:
 *                         type: number
 *                       cmv:
 *                         type: number
 *                       margin:
 *                         type: number
 *                       marginPercentage:
 *                         type: number
 *                       theoreticalMarginPercentage:
 *                         type: number
 *                       marginDifference:
 *                         type: number
 *       404:
 *         description: Período não encontrado
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/products', authMiddleware.authenticate, controller.getProducts);

/**
 * @swagger
 * /api/v1/cmv/periods/{id}/purchases:
 *   get:
 *     summary: Obter histórico de compras do período
 *     tags: [CMV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do período
 *     responses:
 *       200:
 *         description: Histórico de compras
 *       404:
 *         description: Período não encontrado
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/purchases', authMiddleware.authenticate, controller.getPurchaseHistory);

/**
 * @swagger
 * /api/v1/cmv/periods/{id}/ranking:
 *   get:
 *     summary: Obter ranking de produtos por CMV
 *     tags: [CMV]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do período
 *     responses:
 *       200:
 *         description: Ranking de produtos
 *       404:
 *         description: Período não encontrado
 *       401:
 *         description: Não autenticado
 */
router.get('/:id/ranking', authMiddleware.authenticate, controller.getProductRanking);

export default router;
