import prisma from '../lib/prisma.js'
import { sendSuccess } from '../utils/responseHelper.js'

/**
 * Get all transactions with pagination and filtering
 */
export async function getAllTransactions(req, res, next) {
  try {
    const { type, from, to, page = 1, limit = 25 } = req.query

    const where = {}
    const skip = (parseInt(page) - 1) * parseInt(limit)

    if (type) {
      where.type = type
    }

    if (from || to) {
      where.createdAt = {}
      if (from) where.createdAt.gte = new Date(from)
      if (to) where.createdAt.lte = new Date(to)
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              id: true,
              name: true,
            }
          },
          order: {
            select: {
              id: true,
              customerName: true,
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ])

    sendSuccess(res, 200, {
      transactions,
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
 * Get transaction summary (today, week, month)
 */
export async function getTransactionSummary(req, res, next) {
  try {
    const now = new Date()
    
    // Today's start
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    // Week start (7 days ago)
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)

    // Month start (30 days ago)
    const monthStart = new Date(now)
    monthStart.setDate(now.getDate() - 30)

    const [todayResult, weekResult, monthResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: 'sale',
          createdAt: { gte: todayStart }
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: {
          type: 'sale',
          createdAt: { gte: weekStart }
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: {
          type: 'sale',
          createdAt: { gte: monthStart }
        },
        _sum: { amount: true },
        _count: true
      })
    ])

    sendSuccess(res, 200, {
      today: Number(todayResult._sum.amount) || 0,
      week: Number(weekResult._sum.amount) || 0,
      month: Number(monthResult._sum.amount) || 0,
      totalTransactions: monthResult._count
    })
  } catch (error) {
    next(error)
  }
}
