# PHARMX RBAC IMPLEMENTATION PLAN

## 1. OVERVIEW

### Problem Being Solved

The current PharmaX frontend has authentication but does not have complete role-based access control.

The current issues are:

- `ProtectedRoute` only checks whether a user is logged in.
- Any authenticated user can manually type a protected URL and access the page.
- `Sidebar.jsx` only hides `Reports` for non-admin users.
- Most sidebar links are visible to every logged-in user.
- `Dashboard.jsx` is one shared dashboard for all roles.
- Role checks are scattered across `Login.jsx`, `Sidebar.jsx`, `Navbar.jsx`, `Dashboard.jsx`, and `AuthContext.jsx`.
- There is no central permissions configuration.
- Route access, sidebar visibility, dashboard landing, and button-level permissions are not driven by one source of truth.

### End Result

After implementation:

- Every role will land on the correct dashboard after login.
- Routes will be protected by permissions, not just authentication.
- Sidebar links will be generated from a central navigation configuration.
- Each role will only see the pages and actions relevant to their workflow.
- Page-level actions such as create, edit, delete, approve, export, and dispatch will be permission-aware.
- All frontend role and permission logic will be centralized.
- Backend permissions will use the same permission vocabulary.

### Estimated Timeline

| Phase | Name | Estimate |
|---|---:|---:|
| Phase 1 | Foundation config files | 0.5-1 day |
| Phase 2 | Authentication enhancement | 0.5 day |
| Phase 3 | Route protection | 1 day |
| Phase 4 | Navigation/sidebar | 0.5-1 day |
| Phase 5 | Role dashboards | 1-2 days |
| Phase 6 | Page-level permissions | 2-4 days |
| Phase 7 | Testing and verification | 1-2 days |

Total estimate: 6-11 working days depending on backend readiness and test coverage.

## 2. ROLES AND THEIR ACCESS

| Role | Landing Dashboard | Pages They Can Access | Pages They Cannot Access | Sidebar Links | Key Actions |
|---|---|---|---|---|---|
| `SUPER_ADMIN` | `/dashboard/super-admin` | All pages: dashboard, sales, POS, products, stock, purchases, suppliers, customers, orders, prescriptions, incomes, expenses, tax, due list, reports, settings, analytics, transactions, import, user management | None | All links | Manage users, manage permissions, configure system, view/export all reports, override workflows |
| `ADMIN` | `/dashboard/admin` | Dashboard, sales, POS, products, stock, purchases, suppliers, customers, orders, prescriptions, reports, settings, import | User/role system ownership if reserved for super admin only | Dashboard, Sales, Products, Stock, Purchases, Suppliers, Customers, Orders, Prescriptions, Reports, Settings | Manage daily operations, create/edit products, manage orders, manage settings, export reports |
| `MANAGER` | `/dashboard/manager` | Dashboard, analytics, reports, products read-only, stock read-only, purchases read-only, suppliers read-only, customers read-only, orders, due list | Settings update, user management, delete products, finance write actions, rider-only delivery pages | Dashboard, Analytics, Reports, Stock, Orders, Purchases, Customers, Due List | Monitor performance, review stock, review reports, supervise operations |
| `PHARMACIST` | `/dashboard/pharmacist` or `/pos` | POS, sales new, sales list, prescriptions, customers, current stock, products read-only | Settings, reports export, purchases, suppliers management, finance pages, dispatch/rider pages | POS, Sales, Prescriptions, Customers, Current Stock | Create sales, verify prescriptions, search stock, create customer during checkout |
| `FINANCE` | `/dashboard/finance` | Incomes, expenses, tax, due list, transactions, reports, finance dashboard, customers read-only | POS, prescriptions approval, purchases write, stock edit, settings, dispatch/rider pages | Dashboard, Incomes, Expenses, Tax, Due List, Transactions, Reports | Record income/expenses, reconcile transactions, export financial reports |
| `DISPATCH` | `/dashboard/dispatch` | Orders, dispatch queue, prescriptions ready for delivery, rider assignment | Finance, settings, product edit/delete, purchases, supplier management, reports export | Dashboard, Orders, Dispatch Queue, Riders | Assign deliveries, mark out for delivery, monitor delivery status |
| `RIDER` | `/dashboard/rider` | My deliveries, assigned delivery details, profile | Products, stock, purchases, suppliers, reports, settings, finance, full orders, customers list | My Deliveries, Completed Deliveries, Profile | View assigned deliveries, mark picked up, mark delivered, mark failed |
| `RECEIVING_BAY` | `/dashboard/receiving` | Purchases, purchase new, suppliers, products limited create/update, stock, current stock, low stock, expired stock | Finance, reports export, settings, POS, rider pages, user management | Dashboard, Purchases, Suppliers, Stock, Products | Receive stock, update quantities, record batches and expiry dates, manage supplier receiving |

## 3. PERMISSIONS MATRIX

Legend:

- Yes: role has permission.
- No: role does not have permission.

| Permission | SUPER_ADMIN | ADMIN | MANAGER | PHARMACIST | FINANCE | DISPATCH | RIDER | RECEIVING_BAY |
|---|---|---|---|---|---|---|---|---|
| `view_super_admin_dashboard` | Yes | No | No | No | No | No | No | No |
| `view_admin_dashboard` | Yes | Yes | No | No | No | No | No | No |
| `view_manager_dashboard` | Yes | Yes | Yes | No | No | No | No | No |
| `view_pharmacist_dashboard` | Yes | Yes | No | Yes | No | No | No | No |
| `view_finance_dashboard` | Yes | Yes | No | No | Yes | No | No | No |
| `view_dispatch_dashboard` | Yes | Yes | No | No | No | Yes | No | No |
| `view_rider_dashboard` | Yes | No | No | No | No | Yes | Yes | No |
| `view_receiving_dashboard` | Yes | Yes | No | No | No | No | No | Yes |
| `view_products` | Yes | Yes | Yes | Yes | No | No | No | Yes |
| `create_products` | Yes | Yes | No | No | No | No | No | Yes |
| `edit_products` | Yes | Yes | No | No | No | No | No | Yes |
| `delete_products` | Yes | Yes | No | No | No | No | No | No |
| `view_stock` | Yes | Yes | Yes | Yes | No | No | No | Yes |
| `view_current_stock` | Yes | Yes | Yes | Yes | No | No | No | Yes |
| `view_low_stock` | Yes | Yes | Yes | No | No | No | No | Yes |
| `view_expired_stock` | Yes | Yes | Yes | No | No | No | No | Yes |
| `edit_stock` | Yes | Yes | No | No | No | No | No | Yes |
| `import_stock` | Yes | Yes | No | No | No | No | No | Yes |
| `view_sales` | Yes | Yes | Yes | Yes | Yes | No | No | No |
| `create_sales` | Yes | Yes | No | Yes | No | No | No | No |
| `use_pos` | Yes | Yes | No | Yes | No | No | No | No |
| `void_sales` | Yes | Yes | No | No | No | No | No | No |
| `view_customers` | Yes | Yes | Yes | Yes | Yes | No | No | No |
| `create_customers` | Yes | Yes | No | Yes | No | No | No | No |
| `edit_customers` | Yes | Yes | No | Yes | No | No | No | No |
| `delete_customers` | Yes | Yes | No | No | No | No | No | No |
| `view_suppliers` | Yes | Yes | Yes | No | No | No | No | Yes |
| `create_suppliers` | Yes | Yes | No | No | No | No | No | Yes |
| `edit_suppliers` | Yes | Yes | No | No | No | No | No | Yes |
| `delete_suppliers` | Yes | Yes | No | No | No | No | No | No |
| `view_purchases` | Yes | Yes | Yes | No | No | No | No | Yes |
| `create_purchases` | Yes | Yes | No | No | No | No | No | Yes |
| `edit_purchases` | Yes | Yes | No | No | No | No | No | Yes |
| `delete_purchases` | Yes | Yes | No | No | No | No | No | No |
| `view_orders` | Yes | Yes | Yes | No | No | Yes | No | No |
| `create_orders` | Yes | Yes | No | Yes | No | Yes | No | No |
| `edit_orders` | Yes | Yes | No | No | No | Yes | No | No |
| `update_order_status` | Yes | Yes | No | No | No | Yes | Yes | No |
| `dispatch_orders` | Yes | Yes | No | No | No | Yes | No | No |
| `view_assigned_deliveries` | Yes | No | No | No | No | Yes | Yes | No |
| `update_assigned_deliveries` | Yes | No | No | No | No | Yes | Yes | No |
| `assign_riders` | Yes | Yes | No | No | No | Yes | No | No |
| `view_prescriptions` | Yes | Yes | Yes | Yes | No | Yes | No | No |
| `verify_prescriptions` | Yes | Yes | No | Yes | No | No | No | No |
| `reject_prescriptions` | Yes | Yes | No | Yes | No | No | No | No |
| `dispatch_prescriptions` | Yes | Yes | No | No | No | Yes | No | No |
| `view_incomes` | Yes | Yes | No | No | Yes | No | No | No |
| `create_incomes` | Yes | Yes | No | No | Yes | No | No | No |
| `edit_incomes` | Yes | Yes | No | No | Yes | No | No | No |
| `delete_incomes` | Yes | Yes | No | No | Yes | No | No | No |
| `view_expenses` | Yes | Yes | No | No | Yes | No | No | No |
| `create_expenses` | Yes | Yes | No | No | Yes | No | No | No |
| `edit_expenses` | Yes | Yes | No | No | Yes | No | No | No |
| `delete_expenses` | Yes | Yes | No | No | Yes | No | No | No |
| `view_tax` | Yes | Yes | No | No | Yes | No | No | No |
| `create_tax_entries` | Yes | Yes | No | No | Yes | No | No | No |
| `view_due_list` | Yes | Yes | Yes | No | Yes | No | No | No |
| `view_transactions` | Yes | Yes | Yes | No | Yes | No | No | No |
| `view_reports` | Yes | Yes | Yes | No | Yes | No | No | No |
| `export_reports` | Yes | Yes | No | No | Yes | No | No | No |
| `view_analytics` | Yes | Yes | Yes | No | Yes | No | No | No |
| `view_settings` | Yes | Yes | No | No | No | No | No | No |
| `edit_settings` | Yes | Yes | No | No | No | No | No | No |
| `manage_users` | Yes | No | No | No | No | No | No | No |
| `manage_roles` | Yes | No | No | No | No | No | No | No |
| `view_audit_logs` | Yes | No | No | No | No | No | No | No |

## 4. FILES TO CREATE

| File Path | Purpose | What It Contains | Why It Is Needed |
|---|---|---|---|
| `apps/pharmaOS-main (3)/frontend/src/config/roles.js` | Central role definitions | Role constants, role labels, role display helpers | Prevents role strings from being duplicated across the app |
| `apps/pharmaOS-main (3)/frontend/src/config/permissions.js` | Central permissions matrix | Permission constants and role-to-permission mapping | Becomes the single frontend source of truth for access |
| `apps/pharmaOS-main (3)/frontend/src/config/navigation.js` | Sidebar navigation config | Sidebar items, child links, icons, required permissions | Replaces hard-coded `navItems` in `Sidebar.jsx` |
| `apps/pharmaOS-main (3)/frontend/src/config/routes.js` | Route access config | Paths, components, required permissions, route metadata | Keeps route definitions and access rules together |
| `apps/pharmaOS-main (3)/frontend/src/config/dashboards.js` | Role landing config | Role-to-dashboard route mapping | Ensures users land on the correct dashboard after login |
| `apps/pharmaOS-main (3)/frontend/src/hooks/usePermissions.js` | Permission helper hook | `can`, `canAny`, `canAll`, role helper functions | Prevents manual permission logic in components |
| `apps/pharmaOS-main (3)/frontend/src/components/auth/RequireAuth.jsx` | Authentication-only route guard | Checks login state and redirects to `/login` | Separates authentication from authorization |
| `apps/pharmaOS-main (3)/frontend/src/components/auth/RequirePermission.jsx` | Permission route guard | Checks required permissions and redirects to unauthorized page | Blocks direct URL access by unauthorized roles |
| `apps/pharmaOS-main (3)/frontend/src/pages/Unauthorized.jsx` | Unauthorized page | Friendly 403-style access denied screen | Gives logged-in users clear feedback when blocked |
| `apps/pharmaOS-main (3)/frontend/src/pages/dashboards/SuperAdminDashboard.jsx` | Super admin dashboard | System overview, users, audit, all KPIs | Gives super admin a role-specific landing page |
| `apps/pharmaOS-main (3)/frontend/src/pages/dashboards/AdminDashboard.jsx` | Admin dashboard | Operations KPIs, stock, orders, prescriptions | Gives admin a pharmacy operations overview |
| `apps/pharmaOS-main (3)/frontend/src/pages/dashboards/ManagerDashboard.jsx` | Manager dashboard | Analytics, reports, stock summaries, performance | Gives manager read-oriented supervision tools |
| `apps/pharmaOS-main (3)/frontend/src/pages/dashboards/PharmacistDashboard.jsx` | Pharmacist dashboard | POS shortcuts, prescriptions, current stock | Gives pharmacist immediate workflow access |
| `apps/pharmaOS-main (3)/frontend/src/pages/dashboards/FinanceDashboard.jsx` | Finance dashboard | Income, expenses, due list, transactions | Gives finance role money-focused overview |
| `apps/pharmaOS-main (3)/frontend/src/pages/dashboards/DispatchDashboard.jsx` | Dispatch dashboard | Delivery queue, order statuses, rider assignments | Gives dispatch role operational delivery view |
| `apps/pharmaOS-main (3)/frontend/src/pages/dashboards/RiderDashboard.jsx` | Rider dashboard | Assigned deliveries and delivery updates | Gives riders minimal, focused access |
| `apps/pharmaOS-main (3)/frontend/src/pages/dashboards/ReceivingBayDashboard.jsx` | Receiving dashboard | Purchase receiving, suppliers, stock intake | Gives receiving bay role inventory intake workflow |

## 5. FILES TO MODIFY

| File Path | Current Problem | What Needs To Change | Why |
|---|---|---|---|
| `apps/pharmaOS-main (3)/frontend/src/App.jsx` | Routes are manually declared and only protected by login | Use route config and wrap routes with auth plus permission guards | Prevents direct URL access by unauthorized users |
| `apps/pharmaOS-main (3)/frontend/src/components/auth/ProtectedRoute.jsx` | Only checks `isAuthenticated` | Replace with or split into `RequireAuth` and `RequirePermission` | Authentication and authorization are separate concerns |
| `apps/pharmaOS-main (3)/frontend/src/context/AuthContext.jsx` | Exposes raw user object and no normalized permissions | Normalize user role, expose permissions, expose default landing route | Gives the whole app consistent auth/permission data |
| `apps/pharmaOS-main (3)/frontend/src/components/layout/Sidebar.jsx` | Hard-coded links and only `Reports` has `adminOnly` | Generate navigation from `config/navigation.js` using permissions | Ensures each role sees only valid links |
| `apps/pharmaOS-main (3)/frontend/src/components/layout/Navbar.jsx` | Formats role locally and navigates to unrouted `/inventory` path | Use shared role label helper and valid route config | Removes duplicated role formatting and broken navigation |
| `apps/pharmaOS-main (3)/frontend/src/pages/Login.jsx` | Demo roles are locally defined | Import role metadata from `config/roles.js`; redirect by dashboard config after login | Prevents login page from becoming role source of truth |
| `apps/pharmaOS-main (3)/frontend/src/pages/Dashboard.jsx` | One shared dashboard and permission inference from failed API calls | Replace with role-specific dashboard routing or keep only as legacy/admin view | Dashboards should be purpose-built per role |
| `apps/pharmaOS-main (3)/frontend/src/pages/Products.jsx` | Add/edit/delete actions are always shown to authenticated users | Guard product create/edit/delete actions with permissions | Prevents unauthorized UI actions |
| `apps/pharmaOS-main (3)/frontend/src/pages/StockList.jsx` | Stock edit/delete/add actions are always shown | Guard stock actions with permissions | Receiving/admin should edit stock; others should not |
| `apps/pharmaOS-main (3)/frontend/src/pages/Purchases.jsx` | Purchase creation is available without frontend permission checks | Guard create/edit purchase actions | Receiving/admin should manage purchases |
| `apps/pharmaOS-main (3)/frontend/src/pages/PurchaseNew.jsx` | Purchase workflow is available to any authenticated user via URL | Protect route and action buttons | Prevents non-receiving/non-admin purchase creation |
| `apps/pharmaOS-main (3)/frontend/src/pages/Suppliers.jsx` | Supplier add/edit/delete actions are always shown | Guard supplier actions | Receiving/admin should manage suppliers |
| `apps/pharmaOS-main (3)/frontend/src/pages/Customers.jsx` | Customer add/edit/delete actions are always shown | Guard customer actions by permission | Pharmacists may create/edit; deletes should be admin-only |
| `apps/pharmaOS-main (3)/frontend/src/pages/Orders.jsx` | Order status actions are always available | Guard order status transitions by role/permission | Dispatch/rider/admin workflows differ |
| `apps/pharmaOS-main (3)/frontend/src/pages/Prescriptions.jsx` | Verify/reject actions are always available to page viewers | Guard verify/reject/dispatch actions | Pharmacists verify; dispatch handles delivery |
| `apps/pharmaOS-main (3)/frontend/src/pages/Reports.jsx` | Report export relies on sidebar hiding only | Protect route and export buttons | Reports contain sensitive business data |
| `apps/pharmaOS-main (3)/frontend/src/pages/Settings.jsx` | Settings page route and save action are not role-protected | Protect route and save action | Settings should be admin/super-admin only |
| `apps/pharmaOS-main (3)/frontend/src/pages/Expenses.jsx` | Finance write actions are not permission-guarded | Guard create/edit/delete expense actions | Finance/admin only |
| `apps/pharmaOS-main (3)/frontend/src/pages/Incomes.jsx` | Finance write actions are not permission-guarded | Guard create/edit/delete income actions | Finance/admin only |
| `apps/pharmaOS-main (3)/frontend/src/pages/Tax.jsx` | Tax entries are not permission-guarded | Guard tax creation/editing | Finance/admin only |
| `apps/pharmaOS-main (3)/frontend/src/pages/Transactions.jsx` | Page exists but is not routed | Add route with transaction permission | Finance/manager/admin need transaction visibility |
| `apps/pharmaOS-main (3)/frontend/src/pages/Analytics.jsx` | Page exists but is not routed | Add route with analytics permission | Manager/admin/finance need analytics |
| `apps/pharmaOS-main (3)/frontend/src/pages/Inventory.jsx` | Page exists but is not routed and appears to contain code issues | Either fix and route it or replace with existing stock/product pages | Avoid broken navigation from `Navbar.jsx` |
| `apps/pharmaOS-main (3)/frontend/src/pages/Import.jsx` | Page exists but is not routed | Add route with `import_stock` permission | Admin/receiving need import access |

## 6. IMPLEMENTATION PHASES

### Phase 1 — Foundation (Config Files)

Priority: least risky, required before everything else.

Files to create:

- `src/config/roles.js`
- `src/config/permissions.js`
- `src/config/navigation.js`
- `src/config/routes.js`
- `src/config/dashboards.js`

Why this comes first:

- All later phases depend on role names, permission names, route metadata, and navigation metadata.
- This prevents developers from adding more hard-coded checks while implementing RBAC.

What depends on this phase:

- `AuthContext.jsx`
- route guards
- sidebar
- dashboards
- page action guards
- backend permission alignment

Deliverables:

- One canonical list of roles.
- One canonical list of permissions.
- One mapping of roles to permissions.
- One navigation config.
- One route config.
- One dashboard landing config.

### Phase 2 — Authentication Enhancement

Files to modify:

- `src/context/AuthContext.jsx`
- `src/pages/Login.jsx`
- `src/components/layout/Navbar.jsx`

What changes:

- Normalize the authenticated user object.
- Expose a consistent role field.
- Expose permissions from backend if available.
- If backend does not yet send permissions, derive them temporarily from `ROLE_PERMISSIONS`.
- Redirect users to role-specific dashboards after login.
- Replace local role formatting with shared role label helpers.

Why:

- The app currently assumes `user.userType` everywhere.
- The rest of the RBAC system needs reliable role and permission data.

Important note:

Frontend-derived permissions are acceptable only as a temporary UI fallback. Backend must become the final authority.

### Phase 3 — Route Protection

Files to create:

- `src/components/auth/RequireAuth.jsx`
- `src/components/auth/RequirePermission.jsx`
- `src/pages/Unauthorized.jsx`

Files to modify:

- `src/App.jsx`
- `src/components/auth/ProtectedRoute.jsx`

What changes:

- Split authentication and authorization.
- Protect every business route with required permissions.
- Add unauthorized handling for logged-in users without access.
- Generate routes from `config/routes.js` or use the route config as the source of required permissions.

Why:

- This is the main fix for direct URL access.
- It ensures a rider cannot type `/reports`, `/settings`, `/products`, or `/purchases` and see unauthorized pages.

### Phase 4 — Navigation (Sidebar)

Files to modify:

- `src/components/layout/Sidebar.jsx`

Files to use:

- `src/config/navigation.js`
- `src/hooks/usePermissions.js`

What changes:

- Remove hard-coded `navItems`.
- Remove `adminOnly`.
- Filter navigation items by permission.
- Filter submenu items individually.
- Hide parent groups when all children are hidden.

Why:

- Sidebar should reflect the same access rules as routes.
- Navigation visibility should be driven by permissions, not role-specific conditionals.

### Phase 5 — Role Dashboards

Files to create:

- `src/pages/dashboards/SuperAdminDashboard.jsx`
- `src/pages/dashboards/AdminDashboard.jsx`
- `src/pages/dashboards/ManagerDashboard.jsx`
- `src/pages/dashboards/PharmacistDashboard.jsx`
- `src/pages/dashboards/FinanceDashboard.jsx`
- `src/pages/dashboards/DispatchDashboard.jsx`
- `src/pages/dashboards/RiderDashboard.jsx`
- `src/pages/dashboards/ReceivingBayDashboard.jsx`

Files to modify:

- `src/App.jsx`
- `src/pages/Dashboard.jsx`

What each dashboard shows:

| Dashboard | Main Content |
|---|---|
| Super Admin | User management, role management, all KPIs, audit alerts |
| Admin | Operational KPIs, orders, low stock, prescriptions, reports shortcut |
| Manager | Analytics, stock summaries, sales/purchase trends, due list |
| Pharmacist | POS shortcut, prescription queue, current stock lookup, sales summary |
| Finance | Income/expense summary, due balances, transactions, tax alerts |
| Dispatch | Orders ready for dispatch, active deliveries, rider workload |
| Rider | Assigned deliveries, delivery status actions, completed deliveries |
| Receiving Bay | Incoming purchases, supplier list, low stock, stock receiving tasks |

Why:

- A dashboard is a role's home screen.
- One shared dashboard creates noise and accidental data exposure.

### Phase 6 — Page Level Permissions

Files to modify:

- `src/pages/Products.jsx`
- `src/pages/StockList.jsx`
- `src/pages/Purchases.jsx`
- `src/pages/PurchaseNew.jsx`
- `src/pages/Suppliers.jsx`
- `src/pages/Customers.jsx`
- `src/pages/Orders.jsx`
- `src/pages/Prescriptions.jsx`
- `src/pages/Reports.jsx`
- `src/pages/Settings.jsx`
- `src/pages/Expenses.jsx`
- `src/pages/Incomes.jsx`
- `src/pages/Tax.jsx`
- `src/pages/Sales/POSView.jsx`
- `src/pages/Sales/PharmacistPOS.jsx`

What changes:

- Hide or disable buttons based on permissions.
- Guard sensitive operations before calling APIs.
- Protect create/edit/delete/export/approve/dispatch actions.

Why this phase is later:

- Route-level protection must be correct first.
- Action-level permissions are detailed and should use the central permission helpers from previous phases.

Examples:

- `delete_products` controls product delete buttons.
- `export_reports` controls PDF/CSV report buttons.
- `verify_prescriptions` controls prescription approval.
- `dispatch_orders` controls dispatch actions.
- `update_assigned_deliveries` controls rider delivery updates.

### Phase 7 — Testing and Verification

What to test:

- Login as each role.
- Confirm each role lands on the correct dashboard.
- Confirm sidebar only shows allowed links.
- Confirm direct URL access is blocked for unauthorized routes.
- Confirm allowed routes still work.
- Confirm restricted action buttons are hidden or disabled.
- Confirm backend rejects unauthorized API calls even if frontend is bypassed.

Manual verification checklist by role:

| Role | Must Verify |
|---|---|
| SUPER_ADMIN | Can access every page and all actions |
| ADMIN | Can manage operations but not super-admin-only role management |
| MANAGER | Can view reports/analytics but cannot mutate sensitive records |
| PHARMACIST | Can use POS and prescriptions but cannot access finance/settings |
| FINANCE | Can access finance pages and reports but cannot use POS/stock editing |
| DISPATCH | Can access order dispatch workflows only |
| RIDER | Can only access assigned delivery workflow |
| RECEIVING_BAY | Can receive stock and manage purchases/suppliers but not finance/settings |

Automated test categories:

- Auth guard tests.
- Permission guard tests.
- Sidebar filtering tests.
- Dashboard redirect tests.
- Action-level permission tests.

## 7. FOLDER STRUCTURE

Target structure after implementation:

```text
apps/pharmaOS-main (3)/frontend/src/
  App.jsx                         [MODIFIED]
  main.jsx
  index.css

  auth/
    RequireAuth.jsx               [NEW]
    RequirePermission.jsx         [NEW]

  components/
    auth/
      ProtectedRoute.jsx          [MODIFIED OR REPLACED]
    layout/
      Header.jsx
      Navbar.jsx                  [MODIFIED]
      PageWrapper.jsx
      Sidebar.jsx                 [MODIFIED]
    forms/
      OrderModal.jsx              [MAY NEED ACTION GUARDS]
      ProductModal.jsx            [MAY NEED ACTION GUARDS]
    templates/
      FormTemplate.jsx
      ListTemplate.jsx
    ui/
      Badge.jsx
      Button.jsx
      Card.jsx
      ConfirmModal.jsx
      EmptyState.jsx
      Input.jsx
      LoadingSpinner.jsx
      Modal.jsx
      ProductCard.jsx
      Select.jsx
      Table.jsx

  config/
    roles.js                      [NEW]
    permissions.js                [NEW]
    navigation.js                 [NEW]
    routes.js                     [NEW]
    dashboards.js                 [NEW]

  context/
    AuthContext.jsx               [MODIFIED]
    ToastContext.jsx

  hooks/
    usePermissions.js             [NEW]
    useAlerts.js
    useAnalytics.js
    useCustomers.js
    useExpenses.js
    useIncomes.js
    useLocalStorage.js
    useOrders.js
    usePrescriptions.js
    useProducts.js
    usePurchases.js
    useSettings.js
    useSuppliers.js
    useTransactions.js

  pages/
    Unauthorized.jsx              [NEW]
    Dashboard.jsx                 [MODIFIED OR DEPRECATED]
    Login.jsx                     [MODIFIED]
    Products.jsx                  [MODIFIED]
    StockList.jsx                 [MODIFIED]
    Purchases.jsx                 [MODIFIED]
    PurchaseNew.jsx               [MODIFIED]
    Suppliers.jsx                 [MODIFIED]
    Customers.jsx                 [MODIFIED]
    Orders.jsx                    [MODIFIED]
    Prescriptions.jsx             [MODIFIED]
    Reports.jsx                   [MODIFIED]
    Settings.jsx                  [MODIFIED]
    Expenses.jsx                  [MODIFIED]
    Incomes.jsx                   [MODIFIED]
    Tax.jsx                       [MODIFIED]
    Transactions.jsx              [MODIFIED/ROUTED]
    Analytics.jsx                 [MODIFIED/ROUTED]
    Inventory.jsx                 [REVIEW/FIX OR REMOVE FROM NAV]
    Import.jsx                    [MODIFIED/ROUTED]

    dashboards/
      SuperAdminDashboard.jsx     [NEW]
      AdminDashboard.jsx          [NEW]
      ManagerDashboard.jsx        [NEW]
      PharmacistDashboard.jsx     [NEW]
      FinanceDashboard.jsx        [NEW]
      DispatchDashboard.jsx       [NEW]
      RiderDashboard.jsx          [NEW]
      ReceivingBayDashboard.jsx   [NEW]

    Sales/
      POSView.jsx                 [MODIFIED]
      PharmacistPOS.jsx           [MODIFIED]
      SalesList.jsx

  services/
    api.js

  utils/
    formatCurrency.js
    formatDate.js
    reportGenerators.js
    statusColor.js
```

## 8. IMPLEMENTATION RULES

- Use one source of truth for all roles and permissions.
- Never hard-code role strings inside page components.
- Do not use `user.userType === 'ADMIN'` directly in UI logic.
- Use central permission helpers such as `can('edit_products')`.
- Protect routes before protecting buttons.
- Sidebar filtering must use the same permissions as route protection.
- Backend must enforce the same permissions. Frontend permissions are for UX, not security.
- Do not infer permissions from failed API calls.
- Do not hide a link without also protecting its route.
- Do not protect a route without also protecting sensitive backend APIs.
- Every route should declare its required permission.
- Every sensitive action should declare its required permission.
- Use role-specific dashboards instead of one shared dashboard with hidden sections.
- Keep role labels and role formatting in `config/roles.js`.
- Keep dashboard landing paths in `config/dashboards.js`.
- Keep sidebar links in `config/navigation.js`.
- Keep route requirements in `config/routes.js`.
- If backend sends permissions, trust backend permissions over frontend-derived permissions.
- If backend does not yet send permissions, frontend may temporarily derive permissions from role config, but backend alignment must be tracked as a required follow-up.

## 9. COMMON MISTAKES TO AVOID

### Mistake 1: Only Hiding Sidebar Links

Problem:

The current app hides `Reports` from non-admin users but still leaves `/reports` accessible by direct URL.

Avoidance:

Every hidden sidebar link must also have route-level permission protection.

### Mistake 2: Hard-Coding Roles Everywhere

Problem:

Checks like `user.userType === 'ADMIN'` become scattered and hard to maintain.

Avoidance:

Use `can(permission)` from `usePermissions.js`.

### Mistake 3: Treating Frontend RBAC As Security

Problem:

Users can bypass frontend checks by calling APIs directly.

Avoidance:

Backend must enforce every permission.

### Mistake 4: Mixing Roles And Permissions

Problem:

Roles describe jobs. Permissions describe actions. Mixing them makes access rules rigid.

Avoidance:

Use roles only to assign permissions. Use permissions to guard UI/routes/actions.

### Mistake 5: Using Failed Requests As Permission Checks

Problem:

`Dashboard.jsx` currently treats failed API calls as restricted sections.

Avoidance:

Load permissions explicitly and decide UI access before making restricted requests.

### Mistake 6: Forgetting Action-Level Guards

Problem:

A user may be allowed to view a page but not allowed to delete or export.

Avoidance:

Guard buttons and handlers separately from page routes.

### Mistake 7: Forgetting Unrouted Pages

Problem:

`Analytics.jsx`, `Inventory.jsx`, `Import.jsx`, and `Transactions.jsx` exist but are not currently routed.

Avoidance:

Route them intentionally with permissions or remove navigation paths that point to them.

### Mistake 8: Inconsistent User Field Names

Problem:

The app currently expects `user.userType`. Backend might use `role`.

Avoidance:

Normalize the user object in `AuthContext.jsx`.

### Mistake 9: Giving Riders Too Much Data

Problem:

Riders should not see full customer lists, product lists, finance data, or reports.

Avoidance:

Use assigned-delivery permissions only.

### Mistake 10: Building Dashboards Before Permissions

Problem:

Dashboards built before permission config often duplicate access logic.

Avoidance:

Build role and permission config first, then dashboards.

## 10. SUCCESS CRITERIA

Implementation is complete when all items below are true.

### Configuration

- [ ] All roles are defined in `config/roles.js`.
- [ ] All permissions are defined in `config/permissions.js`.
- [ ] Role-to-permission mapping exists in one place.
- [ ] Navigation is defined in `config/navigation.js`.
- [ ] Routes are defined or permission-mapped in `config/routes.js`.
- [ ] Dashboard landing paths are defined in `config/dashboards.js`.

### Authentication

- [ ] `AuthContext.jsx` exposes normalized user data.
- [ ] `AuthContext.jsx` exposes permissions.
- [ ] Login redirects each role to the correct landing dashboard.
- [ ] Role display labels come from shared config.

### Route Protection

- [ ] Unauthenticated users are redirected to `/login`.
- [ ] Authenticated but unauthorized users are redirected to `Unauthorized.jsx`.
- [ ] Direct URL access is blocked for unauthorized roles.
- [ ] `/reports` is no longer accessible to `RIDER`, `DISPATCH`, `PHARMACIST`, or `RECEIVING_BAY` unless explicitly permitted.
- [ ] `/settings` is only accessible to `SUPER_ADMIN` and `ADMIN`.
- [ ] Finance pages are only accessible to `SUPER_ADMIN`, `ADMIN`, and `FINANCE`.

### Sidebar

- [ ] Sidebar is generated from central navigation config.
- [ ] Sidebar no longer uses `adminOnly`.
- [ ] Parent menu items disappear when all child items are unauthorized.
- [ ] Each role sees only relevant links.

### Dashboards

- [ ] Each of the 8 roles has a dedicated dashboard.
- [ ] `/` resolves to the correct dashboard for the logged-in role.
- [ ] Dashboard content matches the role's workflow.
- [ ] Dashboard permissions are not inferred from failed API calls.

### Page Actions

- [ ] Product create/edit/delete buttons obey permissions.
- [ ] Stock add/edit/delete/import actions obey permissions.
- [ ] Purchase actions obey permissions.
- [ ] Supplier actions obey permissions.
- [ ] Customer actions obey permissions.
- [ ] Order status actions obey permissions.
- [ ] Prescription verify/reject actions obey permissions.
- [ ] Report export buttons obey permissions.
- [ ] Settings save action obeys permissions.
- [ ] Finance create/edit/delete actions obey permissions.

### Backend Alignment

- [ ] Backend exposes role and/or permissions through `/auth/me`.
- [ ] Backend enforces the same permission vocabulary.
- [ ] Unauthorized API calls return 403.
- [ ] Frontend does not rely on UI hiding as the only protection.

### Manual Role Verification

- [ ] `SUPER_ADMIN` can access everything.
- [ ] `ADMIN` can manage operations but not super-admin-only role management.
- [ ] `MANAGER` can view analytics/reports/operations but not perform sensitive mutations.
- [ ] `PHARMACIST` can use POS and prescriptions but cannot access finance/settings.
- [ ] `FINANCE` can access finance/reporting but cannot edit stock or use POS.
- [ ] `DISPATCH` can manage dispatch workflows but cannot access finance/settings.
- [ ] `RIDER` can only access assigned delivery workflows.
- [ ] `RECEIVING_BAY` can receive stock and manage purchases/suppliers but cannot access finance/settings.

### Final Acceptance

- [ ] No route is protected by authentication only if it contains business data.
- [ ] No sidebar item appears without matching route permission.
- [ ] No sensitive page action is available without a permission check.
- [ ] No page contains hard-coded role checks when a permission helper should be used.
- [ ] The RBAC implementation is documented and understandable to a new developer.
