import prisma from '../lib/prisma.js'
import { sendSuccess } from '../utils/responseHelper.js'

/**
 * Get sales trend data
 */
export async function getSalesTrend(req, res, next) {
  try {
    const { period = 7 } = req.query
    const days = parseInt(period)

    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Get all sales in period
    const transactions = await prisma.transaction.findMany({
      where: {
        type: 'sale',
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        amount: true,
        createdAt: true,
      }
    })

    // Group by date
    const dailyData = {}
    
    // Initialize all days in period
    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      dailyData[dateKey] = 0
    }

    // Sum amounts per day
    transactions.forEach(tx => {
      const dateKey = tx.createdAt.toISOString().split('T')[0]
      dailyData[dateKey] += Number(tx.amount)
    })

    // Convert to array for chart
    const result = Object.entries(dailyData).map(([date, amount]) => ({
      date,
      amount,
      formattedDate: new Date(date).toLocaleDateString('en-KE', { 
        month: 'short', 
        day: 'numeric' 
      })
    }))

    const total = result.reduce((sum, d) => sum + d.amount, 0)

    sendSuccess(res, 200, {
      data: result,
      total,
      period: days
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get dashboard KPI summary
 */
export async function getDashboard(req, res, next) {
  try {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const [
      totalCustomers,
      totalSuppliers,
      products,
      todaySales,
      todayPurchases,
      todayExpenses,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.supplier.count(),
      prisma.product.findMany({
        select: {
          quantity: true,
          status: true,
          unitPrice: true,
          purchasePrice: true,
        }
      }),
      prisma.transaction.aggregate({
        where: { type: 'sale', createdAt: { gte: todayStart } },
        _sum: { amount: true },
      }),
      prisma.purchase.aggregate({
        where: { purchaseDate: { gte: todayStart } },
        _sum: { totalAmount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: todayStart } },
        _sum: { amount: true },
      }),
    ])

    const stockMedicine = products.reduce((sum, p) => sum + p.quantity, 0)
    const expiredCount = products.filter(p => p.status === 'expired').length
    const stockValue = products.reduce((sum, p) => sum + Number(p.unitPrice) * p.quantity, 0)

    sendSuccess(res, 200, {
      totalCustomers,
      totalSuppliers,
      stockMedicine,
      stockValue,
      expiredCount,
      todaySales: Number(todaySales._sum.amount) || 0,
      todayPurchases: Number(todayPurchases._sum.totalAmount) || 0,
      todayExpenses: Number(todayExpenses._sum.amount) || 0,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get monthly profit/loss data
 */
export async function getProfitLoss(req, res, next) {
  try {
    const { months = 6 } = req.query
    const now = new Date()

    const monthLabels = []
    const profitLossData = []

    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const [salesResult, purchasesResult, expensesResult] = await Promise.all([
        prisma.transaction.aggregate({
          where: { type: 'sale', createdAt: { gte: monthStart, lte: monthEnd } },
          _sum: { amount: true },
        }),
        prisma.purchase.aggregate({
          where: { purchaseDate: { gte: monthStart, lte: monthEnd } },
          _sum: { totalAmount: true },
        }),
        prisma.expense.aggregate({
          where: { date: { gte: monthStart, lte: monthEnd } },
          _sum: { amount: true },
        }),
      ])

      const revenue = Number(salesResult._sum.amount) || 0
      const purchases = Number(purchasesResult._sum.totalAmount) || 0
      const expenses = Number(expensesResult._sum.amount) || 0
      const cost = purchases + expenses
      const profit = revenue - cost

      const label = monthStart.toLocaleDateString('en-KE', { month: 'short' })
      monthLabels.push(label)
      profitLossData.push({
        month: label,
        revenue,
        cost,
        profit,
      })
    }

    sendSuccess(res, 200, profitLossData)
  } catch (error) {
    next(error)
  }
}

/**
 * Get revenue breakdown (sales vs income vs expenses)
 */
export async function getRevenue(req, res, next) {
  try {
    const { period = 30 } = req.query
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - parseInt(period))

    const [salesResult, incomeResult, expenseResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: 'sale', createdAt: { gte: startDate } },
        _sum: { amount: true },
      }),
      prisma.income.aggregate({
        where: { date: { gte: startDate } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: startDate } },
        _sum: { amount: true },
      }),
    ])

    const sales = Number(salesResult._sum.amount) || 0
    const income = Number(incomeResult._sum.amount) || 0
    const expenses = Number(expenseResult._sum.amount) || 0

    sendSuccess(res, 200, {
      sales,
      income,
      expenses,
      net: sales + income - expenses,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get top products by units or revenue
 */
export async function getTopProducts(req, res, next) {
  try {
    const { metric = 'units', period = 'week' } = req.query

    const now = new Date()
    let startDate = null

    if (period === 'week') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30)
    }
    // 'all' means no date filter

    const where = { type: 'sale' }
    if (startDate) {
      where.createdAt = { gte: startDate }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    // Aggregate by product
    const productStats = {}

    transactions.forEach(tx => {
      const productId = tx.product.id
      const productName = tx.product.name

      if (!productStats[productId]) {
        productStats[productId] = {
          id: productId,
          name: productName,
          units: 0,
          revenue: 0,
        }
      }

      productStats[productId].units += tx.quantity
      productStats[productId].revenue += Number(tx.amount)
    })

    // Convert to array and sort
    let result = Object.values(productStats)

    if (metric === 'revenue') {
      result.sort((a, b) => b.revenue - a.revenue)
    } else {
      result.sort((a, b) => b.units - a.units)
    }

    // Return top 5
    result = result.slice(0, 5)

    sendSuccess(res, 200, {
      data: result,
      metric,
      period,
    })
  } catch (error) {
    next(error)
  }
}
