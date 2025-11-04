import { Router } from 'express';
import { EstablishmentController } from '@/controllers/establishment.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { upload } from '@/config/upload';

const router = Router();
const establishmentController = new EstablishmentController();
const authMiddleware = new AuthMiddleware();

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/establishment:
 *   get:
 *     summary: Buscar dados do estabelecimento
 *     tags: [Establishment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do estabelecimento
 */
router.get('/', establishmentController.get);

/**
 * @swagger
 * /api/v1/establishment:
 *   put:
 *     summary: Atualizar dados do estabelecimento
 *     tags: [Establishment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               address:
 *                 type: object
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               taxSettings:
 *                 type: object
 *     responses:
 *       200:
 *         description: Estabelecimento atualizado
 */
router.put('/', authMiddleware.authorize('admin'), establishmentController.update);

/**
 * @swagger
 * /api/v1/establishment/logo:
 *   post:
 *     summary: Upload de logotipo do estabelecimento
 *     tags: [Establishment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo enviado com sucesso
 */
router.post(
  '/logo',
  authMiddleware.authorize('admin'),
  upload.single('logo'),
  establishmentController.uploadLogo
);

export default router;
