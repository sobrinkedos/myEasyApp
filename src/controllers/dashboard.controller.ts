/**
 * Dashboard Controller
 * Controller para endpoints do dashboard
 */

import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '@/services/dashboard.service';
import { ValidationError } from '@/utils/errors';

export class DashboardController {
  private service: DashboardService;

  constructor() {
    this.service = new DashboardService();
  }

  /**
   * GET /api/v1/dashboard/metrics
   * Obter métricas principais do dashboard
   */
  getMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const metrics = await this.service.getMetrics(establishmentId);

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/dashboard/sales-chart
   * Obter dados de vendas para gráfico
   */
  getSalesChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const data = await this.service.getSalesChartData(establishmentId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/dashboard/category-sales
   * Obter vendas por categoria
   */
  getCategorySales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const data = await this.service.getCategorySales(establishmentId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/dashboard/payment-methods
   * Obter dados de métodos de pagamento
   */
  getPaymentMethods = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const data = await this.service.getPaymentMethodsData(establishmentId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/dashboard/recent-activities
   * Obter atividades recentes
   */
  getRecentActivities = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const establishmentId = (req as any).user?.establishmentId;

      if (!establishmentId) {
        throw new ValidationError('Estabelecimento não identificado');
      }

      const data = await this.service.getRecentActivities(establishmentId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };
}
