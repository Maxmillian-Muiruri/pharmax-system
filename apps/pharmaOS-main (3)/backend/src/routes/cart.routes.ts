import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCart,
  updateCart,
  clearCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart
} from '../controllers/cartController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// GET /api/cart - Get user's cart (Remote Sync)
router.get('/', getCart);

// PUT /api/cart - Update cart (Clear & Replace logic)
router.put('/', updateCart);

// DELETE /api/cart - Clear cart after successful checkout
router.delete('/', clearCart);

// POST /api/cart/add - Add single item to cart
router.post('/add', addToCart);

// PUT /api/cart/:itemId - Update single item quantity
router.put('/:itemId', updateCartItemQuantity);

// DELETE /api/cart/:itemId - Remove single item from cart
router.delete('/:itemId', removeFromCart);

export default router;
