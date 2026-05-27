# PharmaOS Frontend RBAC Architecture Review

## Scope

This document reviews the current frontend implementation in:

`apps/pharmaOS-main (3)/frontend/src/`

It explains how routing, authentication, roles, sidebar navigation, and dashboards currently work, then proposes a proper role-based access control architecture for the pharmacy system.

No application code was changed as part of this review.

## Executive Summary

The frontend currently has authentication protection, but it does not have true frontend authorization.

Every protected route uses the same `ProtectedRoute` component, and that component only checks whether the user is logged in. It does not check the user's role, permissions, or allowed pages.

The sidebar hides the `Reports` link for non-admin users, but this is only navigation filtering. The `/reports` route itself is still registered and still accessible by directly typing the URL if the user is authenticated.

The app has one shared dashboard for all roles. It does not route users to role-specific dashboards. Instead, the dashboard attempts several API calls and hides sections when calls fail. That is not a clean RBAC model.

The role model is currently scattered across:

- `pages/Login.jsx`
- `components/layout/Sidebar.jsx`
- `components/layout/Navbar.jsx`
- `pages/Dashboard.jsx`
- `context/AuthContext.jsx`

The system needs a centralized permission matrix, role-aware route protection, role-based dashboards, and a sidebar generated from permissions rather than hard-coded role checks.

## Current Routing

Routing is defined in:

`apps/pharmaOS-main (3)/frontend/src/App.jsx`

The application uses React Router:

- `BrowserRouter`
- `Routes`
- `Route`
- `Navigate`

Relevant lines:

- Providers are mounted in `App.jsx:42-44`.
- Routes begin in `App.jsx:45`.
- `/login` is public in `App.jsx:46`.
- All business routes are wrapped in `ProtectedRoute`, starting at `App.jsx:49`.
- The fallback redirects unknown paths to `/` in `App.jsx:100`.

Current routes include:

- `/`
- `/login`
- `/sales/new`
- `/pos`
- `/sales`
- `/purchases/new`
- `/purchases`
- `/orders`
- `/prescriptions`
- `/products`
- `/products/barcodes`
- `/customers`
- `/customers/new`
- `/suppliers`
- `/suppliers/new`
- `/incomes`
- `/expenses`
- `/tax`
- `/due-list`
- `/reports`
- `/settings`
- `/stock/current`
- `/stock/expired`
- `/stock/low`
- `/stock/outofstock`

Some source files exist but are not routed in `App.jsx`:

- `pages/Analytics.jsx`
- `pages/Inventory.jsx`
- `pages/Import.jsx`
- `pages/Transactions.jsx`

This creates inconsistencies. For example, `Navbar.jsx:359` navigates to `/inventory?status=expired`, but `/inventory` is not registered in `App.jsx`. That means the user will hit the fallback route and be redirected to `/`.

## Current ProtectedRoute Behavior

`ProtectedRoute` is defined in:

`apps/pharmaOS-main (3)/frontend/src/components/auth/ProtectedRoute.jsx`

Relevant lines:

- It reads `isAuthenticated` and `loading` from `useAuth()` in `ProtectedRoute.jsx:5`.
- It shows a loading screen while auth is loading in `ProtectedRoute.jsx:8-17`.
- It redirects unauthenticated users to `/login` in `ProtectedRoute.jsx:19-22`.
- It renders children for any authenticated user in `ProtectedRoute.jsx:25`.

Current behavior:

```text
If loading:
  Show session verification UI

Else if not authenticated:
  Redirect to /login

Else:
  Render requested page
```

What it does not do:

- It does not check `user.userType`.
- It does not check allowed roles.
- It does not check permissions.
- It does not block direct URL access by role.
- It does not render an unauthorized page.

This means `ProtectedRoute` is really an authentication guard, not an authorization guard.

## Current Sidebar Behavior

The sidebar is defined in:

`apps/pharmaOS-main (3)/frontend/src/components/layout/Sidebar.jsx`

The navigation list is hard-coded in `Sidebar.jsx:24-84`.

Only one item has a role-related flag:

```text
Sidebar.jsx:82
{ to: '/reports', label: 'Reports', icon: BarChart3, adminOnly: true }
```

The filtering happens in `Sidebar.jsx:143-145`:

```text
item is shown if:
  it is not adminOnly
  OR user.userType === 'ADMIN'
  OR user.userType === 'SUPER_ADMIN'
```

This means the `Reports` link is removed from the rendered sidebar DOM for non-admin users.

However, this only affects navigation visibility. It does not protect the `/reports` route itself. The route is still defined in `App.jsx:82` as:

```text
/reports -> ProtectedRoute -> Reports
```

Because `ProtectedRoute` only checks login state, a non-admin authenticated user can still manually type `/reports`.

Other sidebar links are visible to every authenticated role:

- Sales
- Purchases
- Stock List
- Products
- Customer
- Supplier
- Online Orders
- Prescriptions
- Incomes
- Expenses
- Tax
- Due List
- Settings

That is not appropriate for a multi-role pharmacy system.

## Current Dashboard Behavior

The dashboard is defined in:

`apps/pharmaOS-main (3)/frontend/src/pages/Dashboard.jsx`

There is one dashboard component for every role.

Relevant lines:

- Dashboard component starts at `Dashboard.jsx:73`.
- Local `permissions` state is initialized at `Dashboard.jsx:86-91`.
- Dashboard data is fetched at `Dashboard.jsx:102-197`.
- The dashboard uses `Promise.allSettled` at `Dashboard.jsx:106-113`.
- Failed API calls are interpreted as missing access at `Dashboard.jsx:135-145`.
- Sections show `AccessDenied` if local permission flags are false.

This is not true role-based dashboard design.

Current dashboard permission behavior is based on API success or failure:

```text
Try products API
Try orders API
Try analytics APIs

If products request fails:
  hide product sections

If analytics request fails:
  hide analytics sections
```

This creates several problems:

- The dashboard does not know the user's intended role.
- It does not know what the user should see before making API calls.
- It relies on failed requests to decide UI permissions.
- It mixes data loading, authorization inference, and presentation.
- It does not provide a purpose-built dashboard for each role.

There are no checks like `user.role === 'ADMIN'` or `user.userType === 'ADMIN'` in `Dashboard.jsx`.

## Current Authentication And User Model

Authentication is defined in:

`apps/pharmaOS-main (3)/frontend/src/context/AuthContext.jsx`

Relevant lines:

- Auth context is created at `AuthContext.jsx:6`.
- `user` state is initialized at `AuthContext.jsx:26`.
- `token` is read from localStorage at `AuthContext.jsx:27`.
- `refreshToken` is read from localStorage at `AuthContext.jsx:28`.
- `/auth/me` is called at `AuthContext.jsx:189`.
- Login calls `/auth/login` at `AuthContext.jsx:209`.
- Login expects `user`, `token`, and `refreshToken` from the response at `AuthContext.jsx:210`.
- `user`, `token`, `refreshToken`, `isAuthenticated`, `loading`, `login`, and `logout` are exposed at `AuthContext.jsx:241-249`.

The app expects the user object to contain:

- `name`
- `email`
- `userType`

Evidence:

- `Sidebar.jsx:216-225` displays initials, name, email, and `user.userType`.
- `Navbar.jsx:263-265` derives display name, role, and initials from `user`.
- `Navbar.jsx:264` formats `user.userType`.
- `Sidebar.jsx:144` checks `user.userType` for admin-only navigation.

The current role field is `userType`, not `role`.

This matters because many RBAC implementations use `role`. If the backend sends `role` instead of `userType`, current frontend checks will fail.

## Current Role Definitions

The only complete frontend list of roles is in:

`apps/pharmaOS-main (3)/frontend/src/pages/Login.jsx`

Relevant lines:

- `USER_TYPES` begins at `Login.jsx:7`.
- Roles listed in `Login.jsx:9-80`.

Current roles:

- `SUPER_ADMIN`
- `ADMIN`
- `FINANCE`
- `MANAGER`
- `PHARMACIST`
- `RECEIVING_BAY`
- `DISPATCH`
- `RIDER`

These are currently used for demo login selection, not for centralized authorization.

## Current Role Usage Across The App

Role usage is limited and scattered.

`Login.jsx`

- Defines role demo options in `Login.jsx:7-88`.
- Uses selected role only to autofill email/password in `Login.jsx:107-111`.

`Sidebar.jsx`

- Uses `user.userType` to hide `Reports` from non-admins in `Sidebar.jsx:144`.
- Displays formatted role in `Sidebar.jsx:225`.

`Navbar.jsx`

- Formats `user.userType` in `Navbar.jsx:15-18`.
- Displays role in `Navbar.jsx:380` and `Navbar.jsx:394`.

`Dashboard.jsx`

- Does not check actual role.
- Uses local API-failure-derived permission flags in `Dashboard.jsx:86-91`.

`ProtectedRoute.jsx`

- Does not check role.

## What Is Wrong With The Current Role Implementation

### 1. Sidebar Hiding Is Mistaken For Security

Removing a link from the sidebar does not protect the route.

Example:

- Sidebar hides `Reports` for non-admins at `Sidebar.jsx:143-145`.
- But `/reports` is still registered at `App.jsx:82`.
- `ProtectedRoute` only checks authentication at `ProtectedRoute.jsx:19`.

So an authenticated `RIDER`, `DISPATCH`, or `PHARMACIST` can type `/reports` manually and reach the page unless the backend blocks the data request.

### 2. There Is No Central Permission Matrix

There is no file like:

- `config/roles.js`
- `config/permissions.js`
- `config/navigation.js`
- `config/routes.js`

Because of that, access logic is scattered and will become harder to maintain as roles grow.

### 3. One Dashboard Serves Every Role

The dashboard should reflect the user's job.

A rider should not land on a dashboard containing revenue, suppliers, expired products, and top customers.

A finance user should not land on a POS-first dashboard.

A pharmacist should not need executive analytics as their primary workspace.

### 4. API Failure Is Used As Permission Detection

`Dashboard.jsx` treats rejected API calls as permission failures.

That is fragile. A request can fail because of:

- network error
- server error
- expired token
- invalid query
- backend downtime
- actual 403

Those are different states and should not all become "Access Denied."

### 5. User Shape Is Not Normalized

The frontend assumes `user.userType`. There is no normalization layer that guarantees:

```text
user.id
user.name
user.email
user.role
user.userType
user.permissions
```

The app should normalize the backend response once in `AuthContext` rather than forcing components to know backend naming details.

### 6. Routes And Sidebar Are Not Driven By The Same Source

Routes live in `App.jsx`.

Sidebar links live in `Sidebar.jsx`.

Permissions are not declared in either in a consistent way.

This creates drift. A link can be hidden while the route remains open, or a route can exist without a sidebar entry.

## Architecture Concepts

### Authentication

Authentication answers:

```text
Who are you?
```

Examples:

- Login with email/password.
- Validate access token.
- Refresh token.
- Load current user with `/auth/me`.

In this app, authentication is handled by `AuthContext.jsx`.

### Authorization

Authorization answers:

```text
Are you allowed to do this?
```

Examples:

- Can this user open `/settings`?
- Can this user export reports?
- Can this user delete products?
- Can this user mark an order as delivered?

This app currently lacks proper frontend authorization.

### Roles

Roles are job labels or responsibility groups.

Examples:

- `ADMIN`
- `PHARMACIST`
- `RIDER`
- `FINANCE`

Roles should not be checked everywhere manually. They should map to permissions.

### Permissions

Permissions are specific capabilities.

Examples:

- `dashboard.admin.view`
- `products.read`
- `products.create`
- `products.update`
- `products.delete`
- `orders.read`
- `orders.dispatch`
- `orders.deliver`
- `reports.export`
- `settings.update`

Permissions are more scalable than role checks because future roles can be assembled from existing permissions.

### Access Control

Access control is the complete enforcement system.

It includes:

- route guards
- sidebar filtering
- button/action filtering
- API endpoint authorization
- backend policy checks
- audit logging

The frontend improves usability. The backend enforces security.

## How Enterprise Systems Design RBAC Dashboards

Enterprise systems usually follow this structure:

1. Authenticate user.
2. Load user profile and permissions.
3. Resolve the user's default landing page.
4. Generate sidebar from allowed navigation items.
5. Protect every route with required permissions.
6. Protect every sensitive button/action with required permissions.
7. Enforce the same permissions on backend endpoints.

The key pattern:

```text
Role -> Permissions -> Navigation + Routes + Actions
```

The app should avoid this pattern:

```text
If userType === 'ADMIN' in random components
```

That works for prototypes, but it becomes brittle quickly.

## Recommended Frontend Architecture

### Separate Dashboards Per Role

Recommended dashboard pages:

- `SuperAdminDashboard.jsx`
- `AdminDashboard.jsx`
- `ManagerDashboard.jsx`
- `PharmacistDashboard.jsx`
- `FinanceDashboard.jsx`
- `DispatchDashboard.jsx`
- `RiderDashboard.jsx`
- `ReceivingBayDashboard.jsx`

The `/` route should redirect the user to their role-specific dashboard after login.

Example landing paths:

- `/dashboard/super-admin`
- `/dashboard/admin`
- `/dashboard/manager`
- `/dashboard/pharmacist`
- `/dashboard/finance`
- `/dashboard/dispatch`
- `/dashboard/rider`
- `/dashboard/receiving`

### Dynamic Sidebar Per Role

The sidebar should not hard-code `adminOnly`.

Instead, every navigation item should declare required permissions.

The sidebar should render:

```text
navigationItems.filter(item => canAccess(item.requiredPermissions))
```

Sub-items should be filtered independently.

If a parent menu has no visible children, remove the parent menu too.

### Route Protection Beyond Login

Protected routes should support permissions.

Conceptually:

```text
RequireAuth:
  checks login

RequirePermission:
  checks permission

RequireRole:
  optional helper for rare role-only cases
```

Routes should declare required permissions in one place.

### Permission Matrix

A permission matrix should define:

```text
ROLE -> [PERMISSIONS]
```

Routes and navigation should use permissions, not hard-coded roles.

## Recommended Role Access For This Pharmacy System

### SUPER_ADMIN

Purpose:

Owns the whole system.

Dashboard:

- Super Admin dashboard

Pages:

- All dashboards
- Products
- Stock
- Purchases
- Suppliers
- Customers
- Orders
- Prescriptions
- Incomes
- Expenses
- Tax
- Due List
- Transactions
- Reports
- Analytics
- Settings
- User management
- Role management
- Audit logs

Sidebar:

- Everything

Workflows:

- Manage system configuration.
- Manage users and roles.
- View all business data.
- Export reports.
- Override operational workflows.

### ADMIN

Purpose:

Runs pharmacy operations.

Dashboard:

- Admin operations dashboard

Pages:

- Dashboard
- Products
- Stock
- Purchases
- Suppliers
- Customers
- Orders
- Prescriptions
- Reports
- Settings

Sidebar:

- Dashboard
- Sales overview
- Products
- Stock
- Purchases
- Suppliers
- Customers
- Orders
- Prescriptions
- Reports
- Settings

Workflows:

- Oversee sales and stock.
- Manage product catalog.
- Manage supplier and purchase records.
- Review operational reports.
- Configure pharmacy settings.

### MANAGER

Purpose:

Supervises daily business performance.

Dashboard:

- Manager dashboard

Pages:

- Dashboard
- Analytics
- Reports
- Products read-only
- Stock read-only
- Purchases read-only or approval
- Suppliers read-only
- Customers read-only
- Orders
- Due List

Sidebar:

- Dashboard
- Analytics
- Reports
- Stock
- Orders
- Purchases
- Customers
- Due List

Workflows:

- Monitor KPIs.
- Review low stock and expired stock.
- Review orders.
- Review purchase trends.
- Review customer balances.

### PHARMACIST

Purpose:

Handles in-pharmacy sales and prescription work.

Dashboard:

- Pharmacist POS dashboard or POS directly

Pages:

- POS
- Sales New
- Sales List
- Prescriptions
- Customers
- Current Stock
- Products read-only

Sidebar:

- POS
- Sales
- Prescriptions
- Customers
- Current Stock

Workflows:

- Create sales.
- Dispense medicine.
- Verify prescriptions.
- Search stock availability.
- Add or select customers during checkout.

### FINANCE

Purpose:

Manages money, reports, and reconciliation.

Dashboard:

- Finance dashboard

Pages:

- Incomes
- Expenses
- Tax
- Due List
- Transactions
- Reports
- Analytics financial sections
- Customers read-only

Sidebar:

- Dashboard
- Incomes
- Expenses
- Tax
- Due List
- Transactions
- Reports

Workflows:

- Record income and expenses.
- Track taxes and licenses.
- Review due balances.
- Export financial reports.
- Reconcile daily/monthly totals.

### DISPATCH

Purpose:

Coordinates delivery operations.

Dashboard:

- Dispatch dashboard

Pages:

- Orders
- Prescriptions ready for dispatch
- Delivery queue
- Rider assignment

Sidebar:

- Dashboard
- Orders
- Dispatch Queue
- Riders

Workflows:

- See orders ready for delivery.
- Assign orders to riders.
- Mark orders as out for delivery.
- Monitor delivery progress.

### RIDER

Purpose:

Completes assigned deliveries.

Dashboard:

- Rider dashboard

Pages:

- My Deliveries
- Delivery Details
- Profile

Sidebar:

- My Deliveries
- Completed Deliveries
- Profile

Workflows:

- View assigned deliveries.
- See minimal customer delivery details.
- Mark picked up.
- Mark delivered.
- Mark failed delivery.

Important:

Riders should not access products, reports, settings, finance, purchases, suppliers, or full customer lists.

### RECEIVING_BAY

Purpose:

Handles stock receiving and supplier deliveries.

Dashboard:

- Receiving Bay dashboard

Pages:

- Purchases
- Purchase New
- Suppliers
- Products read/create limited
- Stock
- Current Stock
- Low Stock
- Expired Stock

Sidebar:

- Dashboard
- Purchases
- Suppliers
- Stock
- Products

Workflows:

- Receive purchased stock.
- Record batch numbers and expiry dates.
- Update stock quantities.
- Register supplier deliveries.
- Flag damaged, expired, or missing items.

## Recommended Folder Structure

Recommended additions:

```text
src/
  auth/
    RequireAuth.jsx
    RequirePermission.jsx
    usePermissions.js

  config/
    roles.js
    permissions.js
    navigation.js
    routes.js
    dashboards.js

  pages/
    dashboards/
      SuperAdminDashboard.jsx
      AdminDashboard.jsx
      ManagerDashboard.jsx
      PharmacistDashboard.jsx
      FinanceDashboard.jsx
      DispatchDashboard.jsx
      RiderDashboard.jsx
      ReceivingBayDashboard.jsx
    Unauthorized.jsx
```

Possible future structure:

```text
src/features/
  products/
  orders/
  prescriptions/
  purchases/
  finance/
  dispatch/
  reports/
```

That would group pages, hooks, and components by business domain rather than by technical category.

## Recommended Permission Config Structure

The permission config should have four major sections:

1. Permission constants.
2. Role-to-permission mapping.
3. Route-to-permission mapping.
4. Sidebar-to-permission mapping.

Conceptual shape:

```text
PERMISSIONS:
  products.read
  products.create
  products.update
  products.delete
  stock.read
  sales.create
  sales.read
  prescriptions.review
  orders.read
  orders.update
  orders.dispatch
  deliveries.read.assigned
  deliveries.update.assigned
  finance.read
  finance.write
  reports.read
  reports.export
  settings.read
  settings.update
  users.manage

ROLE_PERMISSIONS:
  SUPER_ADMIN:
    all

  ADMIN:
    products.*
    stock.*
    purchases.*
    suppliers.*
    orders.*
    prescriptions.*
    reports.read
    settings.update

  PHARMACIST:
    sales.create
    sales.read
    prescriptions.review
    products.read
    stock.read
    customers.read

  RIDER:
    deliveries.read.assigned
    deliveries.update.assigned
```

Use constants in real implementation to avoid typo bugs.

## Backend And Frontend Permission Coordination

The backend should be the source of truth.

Recommended `/auth/me` response:

```text
{
  id,
  name,
  email,
  userType,
  permissions
}
```

The frontend should use `permissions` to:

- build sidebar
- guard routes
- hide buttons
- choose dashboard landing page

The backend must use the same permissions to:

- protect API endpoints
- restrict returned data
- prevent unauthorized mutations
- audit sensitive actions

Examples:

- A rider can only read assigned deliveries.
- A finance user can read financial reports but cannot update product stock.
- A pharmacist can create sales but cannot change global settings.
- A receiving bay user can receive stock but cannot export financial reports.

Never rely on frontend checks for security. Frontend checks are for user experience. Backend checks are the actual lock.

## Common RBAC Mistakes To Avoid

### Mistake 1: Hiding Sidebar Links Only

This app currently has this issue with `Reports`.

Always protect the route and the API, not just the link.

### Mistake 2: Hard-Coding Role Checks Everywhere

Avoid:

```text
user.userType === 'ADMIN'
```

spread across many components.

Prefer:

```text
can('reports.export')
```

### Mistake 3: Using API Errors As Permissions

Do not infer permissions from failed dashboard requests.

Load permissions explicitly.

### Mistake 4: Giving Roles Too Much Access

Do not let every authenticated user see all pages.

Least privilege is the correct default.

### Mistake 5: Mixing Role And Permission Names

Pick a consistent vocabulary.

For this codebase, either normalize `userType` to `role` in frontend state or consistently use `userType` everywhere behind helper functions.

### Mistake 6: Forgetting Action-Level Permissions

Page access is not enough.

Within a page, different roles may have different abilities:

- view product
- create product
- edit product
- delete product
- export product list

### Mistake 7: Letting Frontend And Backend Drift

If frontend says a role can export reports but backend rejects it, users see broken workflows.

If backend allows an endpoint but frontend hides it, users may still access it through direct API calls.

Use the same permission vocabulary on both sides.

## How To Make This Scalable

Use permissions as the stable building blocks.

Roles can change. Permissions should be more durable.

For example, if a future role `INVENTORY_AUDITOR` is added, it can receive:

- `products.read`
- `stock.read`
- `reports.inventory.read`

without touching every page.

Recommended scalable pattern:

```text
New role added:
  Add role label
  Add role permission mapping
  Add default dashboard route
  Existing sidebar/routes/actions work automatically
```

If adding a role requires editing many random components, the RBAC architecture is not centralized enough.

## Files That Need To Be Created

### `src/config/roles.js`

Purpose:

Defines canonical role names and labels.

Why:

Role strings should not be duplicated in `Login.jsx`, `Sidebar.jsx`, and other components.

### `src/config/permissions.js`

Purpose:

Defines permission constants and maps roles to permissions.

Why:

This becomes the central source of frontend authorization decisions.

### `src/config/navigation.js`

Purpose:

Defines sidebar navigation items and required permissions.

Why:

The sidebar should be generated from permissions, not hand-filtered with `adminOnly`.

### `src/config/routes.js`

Purpose:

Defines route paths, components, layouts, and required permissions.

Why:

Routes and permissions should live together so direct URL access is protected.

### `src/config/dashboards.js`

Purpose:

Maps roles to default dashboard/landing paths.

Why:

Login and `/` should send users to the right workspace for their role.

### `src/hooks/usePermissions.js`

Purpose:

Provides helpers such as:

```text
can(permission)
canAny(permissions)
canAll(permissions)
```

Why:

Components should not manually inspect role arrays or permission arrays.

### `src/components/auth/RequirePermission.jsx`

Purpose:

Protects route children based on required permissions.

Why:

Authenticated users should not automatically access every page.

### `src/pages/Unauthorized.jsx`

Purpose:

Shows a clear unauthorized screen.

Why:

Users need a clean explanation when they are logged in but not allowed to access a page.

### `src/pages/dashboards/*.jsx`

Purpose:

Provides role-specific dashboards.

Why:

Different roles need different primary workflows.

## Files That Need To Be Modified

### `App.jsx`

Current issue:

Routes are manually declared and only protected by login.

Relevant lines:

- Routes start at `App.jsx:45`.
- Protected routes start at `App.jsx:49`.

Needed change:

Routes should be generated from route config and wrapped with both authentication and permission guards.

### `ProtectedRoute.jsx`

Current issue:

Only checks authentication.

Relevant lines:

- Reads `isAuthenticated` at `ProtectedRoute.jsx:5`.
- Redirects unauthenticated users at `ProtectedRoute.jsx:19-22`.
- Allows all authenticated users at `ProtectedRoute.jsx:25`.

Needed change:

Either rename it to `RequireAuth` and add a separate `RequirePermission`, or extend it to accept `permissions`.

### `Sidebar.jsx`

Current issue:

Navigation is hard-coded and only `Reports` has `adminOnly`.

Relevant lines:

- `navItems` begins at `Sidebar.jsx:24`.
- `Reports` has `adminOnly` at `Sidebar.jsx:82`.
- Filtering happens at `Sidebar.jsx:143-145`.

Needed change:

Load items from `config/navigation.js` and filter by permissions.

### `AuthContext.jsx`

Current issue:

Exposes raw `user` but does not normalize role or expose permissions.

Relevant lines:

- User is set from `/auth/me` at `AuthContext.jsx:189-190`.
- Login sets user at `AuthContext.jsx:219`.
- Context value is exposed at `AuthContext.jsx:241-249`.

Needed change:

Normalize user shape and expose permissions.

### `Login.jsx`

Current issue:

Demo roles are defined locally.

Relevant lines:

- `USER_TYPES` begins at `Login.jsx:7`.

Needed change:

Move role metadata to shared config and import it.

### `Dashboard.jsx`

Current issue:

One dashboard handles every role and infers permissions from rejected API calls.

Relevant lines:

- Dashboard starts at `Dashboard.jsx:73`.
- Local permissions state starts at `Dashboard.jsx:86`.
- API calls happen at `Dashboard.jsx:106`.
- Permission flags are set at `Dashboard.jsx:135-145`.

Needed change:

Split dashboard into role-specific dashboards and remove permission inference from failed requests.

### `Navbar.jsx`

Current issue:

Formats role locally and navigates to an unrouted `/inventory` path.

Relevant lines:

- Role formatting helper at `Navbar.jsx:15-18`.
- Role display at `Navbar.jsx:380` and `Navbar.jsx:394`.
- `/inventory?status=expired` navigation at `Navbar.jsx:359`.

Needed change:

Use shared role formatting helpers and ensure navigation targets registered routes.

### Page Files With Sensitive Actions

Several pages expose create/update/delete/export actions without frontend permission checks.

Examples:

- `Products.jsx`
- `StockList.jsx`
- `Purchases.jsx`
- `PurchaseNew.jsx`
- `Customers.jsx`
- `Suppliers.jsx`
- `Orders.jsx`
- `Prescriptions.jsx`
- `Reports.jsx`
- `Settings.jsx`
- `Expenses.jsx`
- `Incomes.jsx`
- `Tax.jsx`

Needed change:

Keep page-level route protection and also hide or disable sensitive actions based on permissions.

## Recommended Implementation Order

### Step 1: Define RBAC Vocabulary

Create:

- `config/roles.js`
- `config/permissions.js`

Do this first because every other change depends on a shared vocabulary.

### Step 2: Normalize Auth User

Modify:

- `AuthContext.jsx`

Normalize the user object and expose:

- `user`
- `role`
- `permissions`
- `isAuthenticated`
- `loading`

### Step 3: Build Permission Helper

Create:

- `hooks/usePermissions.js`

This prevents components from manually checking role strings.

### Step 4: Add Authorization Guard

Create:

- `components/auth/RequirePermission.jsx`
- `pages/Unauthorized.jsx`

Modify:

- `ProtectedRoute.jsx` or replace it with `RequireAuth`.

### Step 5: Convert Routes To Config

Create:

- `config/routes.js`

Modify:

- `App.jsx`

Every route should declare its required permission.

### Step 6: Convert Sidebar To Config

Create:

- `config/navigation.js`

Modify:

- `Sidebar.jsx`

Sidebar should show only items the user can access.

### Step 7: Add Role-Specific Dashboards

Create:

- role dashboard files in `pages/dashboards/`
- `config/dashboards.js`

Modify:

- `App.jsx`
- `Dashboard.jsx`

The `/` route should redirect to the user's dashboard.

### Step 8: Add Action-Level Permission Checks

Modify pages with create/update/delete/export buttons.

Examples:

- Product add/edit/delete
- Stock edit/delete
- Report export
- Settings save
- Order status update
- Prescription approve/reject

### Step 9: Align Backend Permissions

Backend should enforce the same permission names.

Frontend should not invent permissions that backend does not understand.

### Step 10: Add Tests

Recommended tests:

- Unauthenticated user redirects to `/login`.
- Authenticated rider cannot open `/reports`.
- Finance user sees finance sidebar only.
- Pharmacist lands on POS/dashboard.
- Admin can see reports.
- Hidden sidebar routes are also blocked by direct URL.

## Final Recommendation

The current app is a good prototype foundation, but its role implementation is not yet enterprise-grade.

The most important correction is to stop treating sidebar visibility as access control. Proper RBAC requires a shared permission model that drives:

- route access
- sidebar visibility
- dashboard landing
- page actions
- backend API authorization

The right architecture is:

```text
Authenticate user
Load normalized user + permissions
Resolve landing dashboard
Render permission-filtered navigation
Protect every route with permissions
Protect every sensitive action with permissions
Enforce the same permissions on the backend
```

That will make the pharmacy system safer, easier to reason about, and much easier to extend when new roles are added.
