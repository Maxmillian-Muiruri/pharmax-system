import { Router } from 'express'
import { getCart, updateCart, clearCart } from '../controllers/cartController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Customer cart operations
router.use(roleGuard(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']))

router.get('/', getCart)
router.put('/', updateCart)
router.delete('/', clearCart)

export default router