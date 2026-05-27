import { Router } from 'express'
import { trackOrder } from '../controllers/orderController.js'

const router = Router()

// Public order tracking (no authentication required)
router.get('/:identifier', trackOrder)

export default router