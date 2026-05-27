import prisma from '../lib/prisma.js'
import { sendSuccess } from '../utils/responseHelper.js'

export async function getInventoryReportData(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    })
    
    const formattedData = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category || 'Uncategorized',
      quantity: p.quantity,
      unitPrice: Number(p.unitPrice),
      totalValue: Number(p.unitPrice) * p.quantity,
      status: p.status,
    }))

    sendSuccess(res, 200, formattedData)
  } catch (error) {
    next(error)
  }
}

export async function getExpiryReportData(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: { in: ['expired', 'near_expiry'] }
      },
      orderBy: { expiryDate: 'asc' },
    })

    const formattedData = products.map(p => {
      const expiry = new Date(p.expiryDate)
      const now = new Date()
      const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

      return {
        id: p.id,
        name: p.name,
        supplier: p.supplier || 'N/A',
        quantity: p.quantity,
        expiryDate: expiry.toISOString().split('T')[0],
        daysToExpiry: daysLeft,
        status: p.status,
      }
    })

    sendSuccess(res, 200, formattedData)
  } catch (error) {
    next(error)
  }
}

export async function getSalesReportData(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true } }
      }
    })

    const formattedData = orders.map(o => ({
      orderId: o.id,
      date: o.createdAt.toISOString().split('T')[0],
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      product: o.product?.name || 'Unknown',
      quantity: o.quantity,
      totalAmount: Number(o.totalAmount),
      status: o.status,
    }))

    sendSuccess(res, 200, formattedData)
  } catch (error) {
    next(error)
  }
}
