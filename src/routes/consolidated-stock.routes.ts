import { Router } from 'express';
import { ConsolidatedStockController } from '@/controllers/consolidated-stock.controller';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();
const controller = new ConsolidatedStockController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/stock/consolidated
 * @desc    Get all stock items (ingredients + stock items)
 * @query   type - Filter by type: 'ingredient', 'stock_item', or 'all' (default: 'all')
 * @query   status - Filter by status: 'normal', 'baixo', 'vencendo', etc.
 * @query   category - Filter by category (stock items only)
 * @query   search - Search by name, barcode, or SKU
 * @access  Private
 */
router.get('/', controller.getAll);

/**
 * @route   GET /api/v1/stock/consolidated/value
 * @desc    Get total stock value at a specific date
 * @query   date - Date in ISO format (required)
 * @access  Private
 */
router.get('/value', controller.getValueAtDate);

/**
 * @route   GET /api/v1/stock/consolidated/purchases
 * @desc    Get purchases value for a period
 * @query   startDate - Start date in ISO format (required)
 * @query   endDate - End date in ISO format (required)
 * @access  Private
 */
router.get('/purchases', controller.getPurchases);

/**
 * @route   GET /api/v1/stock/consolidated/low-stock
 * @desc    Get low stock items (both ingredients and stock items)
 * @access  Private
 */
router.get('/low-stock', controller.getLowStock);

/**
 * @route   GET /api/v1/stock/consolidated/expiring
 * @desc    Get expiring items (both ingredients and stock items)
 * @access  Private
 */
router.get('/expiring', controller.getExpiring);

/**
 * @route   GET /api/v1/stock/consolidated/search/:code
 * @desc    Search item by barcode or SKU
 * @param   code - Barcode or SKU to search
 * @access  Private
 */
router.get('/search/:code', controller.searchByCode);

export default router;
