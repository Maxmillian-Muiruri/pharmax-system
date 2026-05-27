// Phase 3 - Route Protection
import { Navigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { useAuth } from '../../context/AuthContext'
import { ROLE_DASHBOARD_ROUTES } from '../../config/permissions'

export default function PermissionGuard({ requiredPermission, children, redirectTo }) {
  const { hasPermission } = usePermissions()
  const { user } = useAuth()

  // If no user at all (not authenticated), redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If user has the required permission, render children
  if (hasPermission(requiredPermission)) {
    return children
  }

  // If user doesn't have permission, redirect to their role dashboard or custom redirect
  const redirectPath = redirectTo || ROLE_DASHBOARD_ROUTES[user.userType] || '/'
  return <Navigate to={redirectPath} replace />
}

// TODO: Phase 4