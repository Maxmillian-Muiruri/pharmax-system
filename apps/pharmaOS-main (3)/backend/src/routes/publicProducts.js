import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { sendSuccess, sendError } from '../utils/responseHelper.js'

const router = Router()

/**
 * GET /api/public/products
 * Public product listing - no authentication required
 */
router.get('/', async (req, res) => {
  try {
    const { search, category, inStock } = req.query
    console.log('Public products query:', { search, category, inStock })

    const where = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }
    if (category) {
      where.category = category
    }
    if (inStock === 'true') {
      where.quantity = { gt: 0 }
    }

    console.log('Where clause:', where)

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        unitPrice: true,
        expiryDate: true,
        status: true,
        _count: {
          select: { orders: true }
        }
      }
    })

    console.log(`Found ${products.length} products`)
    sendSuccess(res, 200, products)
  } catch (error) {
    console.error('Public products error:', error)
    sendError(res, 500, error.message, 'SERVER_ERROR')
  }
})

/**
 * GET /api/public/products/:id
 * Get single product - no authentication required
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        category: true,
        quantity: true,
        unitPrice: true,
        expiryDate: true,
        status: true,
        barcode: true,
        batchNumber: true,
        generic: true,
        minimumStock: true,
        purchasePrice: true,
      }
    })

    if (!product) {
      return sendError(res, 404, 'Product not found', 'NOT_FOUND')
    }

    sendSuccess(res, 200, product)
  } catch (error) {
    sendError(res, 500, error.message, 'SERVER_ERROR')
  }
})

export default router