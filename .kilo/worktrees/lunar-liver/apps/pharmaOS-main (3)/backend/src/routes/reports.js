import { Router } from 'express'
import {
  getInventoryReportData,
  getExpiryReportData,
  getSalesReportData
} from '../controllers/reportController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all report routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'FINANCE', 'MANAGER']))

// Endpoints strictly returning rich arrays mapping to reporting structures
router.get('/inventory', getInventoryReportData)
router.get('/expiry', getExpiryReportData)
router.get('/sales', getSalesReportData)

export default router
