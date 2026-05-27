/**
 * Custom application error with status code and error code
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'SERVER_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)

  // Operational / known errors (AppError instances)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    })
  }

  // Prisma known errors
  if (err.code === 'P2025') {
    return res.status(404).json({ 
      success: false, 
      error: 'Resource not found', 
      code: 'NOT_FOUND' 
    })
  }
  
  if (err.code === 'P2002') {
    return res.status(409).json({ 
      success: false, 
      error: 'Duplicate entry', 
      code: 'DUPLICATE' 
    })
  }

  // Business logic errors (legacy string throws)
  if (err.message === 'INSUFFICIENT_STOCK') {
    return res.status(409).json({ 
      success: false, 
      error: 'Insufficient stock. Update inventory first.', 
      code: 'INSUFFICIENT_STOCK' 
    })
  }
  
  if (err.message === 'INVALID_TRANSITION') {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid order status transition', 
      code: 'INVALID_TRANSITION' 
    })
  }

  // Never expose stack traces in production
  const isDev = process.env.NODE_ENV === 'development'
  res.status(500).json({
    success: false,
    error: isDev ? err.message : 'Internal server error',
    code: 'SERVER_ERROR',
    ...(isDev && { stack: err.stack }),
  })
}

