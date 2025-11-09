/**
 * Dashboard Routes
 * Rotas para endpoints do dashboard
 */

import { Router } from 'express';
import { DashboardController } from '@/controllers/dashboard.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new DashboardController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Endpoints para métricas e dados do dashboard
 */

/**
 * @swagger
 * /api/v1/dashboard/metrics:
 *   get:
 *     summary: Obter métricas principais do dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtidas com sucesso
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
 *                     sales:
 *                       type: object
 *                       properties:
 *                         today:
 *                           type: number
 *                         yesterday:
 *                           type: number
 *                         changePercentage:
 *                           type: number
 *                     orders:
 *                       type: object
 *                       properties:
 *                         active:
 *                           type: number
 *                         yesterday:
 *                           type: number
 *                         changePercentage:
 *                           type: number
 *                     tables:
 *                       type: object
 *                       properties:
 *                         occupied:
 *                           type: number
 *                         total:
 *                           type: number
 *                         changePercentage:
 *                           type: number
 *                     averageTicket:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: number
 *                         yesterday:
 *                           type: number
 *                         changePercentage:
 *                           type: number
 */
router.get('/metrics', authMiddleware.authenticate, controller.getMetrics);

/**
 * @swagger
 * /api/v1/dashboard/sales-chart:
 *   get:
 *     summary: Obter dados de vendas para gráfico (últimos 7 dias)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 */
router.get('/sales-chart', authMiddleware.authenticate, controller.getSalesChart);

/**
 * @swagger
 * /api/v1/dashboard/category-sales:
 *   get:
 *     summary: Obter vendas por categoria
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 */
router.get('/category-sales', authMiddleware.authenticate, controller.getCategorySales);

/**
 * @swagger
 * /api/v1/dashboard/payment-methods:
 *   get:
 *     summary: Obter dados de métodos de pagamento
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 */
router.get('/payment-methods', authMiddleware.authenticate, controller.getPaymentMethods);

/**
 * @swagger
 * /api/v1/dashboard/recent-activities:
 *   get:
 *     summary: Obter atividades recentes
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 */
router.get('/recent-activities', authMiddleware.authenticate, controller.getRecentActivities);

export default router;
