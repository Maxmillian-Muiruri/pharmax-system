import 'dotenv/config'
import app from './src/app.js'
import { startExpiryScanner } from './src/jobs/expiryScanner.js'

const PORT = process.env.PORT || 3000

const server = app.listen(PORT, () => {
  console.log(`🚀 PharmaOS API running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

// Start expiry scanner cron job
startExpiryScanner()

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

