import { Router } from 'express'
import {
  getAllSettings,
  getSetting,
  updateSetting,
  updateBulkSettings,
} from '../controllers/settingController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to all settings routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN']))

router.get('/', getAllSettings)
// Specific routes MUST come before parameterized routes to avoid matching /bulk as :key
router.put('/bulk', updateBulkSettings)
router.get('/:key', getSetting)
router.put('/:key', updateSetting)

export default router
