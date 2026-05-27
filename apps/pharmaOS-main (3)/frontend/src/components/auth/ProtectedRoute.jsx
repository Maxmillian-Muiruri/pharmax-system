// Phase 3 - Route Protection
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'
import { ROLE_DASHBOARD_ROUTES } from '../../config/permissions'

export default function ProtectedRoute({ children, requiredPermission }) {
  const { isAuthenticated, loading } = useAuth()
  const { hasPermission } = usePermissions()
  const { user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login page, but save current location they were
    // trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Phase 3 addition: Check permissions if requiredPermission is provided
  if (requiredPermission !== undefined && !hasPermission(requiredPermission)) {
    // Redirect to user's role dashboard or unauthorized page
    const redirectPath = ROLE_DASHBOARD_ROUTES[user.userType] || '/'
    return <Navigate to={redirectPath} replace />
  }

  return children
}

// TODO: Phase 4