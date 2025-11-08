import { Router } from 'express';
import { CashSessionController } from '@/controllers/cash-session.controller';
import { CashTransactionController } from '@/controllers/cash-transaction.controller';
import { CashTreasuryController } from '@/controllers/cash-treasury.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { requireCashOperator, requireSupervisor, requireTreasurer } from '@/middlewares/cash-auth.middleware';

const router = Router();
const sessionController = new CashSessionController();
const transactionController = new CashTransactionController();
const treasuryController = new CashTreasuryController();
const authMiddleware = new AuthMiddleware();

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

// ============================================
// Cash Session Routes
// ============================================

/**
 * @swagger
 * /api/v1/cash/registers:
 *   get:
 *     summary: Listar caixas disponíveis
 *     tags: [Cash Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de caixas
 */
router.get('/registers', sessionController.getCashRegisters);

/**
 * @swagger
 * /api/v1/cash/sessions:
 *   post:
 *     summary: Abrir sessão de caixa
 *     tags: [Cash Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cashRegisterId
 *               - openingAmount
 *             properties:
 *               cashRegisterId:
 *                 type: string
 *               openingAmount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Caixa aberto com sucesso
 */
router.post('/sessions', sessionController.openSession);

/**
 * @swagger
 * /api/v1/cash/sessions/active:
 *   get:
 *     summary: Buscar sessão ativa do operador
 *     tags: [Cash Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessão ativa encontrada
 */
router.get('/sessions/active', sessionController.getActiveSession);

/**
 * @swagger
 * /api/v1/cash/sessions:
 *   get:
 *     summary: Listar sessões de caixa
 *     tags: [Cash Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: operatorId
 *         schema:
 *           type: string
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
 *         description: Lista de sessões
 */
router.get('/sessions', sessionController.listSessions);

/**
 * @swagger
 * /api/v1/cash/sessions/{id}:
 *   get:
 *     summary: Buscar sessão por ID
 *     tags: [Cash Management]
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
 *         description: Sessão encontrada
 */
router.get('/sessions/:id', sessionController.getSessionById);

/**
 * @swagger
 * /api/v1/cash/sessions/{id}/close:
 *   post:
 *     summary: Fechar sessão de caixa
 *     tags: [Cash Management]
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
 *               - countedAmount
 *               - counts
 *             properties:
 *               countedAmount:
 *                 type: number
 *               counts:
 *                 type: array
 *                 items:
 *                   type: object
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Caixa fechado com sucesso
 */
router.post('/sessions/:id/close', sessionController.closeSession);

/**
 * @swagger
 * /api/v1/cash/sessions/{id}/reopen:
 *   post:
 *     summary: Reabrir sessão de caixa (supervisor)
 *     tags: [Cash Management]
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Caixa reaberto com sucesso
 */
router.post('/sessions/:id/reopen', requireSupervisor, sessionController.reopenSession);

// ============================================
// Transaction Routes
// ============================================

/**
 * @swagger
 * /api/v1/cash/sessions/{id}/withdrawals:
 *   post:
 *     summary: Registrar sangria
 *     tags: [Cash Management]
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
 *               - amount
 *               - reason
 *             properties:
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *               authorizedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Sangria registrada
 */
router.post('/sessions/:id/withdrawals', transactionController.recordWithdrawal);

/**
 * @swagger
 * /api/v1/cash/sessions/{id}/supplies:
 *   post:
 *     summary: Registrar suprimento
 *     tags: [Cash Management]
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
 *               - amount
 *               - reason
 *             properties:
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *               authorizedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: Suprimento registrado
 */
router.post('/sessions/:id/supplies', transactionController.recordSupply);

/**
 * @swagger
 * /api/v1/cash/sessions/{id}/transactions:
 *   get:
 *     summary: Listar transações da sessão
 *     tags: [Cash Management]
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
 *         description: Lista de transações
 */
router.get('/sessions/:id/transactions', transactionController.getSessionTransactions);

/**
 * @swagger
 * /api/v1/cash/sessions/{id}/balance:
 *   get:
 *     summary: Obter saldo da sessão
 *     tags: [Cash Management]
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
 *         description: Saldo da sessão
 */
router.get('/sessions/:id/balance', transactionController.getSessionBalance);

/**
 * @swagger
 * /api/v1/cash/transactions/{id}/cancel:
 *   post:
 *     summary: Cancelar transação (supervisor)
 *     tags: [Cash Management]
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transação cancelada
 */
router.post('/transactions/:id/cancel', requireSupervisor, transactionController.cancelTransaction);

// ============================================
// Treasury Routes
// ============================================

/**
 * @swagger
 * /api/v1/cash/sessions/{id}/transfer:
 *   post:
 *     summary: Transferir para tesouraria
 *     tags: [Cash Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transferência realizada
 */
router.post('/sessions/:id/transfer', treasuryController.transferToTreasury);

/**
 * @swagger
 * /api/v1/treasury/transfers/pending:
 *   get:
 *     summary: Listar transferências pendentes
 *     tags: [Cash Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transferências pendentes
 */
router.get('/treasury/transfers/pending', requireTreasurer, treasuryController.listPendingTransfers);

/**
 * @swagger
 * /api/v1/treasury/transfers/{id}/confirm:
 *   post:
 *     summary: Confirmar recebimento
 *     tags: [Cash Management]
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
 *               - receivedAmount
 *             properties:
 *               receivedAmount:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recebimento confirmado
 */
router.post('/treasury/transfers/:id/confirm', requireTreasurer, treasuryController.confirmReceipt);

/**
 * @swagger
 * /api/v1/treasury/consolidation/daily:
 *   get:
 *     summary: Obter consolidação diária
 *     tags: [Cash Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Consolidação diária
 */
router.get('/treasury/consolidation/daily', requireTreasurer, treasuryController.getDailyConsolidation);

export default router;
