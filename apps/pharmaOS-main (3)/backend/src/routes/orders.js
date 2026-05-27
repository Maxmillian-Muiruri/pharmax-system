import { Router } from 'express'
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrder,
} from '../controllers/orderController.js'
import { validate } from '../middleware/validate.js'
import { createOrderSchema, updateOrderStatusSchema } from '../middleware/schemas.js'
import { roleGuard } from '../middleware/roleGuard.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Customer can create orders and view their own orders
router.post('/', validate(createOrderSchema), createOrder)
router.get('/', getAllOrders)  // getAllOrders handles ?mine=true filtering
router.get('/:id', getOrderById)

// Staff-only routes (order management, status updates, edits)
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'PHARMACIST', 'MANAGER', 'DISPATCH', 'RIDER']))

router.put('/:id', validate(createOrderSchema), updateOrder)
router.put('/:id/status', validate(updateOrderStatusSchema), updateOrderStatus)

export default router
