import prisma from '../lib/prisma.js'
import { sendSuccess, sendError } from '../utils/responseHelper.js'
import { calculateProductStatus } from '../utils/dateUtils.js'
import { createAlertIfNotExists } from '../utils/alertManager.js'

/**
 * Valid order status transitions
 */
const VALID_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

/**
 * Check if status transition is valid
 */
function canTransition(currentStatus, nextStatus) {
  return VALID_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false
}

/**
 * Get all orders with optional filtering
 */
export async function getAllOrders(req, res, next) {
  try {
    const { status, search, sort = 'createdAt', order = 'desc' } = req.query

    const where = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.customerName = { contains: search, mode: 'insensitive' }
    }

    const validSorts = ['customerName', 'totalAmount', 'status', 'createdAt']
    const sortBy = validSorts.includes(sort) ? sort : 'createdAt'
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc'

    const orders = await prisma.order.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unitPrice: true,
          }
        }
      }
    })

    sendSuccess(res, 200, orders)
  } catch (error) {
    next(error)
  }
}

/**
 * Create a new order
 */
export async function createOrder(req, res, next) {
  try {
    const { customerName, customerPhone, productId, quantity } = req.body

    // Fetch product to get price and check stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return sendError(res, 404, 'Product not found', 'NOT_FOUND')
    }

    // Calculate total amount server-side
    const totalAmount = Number(product.unitPrice) * quantity

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        productId,
        quantity,
        totalAmount,
        status: 'pending',
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    sendSuccess(res, 201, order, 'Order created successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Update order
 */
export async function updateOrder(req, res, next) {
  try {
    const { id } = req.params
    const { customerName, customerPhone, productId, quantity } = req.body

    const existingOrder = await prisma.order.findUnique({
      where: { id }
    })

    if (!existingOrder) {
      return sendError(res, 404, 'Order not found', 'NOT_FOUND')
    }
    
    // Cannot structurally modify completed or cancelled orders
    if (existingOrder.status === 'completed' || existingOrder.status === 'cancelled') {
        return sendError(res, 400, 'Cannot edit finalized orders', 'FINALIZED')
    }

    // Fetch product to get updated price
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return sendError(res, 404, 'Product not found', 'NOT_FOUND')
    }

    const totalAmount = Number(product.unitPrice) * quantity

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        customerName,
        customerPhone,
        productId,
        quantity,
        totalAmount,
      },
      include: {
        product: { select: { id: true, name: true } }
      }
    })

    sendSuccess(res, 200, updatedOrder, 'Order updated successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status: newStatus } = req.body

    // Fetch current order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true }
    })

    if (!order) {
      return sendError(res, 404, 'Order not found', 'NOT_FOUND')
    }

    // Validate transition
    if (!canTransition(order.status, newStatus)) {
      return sendError(res, 400, `Cannot transition from ${order.status} to ${newStatus}`, 'INVALID_TRANSITION')
    }

    // Handle completion with atomic transaction
    if (newStatus === 'completed') {
      await completeOrder(id, order)
    } else if (newStatus === 'cancelled') {
      await prisma.order.update({
        where: { id },
        data: { status: 'cancelled' }
      })
    } else {
      // Just update status for pending -> processing
      await prisma.order.update({
        where: { id },
        data: { status: newStatus }
      })
    }

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    sendSuccess(res, 200, updatedOrder, 'Order status updated successfully')
  } catch (error) {
    if (error.message === 'INSUFFICIENT_STOCK') {
      return sendError(res, 409, 'Insufficient stock. Update inventory first.', 'INSUFFICIENT_STOCK')
    }
    next(error)
  }
}

/**
 * Complete order with atomic DB transaction
 */
async function completeOrder(orderId, order) {
  return await prisma.$transaction(async (tx) => {
    // Re-validate stock (race condition protection)
    const currentProduct = await tx.product.findUnique({
      where: { id: order.productId }
    })

    if (currentProduct.quantity < order.quantity) {
      throw new Error('INSUFFICIENT_STOCK')
    }

    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'completed' },
    })

    // Decrement product quantity and recalculate status
    const newQty = currentProduct.quantity - order.quantity
    const newStatus = calculateProductStatus(newQty, currentProduct.expiryDate)
    
    await tx.product.update({
      where: { id: order.productId },
      data: { 
        quantity: newQty, 
        status: newStatus 
      },
    })

    // Create immutable transaction record
    await tx.transaction.create({
      data: {
        orderId: order.id,
        productId: order.productId,
        type: 'sale',
        quantity: order.quantity,
        amount: order.totalAmount,
      },
    })

    // Create low_stock alert if threshold crossed
    const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD) || 10
    if (newQty < threshold) {
      await createAlertIfNotExists(
        tx, 
        order.productId, 
        'low_stock', 
        `${currentProduct.name} is running low (${newQty} units remaining)`
      )
    }
  })
}
