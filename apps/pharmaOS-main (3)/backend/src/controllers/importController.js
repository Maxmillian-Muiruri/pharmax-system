import multer from 'multer'
import csvParser from 'csv-parser'
import { Readable } from 'stream'
import prisma from '../lib/prisma.js'
import { sendSuccess, sendError } from '../utils/responseHelper.js'
import { calculateProductStatus } from '../utils/dateUtils.js'
import { createAlertIfNotExists } from '../utils/alertManager.js'

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed'), false)
    }
  }
})

/**
 * Import products from CSV
 */
export async function importProducts(req, res, next) {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded', 'NO_FILE')
    }

    const results = []
    const errors = []
    const skipped = []

    // Parse CSV from buffer
    const bufferStream = Readable.from(req.file.buffer.toString())

    await new Promise((resolve, reject) => {
      bufferStream
        .pipe(csvParser())
        .on('data', (row) => {
          results.push(row)
        })
        .on('end', resolve)
        .on('error', reject)
    })

    // Validate and import each row
    const imported = []
    const now = new Date()

    for (let i = 0; i < results.length; i++) {
      const row = results[i]
      const rowNum = i + 2 // Account for header and 0-index

      try {
        // Validate required fields
        if (!row.name || !row.quantity || !row.unitPrice || !row.expiryDate) {
          errors.push({
            row: rowNum,
            error: 'Missing required fields (name, quantity, unitPrice, expiryDate)'
          })
          continue
        }

        // Validate quantity is a number
        const quantity = parseInt(row.quantity)
        if (isNaN(quantity) || quantity < 0) {
          errors.push({
            row: rowNum,
            error: 'Invalid quantity value'
          })
          continue
        }

        // Validate unitPrice is a number
        const unitPrice = parseFloat(row.unitPrice)
        if (isNaN(unitPrice) || unitPrice < 0) {
          errors.push({
            row: rowNum,
            error: 'Invalid unitPrice value'
          })
          continue
        }

        // Validate date format
        const expiryDate = new Date(row.expiryDate)
        if (isNaN(expiryDate.getTime())) {
          errors.push({
            row: rowNum,
            error: 'Invalid expiryDate format (use YYYY-MM-DD)'
          })
          continue
        }

        // Check for duplicate (case-insensitive)
        const existing = await prisma.product.findFirst({
          where: {
            name: {
              equals: row.name.trim(),
              mode: 'insensitive'
            }
          }
        })

        if (existing) {
          skipped.push({
            row: rowNum,
            name: row.name,
            reason: 'Product with this name already exists'
          })
          continue
        }

        // Calculate status
        const status = calculateProductStatus(quantity, expiryDate)

        // Create product
        const product = await prisma.product.create({
          data: {
            name: row.name.trim(),
            category: row.category || null,
            quantity,
            unitPrice,
            expiryDate,
            supplier: row.supplier || null,
            status,
          }
        })

        imported.push(product)

        // Create alerts if needed
        if (status === 'expired') {
          await createAlertIfNotExists(prisma, product.id, 'expired', `${product.name} has expired`)
        } else if (status === 'near_expiry') {
          const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
          await createAlertIfNotExists(prisma, product.id, 'near_expiry', `${product.name} expires in ${daysLeft} days`)
        }

      } catch (err) {
        errors.push({
          row: rowNum,
          error: err.message
        })
      }
    }

    sendSuccess(res, 200, {
      imported: imported.length,
      skipped: skipped.length,
      errors: errors.length,
      details: { imported, skipped, errors }
    }, `Import complete: ${imported.length} products added`)

  } catch (error) {
    next(error)
  }
}

export { upload }
