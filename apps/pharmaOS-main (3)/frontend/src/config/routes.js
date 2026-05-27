// Phase 1 - RBAC Foundation

import { PERMISSIONS } from "./permissions.js";

// Section 1 — Route Definitions
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  DASHBOARD_MANAGER: "/dashboard/manager",
  DASHBOARD_PHARMACIST: "/dashboard/pharmacist",
  DASHBOARD_FINANCE: "/dashboard/finance",
  DASHBOARD_DISPATCH: "/dashboard/dispatch",
  DASHBOARD_RIDER: "/dashboard/rider",
  DASHBOARD_RECEIVING: "/dashboard/receiving",
  PRODUCTS: "/products",
  ORDERS: "/orders",
  PRESCRIPTIONS: "/prescriptions",
  CUSTOMERS: "/customers",
  SUPPLIERS: "/suppliers",
  PURCHASES: "/purchases",
  INCOMES: "/incomes",
  EXPENSES: "/expenses",
  TAX: "/tax",
  DUELIST: "/duelist",
  REPORTS: "/reports",
  POS: "/pos",
  STOCK: "/stock",
  SETTINGS: "/settings",
  ANALYTICS: "/analytics",
  UNAUTHORIZED: "/unauthorized",
};

// Section 2 — Protected Route Config
export const PROTECTED_ROUTES = [
  // Dashboard routes
  {
    path: ROUTES.DASHBOARD,
    requiredPermission: PERMISSIONS.VIEW_DASHBOARD,
    redirectTo: ROUTES.UNAUTHORIZED,
  },
  {
    path: ROUTES.DASHBOARD_MANAGER,
    requiredPermission: PERMISSIONS.VIEW_DASHBOARD,
    redirectTo: ROUTES.UNAUTHORIZED,
  },
  {
    path: ROUTES.DASHBOARD_PHARMACIST,
    requiredPermission: PERMISSIONS.VIEW_DASHBOARD,
    redirectTo: ROUTES.UNAUTHORIZED,
  },
  {
    path: ROUTES.DASHBOARD_FINANCE,
    requiredPermission: PERMISSIONS.VIEW_DASHBOARD,
    redirectTo: ROUTES.UNAUTHORIZED,
  },
  {
    path: ROUTES.DASHBOARD_DISPATCH,
    requiredPermission: PERMISSIONS.VIEW_DASHBOARD,
    redirectTo: ROUTES.UNAUTHORIZED,
  },
  {
    path: ROUTES.DASHBOARD_RIDER,
    requiredPermission: PERMISSIONS.VIEW_DASHBOARD,
    redirectTo: ROUTES.UNAUTHORIZED,
  },
  {
    path: ROUTES.DASHBOARD_RECEIVING,
    requiredPermission: PERMISSIONS.VIEW_DASHBOARD,
    redirectTo: ROUTES.UNAUTHORIZED,
  },

  // Products routes
  {
    path: ROUTES.PRODUCTS,
    requiredPermission: PERMISSIONS.VIEW_PRODUCTS,
    redirectTo: ROUTES.UNAUTHORIZED,
  },

  // Orders routes
  {
    path: ROUTES.ORDERS,
    requiredPermission: PERMISSIONS.VIEW_ORDERS,
    redirectTo: ROUTES.UNAUTHORIZED,
  },

  // Prescriptions routes
  {
    path: ROUTES.PRESCRIPTIONS,
    requiredPermission: PERMISSIONS.VIEW_PRESCRIPTIONS,
    redirectTo: ROUTES.UNAUTHORIZED,
  },

  // Customers routes
  {
    path: ROUTES.CUSTOMERS,
    requiredPermission: PERMISSIONS.VIEW_CUSTOMERS,
    redirectTo: ROUTES.UNAUTHORIZED,
  },

  // Suppliers routes
  {
    path: ROUTES.SUPPLIERS,
    requiredPermission: PERMISSIONS.VIEW_SUPPLIERS,
    redirectTo: ROUTES.UNAUTHORIZED,
  },

  // Purchases routes
  {
    path: ROUTES.PURCHASES,
    requiredPermission: PERMISSIONS.VIEW_PURCHASES,
    redirectTo: ROUTES.UNAUTHORIZED,
  },

  // Financial routes
  {
    path: ROUTES.INCOMES,
    requiredPermission: PERMISSIONS.VIEW_FINANCIALS,
    redirectTo: ROUTES.UNAUTHORIZED,
  },
  {
    path: ROUTES.EXPENSES,
    requiredPermission: PERMISSIONS.VIEW_FINANCIALS,
    redirectTo: ROUTES.UNAUTHORIZED,
  },
  {
    path: ROUTES.TAX,
    requiredPermission: PERMISSIONS.VIEW_FINANCIALS,
    redirectTo: ROUTES.UNAUTHORIZED,
  },
  {
    path: ROUTES.DUELIST,
    requiredPermission: PERMISSIONS.VIEW_FINANCIALS,
    redirectTo: ROUTES.UNAUTHORIZED,
  }, // Assuming DUELIST uses FINANCIALS permission

  // Reports routes
  {
    path: ROUTES.REPORTS,
    requiredPermission: PERMISSIONS.VIEW_REPORTS,
    redirectTo: ROUTES.UNAUTHORIZED,
  },

  // POS routes
  {
    path: ROUTES.POS,
    requiredPermission: PERMISSIONS.ACCESS_POS,
    redirectTo: ROUTES.UNAUTHORIZED,
  },

  // Stock routes
  {
    path: ROUTES.STOCK,
    requiredPermission: PERMISSIONS.VIEW_STOCK,
    redirectTo: ROUTES.UNAUTHORIZED,
  },

  // Settings routes
  {
    path: ROUTES.SETTINGS,
    requiredPermission: PERMISSIONS.VIEW_SETTINGS,
    redirectTo: ROUTES.UNAUTHORIZED,
  },

  // Analytics routes
  {
    path: ROUTES.ANALYTICS,
    requiredPermission: PERMISSIONS.VIEW_REPORTS,
    redirectTo: ROUTES.UNAUTHORIZED,
  }, // Assuming ANALYTICS uses REPORTS permission
];

// Section 3 — Public Routes
export const PUBLIC_ROUTES = [ROUTES.LOGIN];

// TODO: Phase 2
