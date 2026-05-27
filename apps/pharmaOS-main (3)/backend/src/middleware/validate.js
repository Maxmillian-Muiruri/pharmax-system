import { z } from 'zod'

/**
 * Factory function to create validation middleware
 * @param {ZodSchema} schema - Zod schema to validate against
 * @param {'body'|'query'|'params'} target - What to validate
 */
export function validate(schema, target = 'body') {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req[target])
      req[target] = validatedData
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: messages,
        })
      }
      next(error)
    }
  }
}
