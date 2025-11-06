import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registro de novo estabelecimento e usuário administrador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - establishment
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phone:
 *                 type: string
 *               establishment:
 *                 type: object
 *                 required:
 *                   - name
 *                   - cnpj
 *                   - address
 *                   - phone
 *                   - email
 *                   - taxSettings
 *                 properties:
 *                   name:
 *                     type: string
 *                   cnpj:
 *                     type: string
 *                   address:
 *                     type: object
 *                   phone:
 *                     type: string
 *                   email:
 *                     type: string
 *                   taxSettings:
 *                     type: object
 *     responses:
 *       201:
 *         description: Cadastro realizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Email ou CNPJ já cadastrado
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', authController.login);

export default router;
