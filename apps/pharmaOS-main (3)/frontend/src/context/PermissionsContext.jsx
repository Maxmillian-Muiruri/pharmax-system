// Phase 2 - Auth Enhancement
import { createContext, useContext } from 'react'
import { ROLE_PERMISSIONS, hasPermission, hasAnyPermission, hasAllPermissions } from '../config/permissions'

const PermissionsContext = createContext()

export function PermissionsProvider({ userRole, children }) {
  const userPermissions = ROLE_PERMISSIONS[userRole] || []

  const contextValue = {
    userPermissions,
    userRole,
    hasPermission: (permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissionsArray) => hasAnyPermission(userRole, permissionsArray),
    hasAllPermissions: (permissionsArray) => hasAllPermissions(userRole, permissionsArray)
  }

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}

// TODO: Phase 3