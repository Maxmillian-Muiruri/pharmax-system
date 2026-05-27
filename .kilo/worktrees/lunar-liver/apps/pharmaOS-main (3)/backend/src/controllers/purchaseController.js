import prisma from '../lib/prisma.js'
import { sendSuccess } from '../utils/responseHelper.js'

/**
 * Get all purchases with pagination and filtering
 */
export async function getAllPurchases(req, res, next) {
  try {
    const { supplierId, from, to, page = 1, limit = 25 } = req.query

    const where = {}
    const skip = (parseInt(page) - 1) * parseInt(limit)

    if (supplierId) {
      where.supplierId = supplierId
    }
    if (from || to) {
      where.purchaseDate = {}
      if (from) where.purchaseDate.gte = new Date(from)
      if (to) where.purchaseDate.lte = new Date(to)
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { purchaseDate: 'desc' },
        include: {
          supplier: { select: { id: true, name: true } },
          items: {
            include: {
              product: { select: { id: true, name: true } }
            }
          }
        }
      }),
      prisma.purchase.count({ where })
    ])

    sendSuccess(res, 200, {
      purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get purchase summary (total by period)
 */
export async function getPurchaseSummary(req, res, next) {
  try {
    const now = new Date()
    const monthStart = new Date(now)
    monthStart.setDate(now.getDate() - 30)
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)

    const [monthResult, weekResult] = await Promise.all([
      prisma.purchase.aggregate({
        where: { purchaseDate: { gte: monthStart } },
        _sum: { totalAmount: true },
        _count: true
      }),
      prisma.purchase.aggregate({
        where: { purchaseDate: { gte: weekStart } },
        _sum: { totalAmount: true },
        _count: true
      })
    ])

    sendSuccess(res, 200, {
      month: Number(monthResult._sum.totalAmount) || 0,
      week: Number(weekResult._sum.totalAmount) || 0,
      monthCount: monthResult._count,
      weekCount: weekResult._count
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get single purchase
 */
export async function getPurchase(req, res, next) {
  try {
    const { id } = req.params
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: { select: { id: true, name: true } }
          }
        }
      }
    })

    if (!purchase) {
      return res.status(404).json({ success: false, error: 'Purchase not found', code: 'NOT_FOUND' })
    }

    sendSuccess(res, 200, purchase)
  } catch (error) {
    next(error)
  }
}

/**
 * Create purchase (with items — auto-restocks products)
 */
export async function createPurchase(req, res, next) {
  try {
    const { supplierId, invoiceNo, purchaseDate, totalAmount, notes, items } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Purchase must include at least one item', code: 'VALIDATION_ERROR' })
    }

    const purchase = await prisma.$transaction(async (tx) => {
      // Create purchase
      const newPurchase = await tx.purchase.create({
        data: {
          supplierId,
          invoiceNo: invoiceNo || null,
          purchaseDate: new Date(purchaseDate),
          totalAmount,
          notes: notes || null,
        }
      })

      // Create items and restock products
      for (const item of items) {
        await tx.purchaseItem.create({
          data: {
            purchaseId: newPurchase.id,
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            total: item.quantity * item.unitCost,
          }
        })

        // Increment product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: { increment: item.quantity },
          }
        })

        // Create restock transaction
        await tx.transaction.create({
          data: {
            productId: item.productId,
            type: 'restock',
            quantity: item.quantity,
            amount: item.quantity * item.unitCost,
            notes: `Restocked from purchase ${invoiceNo || newPurchase.id}`,
          }
        })
      }

      return tx.purchase.findUnique({
        where: { id: newPurchase.id },
        include: {
          supplier: { select: { id: true, name: true } },
          items: { include: { product: { select: { id: true, name: true } } } }
        }
      })
    })

    sendSuccess(res, 201, purchase, `Purchase created: ${items.length} item(s) restocked`)
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Referenced product or supplier not found', code: 'NOT_FOUND' })
    }
    next(error)
  }
}

/**
 * Update purchase
 */
export async function updatePurchase(req, res, next) {
  try {
    const { id } = req.params
    const { invoiceNo, purchaseDate, totalAmount, notes } = req.body

    const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        ...(invoiceNo !== undefined && { invoiceNo }),
        ...(purchaseDate !== undefined && { purchaseDate: new Date(purchaseDate) }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(notes !== undefined && { notes }),
      }
    })

    sendSuccess(res, 200, purchase, 'Purchase updated successfully')
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Purchase not found', code: 'NOT_FOUND' })
    }
    next(error)
  }
}

/**
 * Delete purchase
 */
export async function deletePurchase(req, res, next) {
  try {
    const { id } = req.params

    // Note: This does NOT reverse the stock changes — that would require
    // complex undo logic. In production, consider a soft-delete or reversal flow.
    await prisma.purchaseItem.deleteMany({ where: { purchaseId: id } })
    await prisma.purchase.delete({ where: { id } })

    sendSuccess(res, 200, null, 'Purchase deleted successfully')
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Purchase not found', code: 'NOT_FOUND' })
    }
    next(error)
  }
}
