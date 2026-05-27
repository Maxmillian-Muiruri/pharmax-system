import cron from 'node-cron'
import prisma from '../lib/prisma.js'
import { calculateProductStatus } from '../utils/dateUtils.js'
import { createAlertIfNotExists } from '../utils/alertManager.js'

/**
 * Start the expiry scanner cron job (runs daily at midnight)
 */
export function startExpiryScanner() {
  cron.schedule('0 0 * * *', async () => {
    const now = new Date()
    console.log(`[EXPIRY SCAN] Starting: ${now.toISOString()}`)
    
    let expired = 0
    let nearExpiry = 0
    let alertsCreated = 0

    try {
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
    } catch (error) {
      console.error('[EXPIRY SCAN] Error:', error.message)
    }
  })

  console.log('[EXPIRY SCAN] Scheduler started - runs daily at midnight')
}
