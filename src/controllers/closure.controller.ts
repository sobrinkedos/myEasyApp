import { Request, Response } from 'express';
import { closureHistoryService } from '@/services/closure-history.service';
import { exportService } from '@/services/export.service';
import { closureDocumentRepository } from '@/repositories/closure-document.repository';
import { listClosuresQuerySchema, exportClosuresQuerySchema } from '@/models/closure-document.schemas';
import { logger } from '@/utils/logger';
import * as fs from 'fs';

export class ClosureController {
  async listClosures(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const query = listClosuresQuerySchema.parse(req.query);

      // Parse dates if provided
      const filters: any = {
        page: query.page,
        limit: query.limit,
      };

      if (query.startDate) {
        filters.startDate = new Date(query.startDate);
      }

      if (query.endDate) {
        filters.endDate = new Date(query.endDate);
      }

      if (query.operatorId) {
        filters.operatorId = query.operatorId;
      }

      if (query.cashRegisterId) {
        filters.cashRegisterId = query.cashRegisterId;
      }

      if (query.status) {
        filters.status = query.status;
      }

      const result = await closureHistoryService.listClosures(filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        statistics: result.statistics,
      });
    } catch (error: any) {
      logger.error('Error listing closures:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao listar fechamentos',
      });
    }
  }

  async getClosureDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const details = await closureHistoryService.getClosureDetails(id);

      res.json({
        success: true,
        data: details,
      });
    } catch (error: any) {
      logger.error('Error getting closure details:', error);
      console.error('Full error:', error);
      
      if (error.message === 'Cash session not found') {
        res.status(404).json({
          success: false,
          message: 'Sessão de caixa não encontrada',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar detalhes do fechamento',
      });
    }
  }

  async exportClosures(req: Request, res: Response): Promise<void> {
    try {
      // Validate query parameters
      const query = exportClosuresQuerySchema.parse(req.query);

      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);

      const result = await exportService.exportClosures(query.format, startDate, endDate);

      // Set response headers
      res.setHeader('Content-Type', result.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.buffer.length);

      res.send(result.buffer);
    } catch (error: any) {
      logger.error('Error exporting closures:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao exportar fechamentos',
      });
    }
  }

  async generateDocument(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      const { documentGeneratorService } = await import('@/services/document-generator.service');
      const result = await documentGeneratorService.generateClosureDocument(sessionId, userId);

      res.json({
        success: true,
        data: result,
        message: 'Documento gerado com sucesso',
      });
    } catch (error: any) {
      logger.error('Error generating document:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao gerar documento',
      });
    }
  }

  async downloadDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const document = await closureDocumentRepository.findById(id);
      if (!document) {
        res.status(404).json({
          success: false,
          message: 'Documento não encontrado',
        });
        return;
      }

      // Check if file exists
      if (!fs.existsSync(document.pdfUrl)) {
        res.status(404).json({
          success: false,
          message: 'Arquivo do documento não encontrado',
        });
        return;
      }

      // Increment download count
      await closureDocumentRepository.incrementDownloadCount(id);

      // Determine content type based on file extension
      const isHtml = document.pdfUrl.endsWith('.html');
      const contentType = isHtml ? 'text/html' : 'application/pdf';
      const extension = isHtml ? 'html' : 'pdf';

      // Set response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="fechamento-${document.documentNumber}.${extension}"`
      );

      // Stream file to response
      const fileStream = fs.createReadStream(document.pdfUrl);
      fileStream.pipe(res);
    } catch (error: any) {
      logger.error('Error downloading document:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao baixar documento',
      });
    }
  }

  async getDocument(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const document = await closureDocumentRepository.findById(id);
      if (!document) {
        res.status(404).json({
          success: false,
          message: 'Documento não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          id: document.id,
          documentNumber: document.documentNumber,
          cashSessionId: document.cashSessionId,
          generatedAt: document.generatedAt,
          generatedBy: document.generatedBy,
          hash: document.hash,
          downloadCount: document.downloadCount,
          lastDownloadAt: document.lastDownloadAt,
          metadata: document.metadata,
        },
      });
    } catch (error: any) {
      logger.error('Error getting document:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar documento',
      });
    }
  }
}

export const closureController = new ClosureController();
