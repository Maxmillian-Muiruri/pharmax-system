import { Router } from 'express'
import {
  getAllCustomers,
  getTopCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customerController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all customer routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'PHARMACIST', 'DISPATCH', 'RIDER']))

router.get('/', getAllCustomers)
router.get('/top', getTopCustomers)
router.get('/:id', getCustomer)
router.post('/', createCustomer)
router.put('/:id', updateCustomer)
router.delete('/:id', deleteCustomer)

export default router
