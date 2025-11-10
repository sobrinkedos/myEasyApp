import { Request, Response } from 'express';
import { ConsolidatedStockService } from '@/services/consolidated-stock.service';
import { AuthRequest } from '@/middlewares/auth.middleware';

export class ConsolidatedStockController {
  private service: ConsolidatedStockService;

  constructor() {
    this.service = new ConsolidatedStockService();
  }

  /**
   * GET /api/v1/stock/consolidated
   * Get all stock items (ingredients + stock items)
   */
  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { type, status, category, search } = req.query;

      const result = await this.service.getAll(establishmentId, {
        type: type as 'ingredient' | 'stock_item' | 'all' | undefined,
        status: status as string | undefined,
        category: category as string | undefined,
        search: search as string | undefined,
      });

      res.json(result);
    } catch (error) {
      console.error('Error getting consolidated stock:', error);
      res.status(500).json({ error: 'Failed to get consolidated stock' });
    }
  };

  /**
   * GET /api/v1/stock/consolidated/value
   * Get total stock value at a specific date
   */
  getValueAtDate = async (req: AuthRequest, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
      }

      const targetDate = new Date(date as string);
      const result = await this.service.getStockValueAtDate(establishmentId, targetDate);

      res.json(result);
    } catch (error) {
      console.error('Error getting stock value:', error);
      res.status(500).json({ error: 'Failed to get stock value' });
    }
  };

  /**
   * GET /api/v1/stock/consolidated/purchases
   * Get purchases value for a period
   */
  getPurchases = async (req: AuthRequest, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate parameters are required' });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const result = await this.service.getPurchasesInPeriod(establishmentId, start, end);

      res.json(result);
    } catch (error) {
      console.error('Error getting purchases:', error);
      res.status(500).json({ error: 'Failed to get purchases' });
    }
  };

  /**
   * GET /api/v1/stock/consolidated/low-stock
   * Get low stock items
   */
  getLowStock = async (req: AuthRequest, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const items = await this.service.getLowStockItems(establishmentId);

      res.json({ items, count: items.length });
    } catch (error) {
      console.error('Error getting low stock items:', error);
      res.status(500).json({ error: 'Failed to get low stock items' });
    }
  };

  /**
   * GET /api/v1/stock/consolidated/expiring
   * Get expiring items
   */
  getExpiring = async (req: AuthRequest, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const items = await this.service.getExpiringItems(establishmentId);

      res.json({ items, count: items.length });
    } catch (error) {
      console.error('Error getting expiring items:', error);
      res.status(500).json({ error: 'Failed to get expiring items' });
    }
  };

  /**
   * GET /api/v1/stock/consolidated/search/:code
   * Search item by barcode or SKU
   */
  searchByCode = async (req: AuthRequest, res: Response) => {
    try {
      const { establishmentId } = req.user!;
      const { code } = req.params;

      const item = await this.service.searchByCode(establishmentId, code);

      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }

      res.json(item);
    } catch (error) {
      console.error('Error searching item:', error);
      res.status(500).json({ error: 'Failed to search item' });
    }
  };
}
