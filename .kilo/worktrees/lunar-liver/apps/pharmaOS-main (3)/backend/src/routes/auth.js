import { Router } from 'express'
import { login, logout, getMe, refreshToken, register, updateProfile } from '../controllers/auth.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refreshToken)

// Protected routes (require valid JWT)
router.get('/me', authenticate, getMe)
router.post('/logout', authenticate, logout)
router.put('/profile', authenticate, updateProfile)

export default router
