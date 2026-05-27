import { Router } from 'express'
import {
  uploadPrescription,
  getUserPrescriptions,
  getPrescription,
  updatePrescriptionStatus,
} from '../controllers/prescriptionController.js'
import { roleGuard } from '../middleware/roleGuard.js'
import { validate } from '../middleware/validate.js'
import { prescriptionSchema } from '../middleware/schemas.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Customer can upload and view their prescriptions
router.use(authenticate)
router.use(roleGuard(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']))

router.post('/', validate(prescriptionSchema), uploadPrescription)
router.get('/', getUserPrescriptions)
router.get('/:id', getPrescription)

// Admin can update prescription status
router.put('/:id/status', roleGuard(['ADMIN', 'SUPER_ADMIN']), updatePrescriptionStatus)

export default router