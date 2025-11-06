import { Router } from 'express';
import { UploadController } from '@/controllers/upload.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { upload, logoUpload } from '@/config/upload';

const router = Router();
const uploadController = new UploadController();
const authMiddleware = new AuthMiddleware();

// All upload routes require authentication
router.use(authMiddleware.authenticate);

/**
 * @route   POST /api/v1/upload/image
 * @desc    Upload a single image
 * @access  Private
 */
router.post('/image', upload.single('image'), async (req, res, next) => {
  try {
    await uploadController.uploadImage(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/upload/logo
 * @desc    Upload a logo image
 * @access  Private
 */
router.post('/logo', logoUpload.single('logo'), async (req, res, next) => {
  try {
    await uploadController.uploadLogo(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
