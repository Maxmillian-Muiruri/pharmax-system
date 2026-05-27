import { Router } from 'express'
import {
  getAllSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all supplier routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'MANAGER', 'RECEIVING_BAY']))

router.get('/', getAllSuppliers)
router.get('/:id', getSupplier)
router.post('/', createSupplier)
router.put('/:id', updateSupplier)
router.delete('/:id', deleteSupplier)

export default router
