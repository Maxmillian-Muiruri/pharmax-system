import { Router } from 'express'
import {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  updateOrder
} from '../controllers/orderController.js'
import { validate } from '../middleware/validate.js'
import { createOrderSchema, updateOrderStatusSchema } from '../middleware/schemas.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all order routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'PHARMACIST', 'MANAGER', 'DISPATCH', 'RIDER']))

router.get('/', getAllOrders)
router.post('/', validate(createOrderSchema), createOrder)
router.put('/:id', validate(createOrderSchema), updateOrder)
router.put('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus)

export default router
