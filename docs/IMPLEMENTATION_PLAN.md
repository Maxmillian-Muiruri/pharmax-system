# PHARMX RBAC IMPLEMENTATION PLAN

## 1. OVERVIEW

### Problem Statement
The current PharmaOS frontend has critical security and usability issues:
- **ProtectedRoute** (`apps/pharmaOS-main (3)/frontend/src/components/auth/ProtectedRoute.jsx`) only validates authentication, not authorization
- **Any authenticated user** can access any URL route, regardless of their role
- **Sidebar** (`apps/pharmaOS-main (3)/frontend/src/components/layout/Sidebar.jsx`) only hides the Reports link for non-admins (line 82: `adminOnly: true`)
- **Single shared Dashboard** (`apps/pharmaOS-main (3)/frontend/src/pages/Dashboard.jsx`) shows all data to all roles
- **Scattered role logic** across multiple files with no central configuration

### End Result
After implementation, the system will:
- Have proper role-based route protection preventing unauthorized access
- Display role-specific dashboards with relevant KPIs and data
- Show dynamic sidebar navigation based on user permissions
- Provide consistent permission checking using a centralized configuration
- Maintain clear separation between authentication (who you are) and authorization (what you can do)

### Estimated Timeline/IMPLEMENTATION_PLAN.md
- Phase 1 (Foundation): 2-3 hours
- Phase 2 (Auth Enhancement): 2-3 hours
- Phase 3 (Route Protection): 3-4 hours
- Phase 4 (Navigation): 2-3 hours
- Phase 5 (Role Dashboards): 6-8 hours
- Phase 6 (Page Permissions): 4-6 hours
- Phase 7 (Testing): 2-3 hours
- **Total: 21-29 hours**

---

## 2. ROLES AND THEIR ACCESS

| Role | Dashboard | Accessible Pages | Restricted Pages | Sidebar Links | Key Actions |
|------|-----------|------------------|------------------|---------------|-------------|
| **SUPER_ADMIN** | AdminDashboard | All pages | None | All navigation items | Full system access, user management, settings |
| **ADMIN** | AdminDashboard | Dashboard, Products, Purchases, Customers, Suppliers, Orders, Prescriptions, Stock, Settings | Reports (admin only), User Management | All except Reports (if adminOnly applies) | All business operations, no user management |
| **MANAGER** | ManagerDashboard | Dashboard, Products, Stock, Orders, Reports | Settings, Customers, Suppliers, Purchases, Prescriptions, Incomes, Expenses | Dashboard, Products, Stock, Orders, Reports | Analytics, inventory oversight, order monitoring |
| **PHARMACIST** | PharmacistDashboard | Dashboard, POS (/pos, /sales/new), Products, Stock, Prescriptions, Orders | Reports, Settings, Customers, Suppliers, Purchases, Financials | Dashboard, Sales, Products, Stock, Prescriptions, Orders | POS sales, prescription verification, inventory queries |
| **FINANCE** | FinanceDashboard | Dashboard, Incomes, Expenses, Tax, DueList, Reports | Settings, Products, Customers, Suppliers, Orders, Prescriptions, Purchases | Dashboard, Financials (Incomes, Expenses, Tax, DueList), Reports | Financial tracking, revenue analysis, payment processing |
| **DISPATCH** | DispatchDashboard | Dashboard, Orders (/orders), Stock | All other pages | Dashboard, Orders, Stock | Order fulfillment, delivery status updates |
| **RIDER** | RiderDashboard | Dashboard, Orders (delivery view only) | All other pages | Dashboard, Orders | Delivery tracking, status updates on assigned orders |
| **RECEIVING_BAY** | ReceivingDashboard | Dashboard, Purchases, Suppliers, Products, Stock | All other pages | Dashboard, Purchases, Suppliers, Stock | Inventory receiving, stock updates |

---

## 3. PERMISSIONS MATRIX

| Permission | SUPER_ADMIN | ADMIN | MANAGER | PHARMACIST | FINANCE | DISPATCH | RIDER | RECEIVING_BAY |
|------------|-------------|-------|---------|------------|---------|----------|-------|---------------|
| view_dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| access_admin_dashboard | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| view_products | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| edit_products | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| delete_products | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| view_orders | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| edit_orders | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| process_orders | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| view_prescriptions | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| verify_prescriptions | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| view_customers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| edit_customers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| view_suppliers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| edit_suppliers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| view_purchases | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| edit_purchases | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| view_financials | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| edit_financials | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| view_reports | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| access_pos | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| view_stock | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| edit_stock | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| view_settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| edit_settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| view_deliveries | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| update_deliveries | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| manage_users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. FILES TO CREATE

### Configuration and Foundation Files

| File Path | Purpose | Contents |
|-----------|---------|----------|
| `src/config/permissions.js` | Central permsaission definitions | Permission constants, ROLE_PERMISSIONS mapping object, helper functions |
| `src/config/routes.js` | Role-route mapping configuration | Array of route definitions with required permissions, role-based route grouping |

### Context and Hooks

| File Path | Purpose | Contents |
|-----------|---------|----------|
| `src/context/PermissionsContext.jsx` | Permission state management | `hasPermission()`, `hasRole()`, `userPermissions` state, permission checking logic |
| `src/hooks/usePermissions.js` | Reusable permission hook | Hook wrapping PermissionsContext for easy component access |

### Route Protection Components

| File Path | Purpose | Contents |
|-----------|---------|----------|
| `src/components/auth/PermissionGuard.jsx` | Route/page access control | Component that checks permissions before rendering children, redirect logic |
| `src/components/auth/RoleBasedRedirect.jsx` | Post-login routing | Component redirecting users to their role-appropriate dashboard |

### Role-Specific Dashboards

| File Path | Purpose | Contents |
|-----------|---------|----------|
| `src/features/dashboard/AdminDashboard.jsx` | Admin overview | Admin KPI cards, system metrics, user overview |
| `src/features/dashboard/ManagerDashboard.jsx` | Manager overview | Analytics charts, operational metrics |
| `src/features/dashboard/PharmacistDashboard.jsx` | Pharmacist overview | Sales stats, pending prescriptions, stock alerts |
| `src/features/dashboard/FinanceDashboard.jsx` | Finance overview | Revenue, expenses, profit/loss, payment tracking |
| `src/features/dashboard/DispatchDashboard.jsx` | Dispatch overview | Orders to process, delivery tracking, fulfillment metrics |
| `src/features/dashboard/RiderDashboard.jsx` | Rider overview | Assigned deliveries, daily routes, delivery status |
| `src/features/dashboard/ReceivingDashboard.jsx` | Receiving overview | Pending purchases, supplier orders, stock levels |

---

## 5. FILES TO MODIFY

### Authentication System

| File Path | Current Problem | Changes Required | Reason |
|-----------|----------------|----------------|--------|
| `src/context/AuthContext.jsx` | Only stores `userType` string, no permissions | Add `permissions` array to state, add `hasPermission()` method, fetch permissions on login | Need granular permission checking beyond just role names |
| `src/components/auth/ProtectedRoute.jsx` | Only checks `isAuthenticated` flag | Add permission checking, prevent unauthorized route access | Current implementation allows any authenticated user everywhere |

### Routing

| File Path | Current Problem | Changes Required | Reason |
|-----------|----------------|----------------|--------|
| `src/App.jsx` | All protected routes use same ProtectedRoute, no role differentiation | Use PermissionGuard with required permissions, add role-based redirect route | Need proper authorization at route level |
| `src/main.jsx` | No role-based initialization | Add role detection and redirect logic | Users should land on appropriate dashboard |

### Navigation

| File Path | Current Problem | Changes Required | Reason |
|-----------|----------------|----------------|--------|
| `src/components/layout/Sidebar.jsx` | Only uses `adminOnly` flag for Reports, hardcoded logic | Replace with permission-based filtering using `hasPermission()`, dynamic menu generation | Need scalable navigation that adapts to any role |

### Pages

| File Path | Current Problem | Changes Required | Reason |
|-----------|----------------|----------------|--------|
| `src/pages/Dashboard.jsx` | Single page shows all data to all roles, uses API failure to detect permissions | Split into role-specific dashboards OR add conditional rendering per role | Wrong data shown to wrong roles |
| `src/pages/Products.jsx` | No permission checks for CRUD operations | Hide/disable edit/delete buttons based on permissions | Prevent unauthorized modifications |
| `src/pages/Orders.jsx` | Any user can create/update orders | Restrict actions based on role permissions | Role-specific order workflows |
| `src/pages/Prescriptions.jsx` | Anyone can verify prescriptions | Restrict Verify button to pharmacist roles | Specialized workflow restriction |
| `src/pages/Sales/POSView.jsx` | No role restriction | Add POS access check | Only pharmacists should access POS |
| `src/pages/Sales/PharmacistPOS.jsx` | No role restriction | Add POS access check | Duplicate of above, ensure both protected |
| `src/pages/Purchases.jsx` | No role restriction | Add purchase access check | Receiving bay specific |
| `src/pages/Suppliers.jsx` | No role restriction | Add supplier access check | Receiving bay specific |
| `src/pages/Financial pages` (Incomes, Expenses, Tax, DueList) | No role restriction | Add finance access checks | Finance team specific |

---

## 6. IMPLEMENTATION PHASES

### Phase 1 — Foundation (Config Files)
**Time: 2-3 hours**

**Files to create:**
- `src/config/permissions.js`
- `src/config/routes.js`

**Why first:** All other components depend on these configuration files. They establish the single source of truth for what each role can access. Without this foundation, permission logic would be scattered again.

**Dependencies:** None - these are pure configuration files with no external dependencies.

### Phase 2 — Authentication Enhancement
**Time: 2-3 hours**

**Files to modify:**
- `src/context/AuthContext.jsx`
- `src/components/auth/ProtectedRoute.jsx` (partial - add permission checking)

**Files to create:**
- `src/context/PermissionsContext.jsx`
- `src/hooks/usePermissions.js`

**What changes:**
- AuthContext will store and provide permissions array
- PermissionsContext will manage permission state globally
- ProtectedRoute will begin checking permissions (will be completed in Phase 3)

**Why:** The authentication layer must be enhanced to support granular permissions before route protection can work properly.

### Phase 3 — Route Protection
**Time: 3-4 hours**

**Files to create:**
- `src/components/auth/PermissionGuard.jsx`
- `src/components/auth/RoleBasedRedirect.jsx`

**Files to modify:**
- `src/App.jsx` - Replace ProtectedRoute with PermissionGuard
- `src/main.jsx` - Add role-based routing

**What changes:**
- PermissionGuard component validates permissions before rendering children
- App.jsx route definitions use PermissionGuard with required permissions
- RoleBasedRedirect sends users to their role-appropriate dashboard

**Why:** This is the core security fix - preventing unauthorized URL access.

### Phase 4 — Navigation (Sidebar)
**Time: 2-3 hours**

**Files to modify:**
- `src/components/layout/Sidebar.jsx`

**What changes:**
- Replace hardcoded `adminOnly` filtering with `hasPermission()` checks
- Dynamic menu item generation based on user permissions
- Hide/show navigation items using centralized configuration

**Why:** Navigation is the first user-facing element that needs to reflect role capabilities.

### Phase 5 — Role Dashboards
**Time: 6-8 hours**

**Files to create:**
- `src/features/dashboard/AdminDashboard.jsx`
- `src/features/dashboard/ManagerDashboard.jsx`
- `src/features/dashboard/PharmacistDashboard.jsx`
- `src/features/dashboard/FinanceDashboard.jsx`
- `src/features/dashboard/DispatchDashboard.jsx`
- `src/features/dashboard/RiderDashboard.jsx`
- `src/features/dashboard/ReceivingDashboard.jsx`

**What each shows:**
- **AdminDashboard**: All KPIs, system overview, user statistics
- **ManagerDashboard**: Analytics, sales trends, operational metrics only
- **PharmacistDashboard**: Sales data, prescription counts, low stock alerts
- **FinanceDashboard**: Revenue, expenses, profit/loss, payment summaries
- **DispatchDashboard**: Orders in processing, out-for-delivery, delivery metrics
- **RiderDashboard**: Assigned deliveries, daily delivery count, payment collection
- **ReceivingDashboard**: Incoming purchase orders, pending receipts, stock alerts

**Why:** After authentication/route protection, users need appropriate dashboards.

### Phase 6 — Page Level Permissions
**Time: 4-6 hours**

**Files to modify:**
- `src/pages/Products.jsx`
- `src/pages/Orders.jsx`
- `src/pages/Prescriptions.jsx`
- `src/pages/Sales/POSView.jsx`
- `src/pages/Sales/PharmacistPOS.jsx`
- `src/pages/Purchases.jsx`
- `src/pages/Suppliers.jsx`
- `src/pages/Incomes.jsx`
- `src/pages/Expenses.jsx`
- `src/pages/Tax.jsx`
- `src/pages/DueList.jsx`

**What changes:**
- Add `usePermissions()` hook to check action-level permissions
- Conditionally render/hide buttons based on permissions
- Disable form fields or entire sections for unauthorized roles

**Why last:** These are safety/usability improvements. Route protection already prevents access, but we improve UX by hiding unavailable actions.

### Phase 7 — Testing and Verification
**Time: 2-3 hours**

**Testing process:**
1. Test each role by logging in via Login.jsx role selector
2. Verify each role lands on correct dashboard
3. Verify sidebar shows correct navigation items
4. Verify URL typing is blocked (route protection works)
5. Verify API calls are still made for route protection (backend enforcement)
6. Verify action buttons are properly disabled/hidden

**Manual verification checklist:**
- [ ] SUPER_ADMIN can access everything
- [ ] ADMIN cannot access Reports (if adminOnly applies)
- [ ] MANAGER cannot access Settings, Customers, Suppliers, Prescriptions
- [ ] PHARMACIST cannot access Financial pages
- [ ] FINANCE cannot access Product/Order management
- [ ] DISPATCH cannot access Prescriptions, Financials
- [ ] RIDER can only see their assigned deliveries
- [ ] RECEIVING_BAY cannot access POS, Prescriptions

---

## 7. FOLDER STRUCTURE

### New Structure After Implementation

```
apps/pharmaOS-main (3)/frontend/src/
├── config/                        # NEW: Central configuration
│   ├── permissions.js            # NEW: Permission definitions
│   └── routes.js                 # NEW: Route configuration
├── context/
│   ├── AuthContext.jsx          # MODIFIED: Add permissions state
│   ├── PermissionsContext.jsx   # NEW: Permission state management
│   └── ToastContext.jsx         # Unchanged
├── hooks/
│   ├── usePermissions.js        # NEW: Permission hook
│   ├── useAlerts.js             # Unchanged
│   ├── useAnalytics.js          # Unchanged
│   ├── useCustomers.js          # Unchanged
│   ├── useExpenses.js           # Unchanged
│   ├── useIncomes.js            # Unchanged
│   ├── useLocalStorage.js       # Unchanged
│   ├── useOrders.js             # Unchanged
│   ├── usePrescriptions.js      # Unchanged
│   ├── useProducts.js           # Unchanged
│   ├── usePurchases.js          # Unchanged
│   ├── useSettings.js           # Unchanged
│   └── useSuppliers.js          # Unchanged
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.jsx   # MODIFIED: Add permission checking
│   │   ├── PermissionGuard.jsx  # NEW: Permission-based route guard
│   │   └── RoleBasedRedirect.jsx # NEW: Role redirect component
│   ├── forms/
│   │   ├── OrderModal.jsx       # Unchanged
│   │   └── ProductModal.jsx     # Unchanged
│   ├── layout/
│   │   ├── Header.jsx           # Unchanged
│   │   ├── Navbar.jsx           # Unchanged
│   │   ├── PageWrapper.jsx      # Unchanged
│   │   └── Sidebar.jsx          # MODIFIED: Permission-based filtering
│   ├── templates/
│   │   ├── FormTemplate.jsx     # Unchanged
│   │   └── ListTemplate.jsx     # Unchanged
│   └── ui/                     # Unchanged
├── features/                    # NEW: Feature-based organization
│   └── dashboard/
│       ├── AdminDashboard.jsx   # NEW
│       ├── ManagerDashboard.jsx # NEW
│       ├── PharmacistDashboard.jsx # NEW
│       ├── FinanceDashboard.jsx # NEW
│       ├── DispatchDashboard.jsx # NEW
│       ├── RiderDashboard.jsx   # NEW
│       └── ReceivingDashboard.jsx # NEW
├── pages/                       # MODIFIED: Add permission checks
│   ├── Analytics.jsx           # MODIFIED
│   ├── Customers.jsx           # MODIFIED
│   ├── Dashboard.jsx           # MODIFIED or RENAMED
│   ├── DueList.jsx             # MODIFIED
│   ├── Expenses.jsx            # MODIFIED
│   ├── Import.jsx              # Unchanged
│   ├── Incomes.jsx             # MODIFIED
│   ├── Inventory.jsx           # Unchanged
│   ├── Login.jsx               # Unchanged
│   ├── Orders.jsx              # MODIFIED
│   ├── Prescriptions.jsx       # MODIFIED
│   ├── Products.jsx            # MODIFIED
│   ├── PurchaseNew.jsx         # Unchanged
│   ├── Purchases.jsx           # MODIFIED
│   ├── Reports.jsx             # MODIFIED (adminOnly)
│   ├── Sales/
│   │   ├── PharmacistPOS.jsx   # MODIFIED
│   │   ├── POSView.jsx         # MODIFIED
│   │   └── SalesList.jsx       # Unchanged
│   ├── Settings.jsx            # MODIFIED
│   ├── StockList.jsx           # Unchanged
│   ├── Suppliers.jsx           # MODIFIED
│   ├── Tax.jsx                 # MODIFIED
│   └── Transactions.jsx        # Unchanged
├── services/
│   └── api.js                  # Unchanged
└── utils/
    ├── formatCurrency.js       # Unchanged
    ├── formatDate.js           # Unchanged
    ├── reportGenerators.js     # Unchanged
    └── statusColor.js          # Unchanged
```

---

## 8. IMPLEMENTATION RULES

### Critical Rules for Implementation

1. **Never check permissions inside individual page components** - Always use the PermissionGuard component or hasPermission hook. Page components should focus on business logic, not authorization.

2. **Always use the central permissions configuration** - Never hardcode role names like `'ADMIN'` or `'PHARMACIST'` in components. Use permission constants like `PERMISSIONS.VIEW_PRODUCTS` or `PERMISSIONS.ACCESS_POS`.

3. **Backend must enforce the same permissions** - The frontend permissions are for UX only. The backend API layer (`/apps/pharmaOS-main (3)/backend/src/middleware/auth.ts`) must still return 403 errors for unauthorized access attempts.

4. **One source of truth for all role/permission definitions** - All permissions live in `src/config/permissions.js`. No duplicate or inline permission definitions.

5. **Permission-based routing over role-based routing** - Routes are protected by required permissions, not roles directly. This allows for more flexible future permission adjustments without route changes.

6. **Feature-based organization for role-specific components** - Role-specific dashboards and components go in `src/features/[role]/` directories, not mixed with shared pages.

7. **Graceful degradation for missing permissions** - When a user lacks permission, show "Access Denied" component or redirect to their dashboard, not error pages.

8. **Session storage for permissions** - Store user permissions in AuthContext state, not localStorage, to prevent tampering.

9. **Test each role thoroughly** - Every change must be tested with all 8 roles to ensure proper access control.

10. **Document permission changes** - Any new permission must be added to the permissions matrix and documented.

---

## 9. COMMON MISTAKES TO AVOID

### Mistake 1: Hiding UI elements without route protection
**Problem:** Developer hides buttons in the UI but doesn't protect the route.
**Example:** Sidebar hides Reports but user can still navigate to `/reports`.
**Solution:** Always use PermissionGuard at route level. UI hiding is just UX improvement.

### Mistake 2: Hardcoding role names in components
**Problem:** Using `if (user.userType === 'ADMIN')` scattered across files.
**Example:** Multiple files checking role strings directly.
**Solution:** Use centralized permissions: `if (hasPermission(PERMISSIONS.VIEW_REPORTS))`.

### Mistake 3: Forgetting to update both frontend and backend
**Problem:** Frontend restricts access but backend doesn't validate.
**Example:** Frontend hides financial data but backend still accepts requests.
**Solution:** Backend middleware must mirror frontend permissions.

### Mistake 4: Not testing route protection by typing URLs
**Problem:** Authorization tested via sidebar only, not direct navigation.
**Solution:** Always test typing `/admin/secret-page` directly in browser.

### Mistake 5: Confusing roles with permissions
**Problem:** Treating role names as permissions (e.g., checking `isAdmin` instead of `canEditProducts`).
**Solution:** Think in terms of actions (permissions) not job titles (roles).

### Mistake 6: Combining multiple permissions in one component
**Problem:** Component checks 5+ permissions for different actions.
**Solution:** Split into smaller components, each with single responsibility.

### Mistake 7: Not handling role hierarchy properly
**Problem:** Manually checking for each admin role instead of using role inheritance.
**Solution:** Define role hierarchy in config: SUPER_ADMIN inherits ADMIN permissions.

### Mistake 8: Breaking existing functionality during refactoring
**Problem:** New permission system breaks working features.
**Solution:** Implement new system alongside old, then migrate gradually.

### Mistake 9: Not creating role-specific dashboards
**Problem:** All roles see same generic dashboard.
**Solution:** Create specific dashboards for each role with relevant KPIs.

### Mistake 10: Mixing feature code with permission logic
**Problem:** Permission checks scattered in business logic files.
**Solution:** Use higher-order components/Higher-order routes for separation.

---

## 10. SUCCESS CRITERIA

### Verification Checklist

#### Foundation Verification
- [ ] `src/config/permissions.js` exists with all 25+ permissions defined
- [ ] `src/config/routes.js` exists with route-permission mappings
- [ ] `ROLE_PERMISSIONS` object correctly maps all 8 roles to their permissions
- [ ] No hardcoded role strings exist in sidebar or page components

#### Authentication Verification
- [ ] AuthContext stores permissions array (not just userType)
- [ ] PermissionsContext provides `hasPermission()` and `hasRole()` functions
- [ ] Login response includes permissions array (requires backend change)
- [ ] usePermissions hook works correctly in components

#### Route Protection Verification
- [ ] PermissionGuard component blocks unauthorized routes
- [ ] User typing `/admin` as RIDER redirects to RiderDashboard
- [ ] User typing `/products` as RIDER shows 403 or redirect
- [ ] All existing routes still function for authorized users
- [ ] Role-based redirect sends each role to correct dashboard

#### Navigation Verification
- [ ] Sidebar shows correct links for each role
- [ ] MANAGER does not see Customers/Suppliers/Purchases links
- [ ] FINANCE does not see Products/Orders/POS links
- [ ] RIDER only sees Orders and Dashboard links
- [ ] Navigation updates immediately on login/logout

#### Dashboard Verification
- [ ] Each role lands on their specific dashboard after login
- [ ] AdminDashboard shows all KPIs and system stats
- [ ] PharmacistDashboard shows sales and prescription focus
- [ ] FinanceDashboard shows revenue and expense focus
- [ ] DispatchDashboard shows order processing focus
- [ ] RiderDashboard shows delivery focus

#### Page Permission Verification
- [ ] Products page edit/delete buttons disabled for FINANCE users
- [ ] Orders page create button hidden for RIDER users
- [ ] Prescriptions verify button only for PHARMACIST users
- [ ] POS pages inaccessible to non-PHARMACIST users
- [ ] Financial pages inaccessible to non-FINANCE users

#### Security Verification
- [ ] Network tab shows 403 responses for unauthorized API calls
- [ ] Direct URL navigation blocked for unauthorized roles
- [ ] Console has no permission-related errors
- [ ] User cannot manipulate localStorage to gain permissions

#### User Experience Verification
- [ ] Loading states work during permission checks
- [ ] "Access Denied" message is user-friendly
- [ ] No broken links in navigation
- [ ] Mobile navigation respects permissions
- [ ] Role switching in Login.jsx demo mode works correctly

---

*Document created: 2026-05-27*
*For: PharmaOS Frontend RBAC Implementation*
*Reference codebase: `apps/pharmaOS-main (3)/frontend/src/`*