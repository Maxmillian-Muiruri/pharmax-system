import { Router } from 'express'
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { validate } from '../middleware/validate.js'
import { createProductSchema, updateProductSchema } from '../middleware/schemas.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all product routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'PHARMACIST', 'MANAGER', 'RECEIVING_BAY']))

router.get('/', getAllProducts)
router.post('/', roleGuard(['ADMIN', 'SUPER_ADMIN']), validate(createProductSchema), createProduct)
router.put('/:id', roleGuard(['ADMIN', 'SUPER_ADMIN']), validate(updateProductSchema), updateProduct)
router.delete('/:id', roleGuard(['ADMIN', 'SUPER_ADMIN']), deleteProduct)

export default router
