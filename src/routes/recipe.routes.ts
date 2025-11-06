import { Router } from 'express';
import { RecipeController } from '@/controllers/recipe.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new RecipeController();

// All routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/recipes:
 *   get:
 *     summary: Listar todas as receitas
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou descrição
 *     responses:
 *       200:
 *         description: Lista de receitas
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/v1/recipes/{id}:
 *   get:
 *     summary: Buscar receita por ID
 *     tags: [Recipes]
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
 *         description: Detalhes da receita
 *       404:
 *         description: Receita não encontrada
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/v1/recipes:
 *   post:
 *     summary: Criar nova receita
 *     tags: [Recipes]
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
 *               - category
 *               - yield
 *               - yieldUnit
 *               - ingredients
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               yield:
 *                 type: number
 *               yieldUnit:
 *                 type: string
 *               preparationTime:
 *                 type: integer
 *               instructions:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ingredientId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unit:
 *                       type: string
 *                     notes:
 *                       type: string
 *     responses:
 *       201:
 *         description: Receita criada com sucesso
 */
router.post('/', controller.create);

/**
 * @swagger
 * /api/v1/recipes/{id}:
 *   put:
 *     summary: Atualizar receita
 *     tags: [Recipes]
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
 *         description: Receita atualizada com sucesso
 */
router.put('/:id', controller.update);

/**
 * @swagger
 * /api/v1/recipes/{id}:
 *   delete:
 *     summary: Excluir receita
 *     tags: [Recipes]
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
 *         description: Receita excluída com sucesso
 */
router.delete('/:id', controller.delete);

/**
 * @swagger
 * /api/v1/recipes/{id}/calculate-cost:
 *   post:
 *     summary: Calcular custo da receita
 *     tags: [Recipes]
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
 *         description: Custo calculado com sucesso
 */
router.post('/:id/calculate-cost', controller.calculateCost);

/**
 * @swagger
 * /api/v1/recipes/{id}/ingredients:
 *   post:
 *     summary: Adicionar ingrediente à receita
 *     tags: [Recipes]
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
 *         description: Ingrediente adicionado com sucesso
 */
router.post('/:id/ingredients', controller.addIngredient);

/**
 * @swagger
 * /api/v1/recipes/{id}/ingredients/{ingredientId}:
 *   put:
 *     summary: Atualizar ingrediente da receita
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: ingredientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ingrediente atualizado com sucesso
 */
router.put('/:id/ingredients/:ingredientId', controller.updateIngredient);

/**
 * @swagger
 * /api/v1/recipes/{id}/ingredients/{ingredientId}:
 *   delete:
 *     summary: Remover ingrediente da receita
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: ingredientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ingrediente removido com sucesso
 */
router.delete('/:id/ingredients/:ingredientId', controller.removeIngredient);

/**
 * @swagger
 * /api/v1/recipes/{id}/duplicate:
 *   post:
 *     summary: Duplicar receita
 *     tags: [Recipes]
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Receita duplicada com sucesso
 */
router.post('/:id/duplicate', controller.duplicate);

export default router;
