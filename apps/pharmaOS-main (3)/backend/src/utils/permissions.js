/**
 * Centralized permissions map
 * Defines which roles can access which routes
 */

export const PERMISSIONS = {
  // Super Admin - Full access to everything
  SUPER_ADMIN: [
    '/products',
    '/orders',
    '/transactions',
    '/analytics',
    '/reports',
    '/customers',
    '/suppliers',
    '/purchases',
    '/expenses',
    '/incomes',
    '/settings',
    '/users',
    '/roles',
    '/import',
    '/prompt',
    '/alerts',
  ],

  // Admin - Products, Orders, Reports, Settings
  ADMIN: [
    '/products',
    '/orders',
    '/transactions',
    '/analytics',
    '/reports',
    '/customers',
    '/suppliers',
    '/purchases',
    '/expenses',
    '/incomes',
    '/settings',
    '/import',
    '/prompt',
    '/alerts',
  ],

  // Finance - Financial transactions, analytics, reports
  FINANCE: [
    '/transactions',
    '/analytics',
    '/reports',
    '/expenses',
    '/incomes',
    '/purchases',
  ],

  // Receiving Bay - Products, Suppliers, Purchases, Alerts
  RECEIVING_BAY: [
    '/products',
    '/suppliers',
    '/purchases',
    '/alerts',
    '/import',
  ],

  // Manager - Analytics, Reports, Orders, Products
  MANAGER: [
    '/analytics',
    '/reports',
    '/orders',
    '/products',
    '/transactions',
    '/customers',
    '/suppliers',
  ],

  // Dispatch - Orders, Customers
  DISPATCH: [
    '/orders',
    '/customers',
    '/alerts',
  ],

  // Rider - Orders (read-only), Customers
  RIDER: [
    '/orders',
    '/customers',
  ],

  // Pharmacist - POS (orders), Products, Alerts
  PHARMACIST: [
    '/orders',
    '/products',
    '/alerts',
    '/customers',
    '/transactions',
  ],
}

/**
 * Helper function to get allowed roles for a route
 * @param {string} route - The route path
 * @returns {string[]} - Array of allowed roles
 */
export function getAllowedRoles(route) {
  const allowedRoles = new Set()

  for (const [role, routes] of Object.entries(PERMISSIONS)) {
    for (const allowedRoute of routes) {
      if (route.startsWith(allowedRoute)) {
        allowedRoles.add(role)
      }
    }
  }

  return Array.from(allowedRoles)
}
