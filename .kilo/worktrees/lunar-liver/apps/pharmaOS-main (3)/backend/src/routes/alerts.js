import { Router } from 'express'
import {
  getAlerts,
  runScan,
  markAlertRead,
  markAllAlertsRead,
} from '../controllers/alertController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all alert routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'PHARMACIST', 'RECEIVING_BAY', 'DISPATCH', 'MANAGER']))

router.get('/', getAlerts)
router.post('/run', runScan)
router.put('/:id/read', markAlertRead)
router.put('/read-all', markAllAlertsRead)

export default router
