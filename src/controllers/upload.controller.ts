import { Request, Response } from 'express';
import { ValidationError } from '@/utils/errors';

export class UploadController {
  /**
   * Upload a single image file
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new ValidationError('Nenhum arquivo foi enviado', {
        file: ['Arquivo é obrigatório'],
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  }

  /**
   * Upload a logo image
   */
  async uploadLogo(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new ValidationError('Nenhum arquivo foi enviado', {
        file: ['Arquivo é obrigatório'],
      });
    }

    const logoUrl = `/uploads/logos/${req.file.filename}`;

    res.status(200).json({
      success: true,
      data: {
        url: logoUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  }
}
