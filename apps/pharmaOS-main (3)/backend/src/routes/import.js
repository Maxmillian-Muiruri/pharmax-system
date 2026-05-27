import { Router } from 'express'
import { upload, importProducts } from '../controllers/importController.js'
import { roleGuard } from '../middleware/roleGuard.js'

const router = Router()

// Apply role guard to import routes
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'RECEIVING_BAY']))

router.post('/products', upload.single('file'), importProducts)

export default router
