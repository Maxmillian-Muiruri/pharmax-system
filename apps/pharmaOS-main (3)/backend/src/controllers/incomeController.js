import prisma from '../lib/prisma.js'
import { sendSuccess } from '../utils/responseHelper.js'

/**
 * Get all incomes with filtering
 */
export async function getAllIncomes(req, res, next) {
  try {
    const { category, from, to, status, page = 1, limit = 25 } = req.query

    const where = {}
    const skip = (parseInt(page) - 1) * parseInt(limit)

    if (category) where.category = category
    if (status) where.status = status
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to) where.date.lte = new Date(to)
    }

    const [incomes, total] = await Promise.all([
      prisma.income.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' },
      }),
      prisma.income.count({ where })
    ])

    sendSuccess(res, 200, {
      incomes,
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
 * Get income summary by period
 */
export async function getIncomeSummary(req, res, next) {
  try {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)
    const monthStart = new Date(now)
    monthStart.setDate(now.getDate() - 30)

    const [todayResult, weekResult, monthResult, totalResult] = await Promise.all([
      prisma.income.aggregate({ where: { date: { gte: todayStart } }, _sum: { amount: true }, _count: true }),
      prisma.income.aggregate({ where: { date: { gte: weekStart } }, _sum: { amount: true }, _count: true }),
      prisma.income.aggregate({ where: { date: { gte: monthStart } }, _sum: { amount: true }, _count: true }),
      prisma.income.aggregate({ _sum: { amount: true }, _count: true }),
    ])

    sendSuccess(res, 200, {
      today: Number(todayResult._sum.amount) || 0,
      week: Number(weekResult._sum.amount) || 0,
      month: Number(monthResult._sum.amount) || 0,
      total: Number(totalResult._sum.amount) || 0,
      totalCount: totalResult._count,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Create income
 */
export async function createIncome(req, res, next) {
  try {
    const { category, amount, date, notes, status } = req.body

    const income = await prisma.income.create({
      data: {
        category,
        amount,
        date: new Date(date),
        notes: notes || null,
        status: status || 'completed',
      }
    })

    sendSuccess(res, 201, income, 'Income recorded successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Update income
 */
export async function updateIncome(req, res, next) {
  try {
    const { id } = req.params
    const { category, amount, date, notes, status } = req.body

    const income = await prisma.income.update({
      where: { id },
      data: {
        ...(category !== undefined && { category }),
        ...(amount !== undefined && { amount }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
        ...(status !== undefined && { status }),
      }
    })

    sendSuccess(res, 200, income, 'Income updated successfully')
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Income record not found', code: 'NOT_FOUND' })
    }
    next(error)
  }
}

/**
 * Delete income
 */
export async function deleteIncome(req, res, next) {
  try {
    const { id } = req.params
    await prisma.income.delete({ where: { id } })
    sendSuccess(res, 200, null, 'Income deleted successfully')
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Income record not found', code: 'NOT_FOUND' })
    }
    next(error)
  }
}
