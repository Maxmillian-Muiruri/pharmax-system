import prisma from '../lib/prisma.js'
import { sendSuccess, sendError } from '../utils/responseHelper.js'

/**
 * Get user's cart items
 */
export async function getCart(req, res, next) {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unitPrice: true,
            quantity: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedItems = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
    }))

    sendSuccess(res, 200, formattedItems)
  } catch (error) {
    next(error)
  }
}

/**
 * Update user's cart (clear and replace)
 */
export async function updateCart(req, res, next) {
  try {
    const { items } = req.body

    if (!Array.isArray(items)) {
      return sendError(res, 400, 'Items must be an array', 'VALIDATION_ERROR')
    }

    // Clear existing cart
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id },
    })

    // Create new cart items
    const cartItems = await Promise.all(
      items.map(async item => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })

        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        return prisma.cartItem.create({
          data: {
            userId: req.user.id,
            productId: item.productId,
            quantity: item.quantity || 1,
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unitPrice: true,
                quantity: true,
                status: true,
              },
            },
          },
        })
      }),
    )

    sendSuccess(res, 200, cartItems, 'Cart updated successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Clear user's cart
 */
export async function clearCart(req, res, next) {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id },
    })

    sendSuccess(res, 200, [], 'Cart cleared successfully')
  } catch (error) {
    next(error)
  }
}