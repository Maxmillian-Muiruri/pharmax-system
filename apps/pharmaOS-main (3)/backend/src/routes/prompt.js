import { Router } from 'express'
import { resolvePrompt } from '../controllers/promptController.js'
import { validate } from '../middleware/validate.js'
import { promptSchema } from '../middleware/schemas.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to prompt routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN']))

router.post('/', validate(promptSchema), resolvePrompt)

export default router
