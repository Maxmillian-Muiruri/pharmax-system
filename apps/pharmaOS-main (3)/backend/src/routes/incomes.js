import { Router } from 'express'
import {
  getAllIncomes,
  getIncomeSummary,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../controllers/incomeController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all income routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'FINANCE']))

router.get('/', getAllIncomes)
router.get('/summary', getIncomeSummary)
router.post('/', createIncome)
router.put('/:id', updateIncome)
router.delete('/:id', deleteIncome)

export default router
