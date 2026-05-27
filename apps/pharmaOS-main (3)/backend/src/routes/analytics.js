import { Router } from 'express'
import {
  getSalesTrend,
  getTopProducts,
  getDashboard,
  getProfitLoss,
  getRevenue,
} from '../controllers/analyticsController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all analytics routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'FINANCE', 'MANAGER']))

router.get('/sales', getSalesTrend)
router.get('/top-products', getTopProducts)
router.get('/dashboard', getDashboard)
router.get('/profit-loss', getProfitLoss)
router.get('/revenue', getRevenue)

export default router
