/**
 * Role-based access control middleware
 * Usage: roleGuard(['ADMIN', 'SUPER_ADMIN'])
 */

export function roleGuard(allowedRoles) {
  return (req, res, next) => {
    // Extract user role from req.user (set by authenticate middleware)
    const userRole = req.user?.userType

    if (!userRole) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      })
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this resource',
        code: 'FORBIDDEN',
        required: allowedRoles,
        current: userRole,
      })
    }

    // User has required role, proceed
    next()
  }
}
