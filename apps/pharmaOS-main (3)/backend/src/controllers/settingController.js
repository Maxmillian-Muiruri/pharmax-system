import prisma from '../lib/prisma.js'
import { sendSuccess } from '../utils/responseHelper.js'

/**
 * Get all settings
 */
export async function getAllSettings(req, res, next) {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' },
    })

    // Return as key-value object for easier frontend consumption
    const result = {}
    for (const s of settings) {
      result[s.key] = s.value
    }

    sendSuccess(res, 200, result)
  } catch (error) {
    next(error)
  }
}

/**
 * Get single setting by key
 */
export async function getSetting(req, res, next) {
  try {
    const { key } = req.params
    const setting = await prisma.setting.findUnique({ where: { key } })

    if (!setting) {
      return res.status(404).json({ success: false, error: 'Setting not found', code: 'NOT_FOUND' })
    }

    sendSuccess(res, 200, setting)
  } catch (error) {
    next(error)
  }
}

/**
 * Update single setting
 */
export async function updateSetting(req, res, next) {
  try {
    const { key } = req.params
    const { value } = req.body

    const setting = await prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    })

    sendSuccess(res, 200, setting, 'Setting updated successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Bulk update settings
 */
export async function updateBulkSettings(req, res, next) {
  try {
    const updates = req.body // { key1: value1, key2: value2, ... }

    const results = await Promise.all(
      Object.entries(updates).map(async ([key, value]) => {
        return prisma.setting.upsert({
          where: { key },
          create: { key, value: String(value) },
          update: { value: String(value) },
        })
      })
    )

    const result = {}
    for (const s of results) {
      result[s.key] = s.value
    }

    sendSuccess(res, 200, result, 'Settings updated successfully')
  } catch (error) {
    next(error)
  }
}
