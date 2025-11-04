import { Request, Response, NextFunction } from 'express';
import { StockReportService } from '@/services/stock-report.service';
import { ValidationError } from '@/utils/errors';

export class StockReportController {
  private service: StockReportService;

  constructor() {
    this.service = new StockReportService();
  }

  getCurrentStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await this.service.getCurrentStockReport();

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  getLowStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await this.service.getLowStockReport();

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  getMovementReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      if (!startDate || !endDate) {
        throw new ValidationError('Datas são obrigatórias', {
          startDate: !startDate ? ['Data inicial é obrigatória'] : [],
          endDate: !endDate ? ['Data final é obrigatória'] : [],
        });
      }

      const report = await this.service.getMovementReport(
        new Date(startDate),
        new Date(endDate)
      );

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  getStockValue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await this.service.getStockValue();

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };

  exportCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await this.service.getCurrentStockReport();

      // Generate CSV
      const headers = ['ID', 'Nome', 'Unidade', 'Quantidade Atual', 'Quantidade Mínima', 'Custo Médio', 'Status'];
      const rows = report.map((ing) => [
        ing.id,
        ing.name,
        ing.unit,
        ing.currentQuantity.toString(),
        ing.minimumQuantity.toString(),
        ing.averageCost.toString(),
        ing.status,
      ]);

      const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=stock-report.csv');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  };
}
