import prisma from '../lib/prisma.js'
import { sendSuccess } from '../utils/responseHelper.js'
import { calculateProductStatus } from '../utils/dateUtils.js'
import { createAlertIfNotExists } from '../utils/alertManager.js'

/**
 * Get alerts with filtering
 */
export async function getAlerts(req, res, next) {
  try {
    const { type, is_read, limit = 50 } = req.query

    const where = {}

    if (type) {
      where.type = type
    }

    if (is_read !== undefined) {
      where.isRead = is_read === 'true'
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { triggeredAt: 'desc' },
      take: parseInt(limit),
      include: {
        product: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    sendSuccess(res, 200, alerts)
  } catch (error) {
    next(error)
  }
}

/**
 * Run expiry scan manually
 */
export async function runScan(req, res, next) {
  try {
    const now = new Date()
    console.log(`[EXPIRY SCAN] Starting: ${now.toISOString()}`)
    
    let expired = 0
    let nearExpiry = 0
    let alertsCreated = 0

    const products = await prisma.product.findMany()

    for (const product of products) {
      const newStatus = calculateProductStatus(product.quantity, product.expiryDate)

      if (newStatus !== product.status) {
        await prisma.product.update({
          where: { id: product.id },
          data: { status: newStatus },
        })
      }

      if (newStatus === 'expired') {
        expired++
        const alert = await createAlertIfNotExists(
          prisma, 
          product.id, 
          'expired', 
          `${product.name} has expired`
        )
        if (alert) alertsCreated++
      } else if (newStatus === 'near_expiry') {
        nearExpiry++
        const daysLeft = Math.ceil(
          (new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        )
        const alert = await createAlertIfNotExists(
          prisma, 
          product.id, 
          'near_expiry', 
          `${product.name} expires in ${daysLeft} days`
        )
        if (alert) alertsCreated++
      }
    }

    console.log(`[EXPIRY SCAN] Done: expired=${expired}, nearExpiry=${nearExpiry}, alertsCreated=${alertsCreated}`)

    sendSuccess(res, 200, {
      expired,
      nearExpiry,
      alertsCreated,
      message: `Scan complete: ${expired} expired, ${nearExpiry} near expiry, ${alertsCreated} alerts created`
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Mark single alert as read
 */
export async function markAlertRead(req, res, next) {
  try {
    const { id } = req.params

    await prisma.alert.update({
      where: { id },
      data: { isRead: true }
    })

    sendSuccess(res, 200, null, 'Alert marked as read')
  } catch (error) {
    next(error)
  }
}

/**
 * Mark all alerts as read
 */
export async function markAllAlertsRead(req, res, next) {
  try {
    await prisma.alert.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    })

    sendSuccess(res, 200, null, 'All alerts marked as read')
  } catch (error) {
    next(error)
  }
}
