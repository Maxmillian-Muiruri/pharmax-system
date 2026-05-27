import prisma from '../lib/prisma.js'
import { sendSuccess, sendError } from '../utils/responseHelper.js'
import { calculateProductStatus } from '../utils/dateUtils.js'
import { createAlertIfNotExists } from '../utils/alertManager.js'

/**
 * Get all products with optional filtering
 */
export async function getAllProducts(req, res, next) {
  try {
    const { status, search, sort = 'createdAt', order = 'desc' } = req.query

    const where = {}

    // Filter by status
    if (status) {
      where.status = status
    }

    // Search by name
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    // Validate sort field
    const validSorts = ['name', 'quantity', 'unitPrice', 'expiryDate', 'status', 'createdAt']
    const sortBy = validSorts.includes(sort) ? sort : 'createdAt'
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc'

    const products = await prisma.product.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    })

    sendSuccess(res, 200, products)
  } catch (error) {
    next(error)
  }
}

/**
 * Create a new product
 */
export async function createProduct(req, res, next) {
  try {
    const { name, category, quantity, unitPrice, expiryDate, supplier } = req.body

    // Calculate initial status
    const status = calculateProductStatus(quantity, expiryDate)

    const product = await prisma.product.create({
      data: {
        name,
        category,
        quantity,
        unitPrice,
        expiryDate: new Date(expiryDate),
        supplier,
        status,
      },
    })

    // Create alert if product is expired or near expiry
    if (status === 'expired') {
      await createAlertIfNotExists(prisma, product.id, 'expired', `${name} has expired`)
    } else if (status === 'near_expiry') {
      const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      await createAlertIfNotExists(prisma, product.id, 'near_expiry', `${name} expires in ${daysLeft} days`)
    }

    sendSuccess(res, 201, product, 'Product created successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Update a product
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    // Convert expiryDate to Date if provided
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate)
    }

    // Recalculate status if quantity or expiryDate changed
    if (updateData.quantity !== undefined || updateData.expiryDate !== undefined) {
      const product = await prisma.product.findUnique({ where: { id } })
      if (!product) {
        return sendError(res, 404, 'Product not found', 'NOT_FOUND')
      }

      const newQuantity = updateData.quantity ?? product.quantity
      const newExpiryDate = updateData.expiryDate ?? product.expiryDate
      updateData.status = calculateProductStatus(newQuantity, newExpiryDate)

      // Create alerts if needed
      if (updateData.status === 'expired' && product.status !== 'expired') {
        await createAlertIfNotExists(prisma, id, 'expired', `${product.name} has expired`)
      } else if (updateData.status === 'near_expiry' && product.status !== 'near_expiry') {
        const daysLeft = Math.ceil((new Date(newExpiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        await createAlertIfNotExists(prisma, id, 'near_expiry', `${product.name} expires in ${daysLeft} days`)
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    sendSuccess(res, 200, product, 'Product updated successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params

    // Check for existing orders
    const orderCount = await prisma.order.count({
      where: { productId: id }
    })

    if (orderCount > 0) {
      return sendError(res, 409, 'Cannot delete product with existing orders', 'HAS_ORDERS')
    }

    await prisma.product.delete({
      where: { id },
    })

    sendSuccess(res, 200, null, 'Product deleted successfully')
  } catch (error) {
    next(error)
  }
}
