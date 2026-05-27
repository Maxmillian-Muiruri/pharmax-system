import { Router } from 'express'
import {
  getAllPurchases,
  getPurchaseSummary,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from '../controllers/purchaseController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all purchase routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'FINANCE', 'RECEIVING_BAY']))

router.get('/', getAllPurchases)
router.get('/summary', getPurchaseSummary)
router.get('/:id', getPurchase)
router.post('/', createPurchase)
router.put('/:id', updatePurchase)
router.delete('/:id', deletePurchase)

export default router
