import { Router } from 'express'
import {
  getAllTransactions,
  getTransactionSummary,
} from '../controllers/transactionController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all transaction routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'FINANCE', 'MANAGER', 'PHARMACIST']))

router.get('/', getAllTransactions)
router.get('/summary', getTransactionSummary)

export default router
