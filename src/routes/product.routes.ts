import { Router } from 'express';
import { ProductController } from '@/controllers/product.controller';
import { ProductImageController } from '@/controllers/product-image.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { upload } from '@/config/upload';

const router = Router();
const productController = new ProductController();
const productImageController = new ProductImageController();
const authMiddleware = new AuthMiddleware();

// Apply authentication to all routes
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Listar produtos com paginação
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Lista de produtos
 */
router.get('/', productController.getAll);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Buscar produto por ID
 *     tags: [Products]
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
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', productController.getById);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Criar novo produto
 *     tags: [Products]
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
 *               - price
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Produto criado
 */
router.post('/', productController.create);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
 *     summary: Atualizar produto
 *     tags: [Products]
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
 *         description: Produto atualizado
 */
router.put('/:id', productController.update);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Remover produto
 *     tags: [Products]
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
 *         description: Produto removido
 */
router.delete('/:id', productController.delete);

/**
 * @swagger
 * /api/v1/products/{id}/image:
 *   post:
 *     summary: Upload de imagem do produto
 *     tags: [Products]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagem enviada com sucesso
 */
router.post(
  '/:id/image',
  authMiddleware.authorize('admin'),
  upload.single('image'),
  productImageController.uploadImage
);

export default router;
