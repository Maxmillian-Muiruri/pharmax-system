import { Router } from 'express'
import {
  getAllExpenses,
  getExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all expense routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'FINANCE']))

router.get('/', getAllExpenses)
router.get('/summary', getExpenseSummary)
router.post('/', createExpense)
router.put('/:id', updateExpense)
router.delete('/:id', deleteExpense)

export default router
