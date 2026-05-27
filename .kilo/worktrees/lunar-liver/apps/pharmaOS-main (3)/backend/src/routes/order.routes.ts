import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createOrder,
  getOrders,
  getOrderById,
  trackOrder,
  updateOrderStatus
} from '../controllers/orderController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /api/orders - Create new order (Final Checkout)
router.post('/', createOrder);

// GET /api/orders - Get user's orders (Orders List)
router.get('/', getOrders);

// GET /api/orders/:id - Get specific order details (Order Details)
router.get('/:id', getOrderById);

// GET /api/orders/track/:id - Track order by orderNumber or id (Live Tracking)
router.get('/track/:id', trackOrder);

// PUT /api/orders/:id/status - Update order status (for admin use)
router.put('/:id/status', updateOrderStatus);

export default router;
