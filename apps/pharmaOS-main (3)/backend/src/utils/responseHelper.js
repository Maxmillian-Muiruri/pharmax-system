/**
 * Send success response
 */
export function sendSuccess(res, statusCode, data, message) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  })
}

/**
 * Send error response
 */
export function sendError(res, statusCode, error, code) {
  return res.status(statusCode).json({
    success: false,
    error,
    code,
  })
}
