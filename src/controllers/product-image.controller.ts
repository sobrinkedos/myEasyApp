import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/product.service';
import { ValidationError } from '@/utils/errors';

export class ProductImageController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        throw new ValidationError('Nenhum arquivo foi enviado', {
          file: ['Arquivo é obrigatório'],
        });
      }

      // Update product with image URL
      const imageUrl = `/uploads/${req.file.filename}`;
      const product = await this.productService.update(id, { imageUrl });

      res.status(200).json({
        success: true,
        data: {
          imageUrl: product.imageUrl,
        },
        message: 'Imagem enviada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
