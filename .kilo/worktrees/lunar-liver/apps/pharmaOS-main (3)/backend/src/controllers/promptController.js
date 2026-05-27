import prisma from '../lib/prisma.js'
import { sendSuccess, sendError } from '../utils/responseHelper.js'
import { calculateProductStatus } from '../utils/dateUtils.js'
import { createAlertIfNotExists } from '../utils/alertManager.js'

const KEYWORD_MAP = [
  {
    patterns: ['expired drugs', 'expired products', 'expired items', 'expired'],
    action: 'GET_PRODUCTS',
    params: { status: 'expired' },
    label: 'Expired Products',
  },
  {
    patterns: ['near expiry', 'expiring soon', 'almost expired', 'expiring'],
    action: 'GET_PRODUCTS',
    params: { status: 'near_expiry' },
    label: 'Near-Expiry Products',
  },
  {
    patterns: ['low stock', 'running low', 'restock', 'low inventory'],
    action: 'GET_LOW_STOCK',
    params: {},
    label: 'Low Stock Products',
  },
  {
    patterns: ['pending orders', 'new orders', 'orders waiting'],
    action: 'GET_ORDERS',
    params: { status: 'pending' },
    label: 'Pending Orders',
  },
  {
    patterns: ["today's sales", 'today sales', 'sales today', 'revenue today', 'daily revenue'],
    action: 'GET_SUMMARY',
    params: { period: 'today' },
    label: "Today's Sales",
  },
  {
    patterns: ['top products', 'best sellers', 'most sold', 'popular'],
    action: 'GET_TOP_PRODUCTS',
    params: { metric: 'units', period: 'month' },
    label: 'Top Selling Products',
  },
]

/**
 * Resolve natural language prompt to database query
 */
export async function resolvePrompt(req, res, next) {
  try {
    const { query } = req.body
    const normalized = query.toLowerCase().trim()

    const match = KEYWORD_MAP.find(k =>
      k.patterns.some(p => normalized.includes(p))
    )

    if (!match) {
      return sendSuccess(res, 200, {
        success: false,
        suggestions: [
          'show expired drugs',
          'low stock',
          'pending orders',
          "today's sales",
          'near expiry',
          'top products'
        ]
      })
    }

    let result

    switch (match.action) {
      case 'GET_PRODUCTS':
        result = await prisma.product.findMany({
          where: { status: match.params.status },
          take: 10,
        })
        break

      case 'GET_LOW_STOCK':
        const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD) || 10
        result = await prisma.product.findMany({
          where: { 
            quantity: { lt: threshold },
            status: { not: 'expired' }
          },
          take: 10,
        })
        break

      case 'GET_ORDERS':
        result = await prisma.order.findMany({
          where: { status: match.params.status },
          take: 10,
          include: {
            product: {
              select: { name: true }
            }
          }
        })
        break

      case 'GET_SUMMARY':
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const summary = await prisma.transaction.aggregate({
          where: {
            type: 'sale',
            createdAt: { gte: todayStart }
          },
          _sum: { amount: true },
          _count: true
        })
        result = {
          total: Number(summary._sum.amount) || 0,
          count: summary._count
        }
        break

      case 'GET_TOP_PRODUCTS':
        const transactions = await prisma.transaction.findMany({
          where: {
            type: 'sale',
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          },
          include: {
            product: { select: { id: true, name: true } }
          }
        })

        const productStats = {}
        transactions.forEach(tx => {
          const id = tx.product.id
          if (!productStats[id]) {
            productStats[id] = {
              id,
              name: tx.product.name,
              units: 0,
            }
          }
          productStats[id].units += tx.quantity
        })

        result = Object.values(productStats)
          .sort((a, b) => b.units - a.units)
          .slice(0, 5)
        break

      default:
        return sendError(res, 400, 'Unknown action', 'UNKNOWN_ACTION')
    }

    sendSuccess(res, 200, {
      success: true,
      label: match.label,
      type: match.action.toLowerCase(),
      results: result,
      count: Array.isArray(result) ? result.length : 1
    })
  } catch (error) {
    next(error)
  }
}
