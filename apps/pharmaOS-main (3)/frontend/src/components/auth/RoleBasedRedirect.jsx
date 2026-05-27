// Phase 3 - Route Protection
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLE_DASHBOARD_ROUTES } from '../../config/permissions'
import { ROUTES } from '../../config/routes'

export default function RoleBasedRedirect() {
  const { user, isAuthenticated } = useAuth()

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // If authenticated, redirect to role-specific dashboard
  const dashboardRoute = ROLE_DASHBOARD_ROUTES[user.userType]
  if (dashboardRoute) {
    return <Navigate to={dashboardRoute} replace />
  }

  // Fallback to default dashboard if role not found
  return <Navigate to={ROUTES.DASHBOARD} replace />
}

// TODO: Phase 4