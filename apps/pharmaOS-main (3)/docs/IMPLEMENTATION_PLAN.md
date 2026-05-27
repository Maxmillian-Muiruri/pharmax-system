# PharmaOS Frontend-to-Backend Implementation Plan

**Generated:** April 7, 2026  
**Purpose:** Bridge gaps between frontend pages and backend/database to make all routes functional with real data.

---

## Executive Summary

The frontend has **25+ routes** but only **9 pages** are wired to real backend APIs. The remaining **16 routes** use `ListTemplate` or `FormTemplate` with **hardcoded mock data** stored only in `localStorage`. The backend currently has **5 database tables** but is missing entities for Customers, Suppliers, Purchases, Income, Expenses, Tax, Settings, and other frontend-expected entities.

---

## Current State Analysis

### ✅ Already Wired (9 Pages)
| Page | Route | Status |
|------|-------|--------|
| Dashboard | `/` | Partially wired (fetches products, orders, sales trend — but charts use mock data) |
| Login | `/login` | Fully wired |
| POS | `/sales/new` | Fully wired |
| Inventory | (via modal) | Fully wired |
| Orders | (via modal) | Fully wired (except `ordersApi.update` wrapper missing) |
| Transactions | (via modal) | Fully wired |
| Analytics | (via modal) | Fully wired |
| Reports | (via modal) | Fully wired |
| Import | (via modal) | Fully wired |

### ❌ Mock-Only Routes (16 Routes — No Backend Support)
| Route | Frontend Expects | Backend Has | Database Has |
|-------|-----------------|-------------|--------------|
| `/sales` | Sales list with date, customer, total, status | ❌ No endpoint | ❌ No dedicated table |
| `/purchases` | Purchase list (supplier, date, invoice) | ❌ No endpoint | ❌ No table |
| `/purchases/new` | Purchase form (supplier, date, invoice no) | ❌ No endpoint | ❌ No table |
| `/products` | Product list with generic name, stock, price | ✅ Partial (missing `generic` field) | ❌ Missing `generic` column |
| `/products/new` | Product form (name, generic, category, purchase price, sale price, stock) | ✅ Partial (missing `generic`, `purchasePrice`) | ❌ Missing columns |
| `/products/barcodes` | Barcode generation | ❌ No endpoint | N/A |
| `/customers` | Customer list (name, phone, email, balance) | ❌ No endpoint | ❌ No table |
| `/customers/new` | Customer form (name, phone, email, address) | ❌ No endpoint | ❌ No table |
| `/suppliers` | Supplier list (name, phone, contact person) | ❌ No endpoint | ❌ No table |
| `/suppliers/new` | Supplier form (name, phone, contact person) | ❌ No endpoint | ❌ No table |
| `/incomes` | Income list (date, category, amount, status) | ❌ No endpoint | ❌ No table |
| `/expenses` | Expense list (date, category, amount, status) | ❌ No endpoint | ❌ No table |
| `/tax` | Tax list (date, category, amount) | ❌ No endpoint | ❌ No table |
| `/due-list` | Due payments list | ❌ No endpoint | ❌ No table |
| `/reports` | Generic reports list | ❌ No endpoint (reports API exists but page uses mock) | N/A |
| `/settings` | Settings form (pharmacy name, address, currency) | ❌ No endpoint | ❌ No table |
| `/stock/current` | Current stock list | ✅ Partially (uses same products data) | ✅ Exists |
| `/stock/expired` | Expired stock list | ✅ Partially (uses same products data) | ✅ Exists |

---

## Implementation Phases

### Phase 1: Database Schema Extensions

**Priority: Critical — Must be done first**

#### 1.1 Extend `Product` Model
**File:** `backend/prisma/schema.prisma`

Add missing fields:
```prisma
model Product {
  // ... existing fields ...
  generic      String?       // Generic/chemical name
  purchasePrice Decimal?     @db.Decimal(10, 2)  // Cost price for profit calculations
  barcode      String?       @unique  // For barcode scanning/generation
  batchNumber  String?       // Batch/lot number
  minimumStock Int           @default(10)  // Per-product low stock threshold
  // ... existing fields ...
}
```

**Why needed:**
- `/products` and `/products/new` pages show "Generic" column
- Dashboard profit/loss calculations require `purchasePrice` vs `unitPrice`
- Barcode page needs `barcode` field
- Batch tracking needed for pharmaceutical compliance

#### 1.2 Create `Customer` Model
```prisma
model Customer {
  id        String    @id @default(uuid())
  name      String
  phone     String?
  email     String?   @unique
  address   String?
  balance   Decimal   @default(0) @db.Decimal(10, 2)  // Credit/dues tracking
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  orders    Order[]
}
```

**Why needed:**
- `/customers` and `/customers/new` pages
- Dashboard "Top 5 Customer" card (currently mock data)
- Order model should reference Customer instead of storing raw `customerName`/`customerPhone`
- `/due-list` page needs customer balance tracking

#### 1.3 Create `Supplier` Model
```prisma
model Supplier {
  id            String    @id @default(uuid())
  name          String
  phone         String?
  contactPerson String?
  email         String?   @unique
  address       String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  products      Product[]  // Relation: products sourced from this supplier
  purchases     Purchase[]
}
```

**Why needed:**
- `/suppliers` and `/suppliers/new` pages
- Dashboard "Total Supplier" metric
- Products currently have a raw `supplier` string — should be a proper FK relation
- `/purchases` page needs supplier tracking

#### 1.4 Create `Purchase` Model
```prisma
model Purchase {
  id            String    @id @default(uuid())
  supplier      Supplier  @relation(fields: [supplierId], references: [id])
  supplierId    String
  invoiceNo     String?   @unique
  purchaseDate  DateTime  @db.Date
  totalAmount   Decimal   @db.Decimal(10, 2)
  notes         String?
  createdAt     DateTime  @default(now())
  items         PurchaseItem[]
}

model PurchaseItem {
  id        String   @id @default(uuid())
  purchase  Purchase @relation(fields: [purchaseId], references: [id])
  purchaseId String
  product   Product  @relation(fields: [productId], references: [id])
  productId String
  quantity  Int
  unitCost  Decimal  @db.Decimal(10, 2)  // Cost per unit at time of purchase
  total     Decimal  @db.Decimal(10, 2)
}
```

**Why needed:**
- `/purchases` and `/purchases/new` pages
- Track stock purchases separately from sales orders
- Enable profit/loss calculations (purchase cost vs sales revenue)
- Dashboard "Sales & Purchase" chart needs real purchase data

#### 1.5 Create `Expense` Model
```prisma
model Expense {
  id        String    @id @default(uuid())
  category  String    // e.g., "Rent", "Utilities", "Salaries", "Transport"
  amount    Decimal   @db.Decimal(10, 2)
  date      DateTime  @db.Date
  notes     String?
  status    String    @default("completed")  // completed, pending
  createdAt DateTime  @default(now())
}
```

**Why needed:**
- `/expenses` page
- Dashboard "Overall Report" and "Profit/Loss" charts need expense data
- Profit calculations: Revenue - Purchases - Expenses

#### 1.6 Create `Income` Model
```prisma
model Income {
  id        String    @id @default(uuid())
  category  String    // e.g., "Sales", "Services", "Other"
  amount    Decimal   @db.Decimal(10, 2)
  date      DateTime  @db.Date
  notes     String?
  status    String    @default("completed")
  createdAt DateTime  @default(now())
}
```

**Why needed:**
- `/incomes` page
- Dashboard "Overall Report" chart (Income segment)
- Note: Sales orders already track revenue — this is for non-sales income

#### 1.7 Create `Setting` Model
```prisma
model Setting {
  id        String   @id @default(uuid())
  key       String   @unique  // e.g., "pharmacyName", "address", "currency"
  value     String
  updatedAt DateTime @updatedAt
}
```

**Why needed:**
- `/settings` page
- Store pharmacy configuration (name, address, currency, tax rate, etc.)
- Currently hardcoded in FormTemplate

#### 1.8 Update `Order` Model
```prisma
model Order {
  // ... existing ...
  customer    Customer? @relation(fields: [customerId], references: [id])
  customerId  String?   // Nullable for backward compatibility
  
  // Add these fields:
  paymentMethod String?  // cash, mpesa, card
  amountPaid    Decimal? @db.Decimal(10, 2)
  amountDue     Decimal? @db.Decimal(10, 2)
  // ... existing ...
}
```

**Why needed:**
- Link orders to Customer model for proper customer tracking
- POS view could track payment method and partial payments
- Customer balance (dues) tracking

---

### Phase 2: Backend API Endpoints

**Priority: High — Build after schema migrations**

#### 2.1 Customer Endpoints
```
GET    /api/customers              # List all customers (with search)
POST   /api/customers              # Create customer
GET    /api/customers/:id          # Get single customer
PUT    /api/customers/:id          # Update customer
DELETE /api/customers/:id          # Delete customer
GET    /api/customers/top          # Get top customers by order value (for dashboard)
```

**Controller:** `backend/src/controllers/customerController.js`  
**Validation:** Zod schema for name (required), phone, email  
**Files to create:**
- `backend/src/routes/customers.js`
- `backend/src/controllers/customerController.js`
- `backend/src/middleware/schemas.js` (add customer schemas)

#### 2.2 Supplier Endpoints
```
GET    /api/suppliers              # List all suppliers
POST   /api/suppliers              # Create supplier
GET    /api/suppliers/:id          # Get single supplier
PUT    /api/suppliers/:id          # Update supplier
DELETE /api/suppliers/:id          # Delete supplier
```

**Controller:** `backend/src/controllers/supplierController.js`  
**Files to create:**
- `backend/src/routes/suppliers.js`
- `backend/src/controllers/supplierController.js`

#### 2.3 Purchase Endpoints
```
GET    /api/purchases              # List all purchases (with date filter, supplier filter)
POST   /api/purchases              # Create purchase (with items array)
GET    /api/purchases/:id          # Get single purchase with items
PUT    /api/purchases/:id          # Update purchase
DELETE /api/purchases/:id          # Delete purchase
GET    /api/purchases/summary      # Purchase summary (total by period) — for dashboard charts
```

**Controller:** `backend/src/controllers/purchaseController.js`  
**Logic:** Creating a purchase should:
1. Create Purchase + PurchaseItem records
2. Increment product quantities (restock)
3. Create a `restock` transaction record
4. Link products to supplier if not already linked

**Files to create:**
- `backend/src/routes/purchases.js`
- `backend/src/controllers/purchaseController.js`

#### 2.4 Expense Endpoints
```
GET    /api/expenses               # List expenses (with category/date filter)
POST   /api/expenses               # Create expense
PUT    /api/expenses/:id           # Update expense
DELETE /api/expenses/:id           # Delete expense
GET    /api/expenses/summary       # Expense summary by period
```

**Controller:** `backend/src/controllers/expenseController.js`  
**Files to create:**
- `backend/src/routes/expenses.js`
- `backend/src/controllers/expenseController.js`

#### 2.5 Income Endpoints
```
GET    /api/incomes                # List incomes
POST   /api/incomes                # Create income
PUT    /api/incomes/:id            # Update income
DELETE /api/incomes/:id            # Delete income
GET    /api/incomes/summary        # Income summary by period
```

**Controller:** `backend/src/controllers/incomeController.js`  
**Files to create:**
- `backend/src/routes/incomes.js`
- `backend/src/controllers/incomeController.js`

#### 2.6 Settings Endpoints
```
GET    /api/settings               # Get all settings
GET    /api/settings/:key          # Get single setting
PUT    /api/settings/:key          # Update setting
PUT    /api/settings/bulk          # Update multiple settings at once
```

**Controller:** `backend/src/controllers/settingController.js`  
**Files to create:**
- `backend/src/routes/settings.js`
- `backend/src/controllers/settingController.js`

#### 2.7 Extend Product Endpoints
**File:** `backend/src/controllers/productController.js`

Update existing endpoints to support:
- Accept `generic`, `purchasePrice`, `barcode`, `batchNumber`, `minimumStock` fields
- Auto-generate barcode if not provided (format: `PHARM-{category}-{id}`)
- Link product to supplier via `supplierId` instead of raw string

#### 2.8 Extend Order Endpoints
**File:** `backend/src/controllers/orderController.js`

Update to support:
- Link orders to `customerId` (FK) instead of raw `customerName`
- Accept `paymentMethod`, `amountPaid`, `amountDue`
- Auto-calculate `amountDue` = `totalAmount` - `amountPaid`

#### 2.9 Dashboard Analytics Endpoints (NEW)
```
GET    /api/analytics/dashboard    # Single endpoint for all dashboard KPIs
GET    /api/analytics/profit-loss  # Monthly profit/loss data
GET    /api/analytics/revenue      # Revenue breakdown (sales vs other income)
```

**Controller:** `backend/src/controllers/analyticsController.js` (extend existing)

**`/api/analytics/dashboard` should return:**
```json
{
  "data": {
    "totalCustomers": 45,
    "totalSuppliers": 8,
    "totalStockValue": 125000.00,
    "expiredCount": 5,
    "lowStockCount": 12,
    "todaySales": 4500.00,
    "todayPurchases": 2000.00,
    "todayExpenses": 500.00
  }
}
```

**`/api/analytics/profit-loss` should return:**
```json
{
  "data": [
    { "month": "Jan", "revenue": 50000, "cost": 30000, "profit": 20000 },
    { "month": "Feb", "revenue": 45000, "cost": 28000, "profit": 17000 }
  ]
}
```

**Why:** Dashboard currently uses hardcoded `PROFIT_LOSS_DATA`, `OVERALL_REPORT_DATA`, `SALES_PURCHASE_DATA`. These endpoints provide real data.

---

### Phase 3: Frontend API Service Updates

**Priority: High — Wire frontend to new backend endpoints**

#### 3.1 Add API Wrappers
**File:** `frontend/src/services/api.js`

Add new API modules:
```javascript
export const customersApi = {
  getAll: (params) => api.get('/customers', { params }),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getTop: () => api.get('/customers/top'),
}

export const suppliersApi = {
  getAll: (params) => api.get('/suppliers', { params }),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
}

export const purchasesApi = {
  getAll: (params) => api.get('/purchases', { params }),
  create: (data) => api.post('/purchases', data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
  delete: (id) => api.delete(`/purchases/${id}`),
  getSummary: (params) => api.get('/purchases/summary', { params }),
}

export const expensesApi = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getSummary: (params) => api.get('/expenses/summary', { params }),
}

export const incomesApi = {
  getAll: (params) => api.get('/incomes', { params }),
  create: (data) => api.post('/incomes', data),
  update: (id, data) => api.put(`/incomes/${id}`, data),
  delete: (id) => api.delete(`/incomes/${id}`),
  getSummary: (params) => api.get('/incomes/summary', { params }),
}

export const settingsApi = {
  getAll: () => api.get('/settings'),
  get: (key) => api.get(`/settings/${key}`),
  update: (key, data) => api.put(`/settings/${key}`, data),
  updateBulk: (data) => api.put('/settings/bulk', data),
}

export const analyticsApi = {
  // ... existing methods ...
  dashboard: () => api.get('/analytics/dashboard'),
  profitLoss: (params) => api.get('/analytics/profit-loss', { params }),
  revenue: (params) => api.get('/analytics/revenue', { params }),
}
```

#### 3.2 Fix Missing Wrapper
**File:** `frontend/src/services/api.js`

Add to `ordersApi`:
```javascript
export const ordersApi = {
  // ... existing ...
  update: (id, data) => api.put(`/orders/${id}`, data),  // MISSING — add this
  delete: (id) => api.delete(`/orders/${id}`),  // Optional — backend doesn't have this yet
}
```

#### 3.3 Update Product API
**File:** `frontend/src/services/api.js`

Update `productsApi` to include barcode endpoint:
```javascript
export const productsApi = {
  // ... existing ...
  generateBarcode: (id) => api.post(`/products/${id}/barcode`),
  getAllBarcodes: () => api.get('/products/barcodes'),
}
```

---

### Phase 4: Create Custom Hooks

**Priority: Medium — After API wrappers**

**Files to create in `frontend/src/hooks/`:**

```javascript
// useCustomers.js
// useSuppliers.js
// usePurchases.js
// useExpenses.js
// useIncomes.js
// useSettings.js
```

Each follows the existing pattern (e.g., `useProducts.js`):
- `useState` for data, loading, error
- `useEffect` to fetch on mount
- Return `{ data, loading, error, refetch }`

---

### Phase 5: Frontend Page Rewiring

**Priority: Medium — After hooks are created**

#### 5.1 Replace `ListTemplate` Routes with Real Pages

Each route currently using `ListTemplate` with `initialData` needs to be converted to a real page component:

| Current Route | New Page File | API Hook |
|--------------|---------------|----------|
| `/sales` | `frontend/src/pages/Sales.jsx` | `useOrders()` (already exists) |
| `/purchases` | `frontend/src/pages/Purchases.jsx` | `usePurchases()` |
| `/products` | Already exists as `Inventory.jsx` — update columns | `useProducts()` |
| `/products/barcodes` | `frontend/src/pages/Barcodes.jsx` | `productsApi.getAllBarcodes()` |
| `/customers` | `frontend/src/pages/Customers.jsx` | `useCustomers()` |
| `/suppliers` | `frontend/src/pages/Suppliers.jsx` | `useSuppliers()` |
| `/incomes` | `frontend/src/pages/Incomes.jsx` | `useIncomes()` |
| `/expenses` | `frontend/src/pages/Expenses.jsx` | `useExpenses()` |
| `/tax` | `frontend/src/pages/Tax.jsx` | `useExpenses({ type: 'tax' })` or new hook |
| `/due-list` | `frontend/src/pages/DueList.jsx` | `useCustomers()` filtered by balance > 0 |
| `/stock/current` | Reuse `Inventory.jsx` with `status=active` filter | `useProducts({ status: 'active' })` |
| `/stock/expired` | Reuse `Inventory.jsx` with `status=expired` filter | `useProducts({ status: 'expired' })` |

#### 5.2 Replace `FormTemplate` Routes with Real Forms

| Current Route | Action |
|--------------|--------|
| `/purchases/new` | Wire to `purchasesApi.create()` with multi-item form |
| `/products/new` | Wire to `productsApi.create()` — add generic, purchasePrice fields to ProductModal |
| `/customers/new` | Wire to `customersApi.create()` |
| `/suppliers/new` | Wire to `suppliersApi.create()` |
| `/settings` | Wire to `settingsApi.updateBulk()` |

#### 5.3 Rewire Dashboard to Real Data

**File:** `frontend/src/pages/Dashboard.jsx`

Replace mock data:

1. **`MOCK_STATS`** → Fetch from `GET /api/analytics/dashboard`
2. **`PROFIT_LOSS_DATA`** → Fetch from `GET /api/analytics/profit-loss`
3. **`OVERALL_REPORT_DATA`** → Calculate from income + expense + sales data
4. **`SALES_PURCHASE_DATA`** → Merge sales trend + purchase summary
5. **`TOP_CUSTOMERS`** → Fetch from `GET /api/customers/top`
6. **Low Stock Table** → Already uses real products data ✅
7. **Expired Products** → Already uses real products data ✅

---

### Phase 6: Database Migration & Seed

**Priority: Critical — Run after schema changes, before backend starts**

#### 6.1 Create Migration
```bash
cd backend
npx prisma migrate dev --name add_customers_suppliers_purchases_financials
```

This will:
1. Generate SQL migration file from schema changes
2. Apply migration to development database
3. Regenerate Prisma Client

#### 6.2 Update Seed Data
**File:** `backend/prisma/seed.js`

Add seed data for new entities:
- 10 sample customers
- 6 sample suppliers
- 5 sample purchases with items
- 8 sample expenses (rent, utilities, etc.)
- 3 sample incomes
- Default settings (pharmacy name, address, currency)
- Link existing products to suppliers
- Link existing orders to customers

#### 6.3 Update Product Supplier Relation
The current `Product.supplier` is a `String?`. After migration, we need to:
1. Create Supplier records from existing unique supplier strings
2. Update products to reference `supplierId` FK
3. Remove old `supplier` string column (or keep as fallback)

This requires a **data migration script** in the seed file.

---

### Phase 7: Additional Features

**Priority: Low — Nice to have**

#### 7.1 Barcode Generation
**Endpoint:** `POST /api/products/:id/barcode`  
**Logic:** Generate barcode string, save to product, return for rendering  
**Frontend:** Use a barcode library (e.g., `react-barcode`) in `Barcodes.jsx`

#### 7.2 User Registration
```
POST   /api/auth/register        # Self-service registration
POST   /api/auth/forgot-password  # Password reset request
POST   /api/auth/reset-password   # Password reset with token
```

#### 7.3 Customer Due/Payment Tracking
When orders have `amountDue > 0`, increment customer balance.  
Endpoint to record payment:
```
POST   /api/customers/:id/payments  # Record payment against customer balance
```

#### 7.4 Reports Page Rewire
**File:** `frontend/src/pages/Reports.jsx`

Currently the `/reports` route uses mock `ListTemplate`. Either:
- Redirect to existing Reports page (the one with PDF/CSV export), or
- Build a proper reports listing page that links to existing report generators

---

## File Creation Summary

### Backend — New Files (18 files)
```
backend/src/routes/
  ├── customers.js
  ├── suppliers.js
  ├── purchases.js
  ├── expenses.js
  ├── incomes.js
  └── settings.js

backend/src/controllers/
  ├── customerController.js
  ├── supplierController.js
  ├── purchaseController.js
  ├── expenseController.js
  ├── incomeController.js
  └── settingController.js

backend/src/middleware/schemas.js (extend — add 6 new Zod schemas)
```

### Backend — Modified Files (5 files)
```
backend/prisma/schema.prisma           # Add 7 new models, extend 2 existing
backend/src/app.js                     # Register 6 new route files
backend/src/controllers/productController.js  # Add new fields
backend/src/controllers/orderController.js    # Add customer FK, payment fields
backend/prisma/seed.js                 # Add seed data for new entities
```

### Frontend — New Files (18 files)
```
frontend/src/pages/
  ├── Customers.jsx
  ├── Suppliers.jsx
  ├── Purchases.jsx
  ├── Expenses.jsx
  ├── Incomes.jsx
  ├── DueList.jsx
  ├── Barcodes.jsx
  └── Tax.jsx

frontend/src/hooks/
  ├── useCustomers.js
  ├── useSuppliers.js
  ├── usePurchases.js
  ├── useExpenses.js
  ├── useIncomes.js
  └── useSettings.js
```

### Frontend — Modified Files (4 files)
```
frontend/src/services/api.js           # Add 7 new API modules + fix ordersApi
frontend/src/App.jsx                   # Replace ListTemplate/FormTemplate routes with real pages
frontend/src/pages/Dashboard.jsx       # Replace all mock data with real API calls
frontend/src/components/forms/ProductModal.jsx  # Add generic, purchasePrice fields
```

---

## Execution Order

```
Phase 1: Database Schema Extensions (1-2 hours)
  └── 1.1-1.8: Update prisma/schema.prisma

Phase 2: Run Migration & Seed (30 minutes)
  └── 6.1-6.3: prisma migrate dev + update seed.js

Phase 3: Backend API Endpoints (3-4 hours)
  └── 2.1-2.9: Create routes + controllers

Phase 4: Frontend API Service (30 minutes)
  └── 3.1-3.3: Update api.js

Phase 5: Frontend Hooks (1 hour)
  └── Phase 4: Create 6 hook files

Phase 6: Frontend Pages (3-4 hours)
  └── 5.1-5.3: Create pages, rewire Dashboard, update App.jsx

Phase 7: Testing & Polish (1-2 hours)
  └── Manual testing of all routes, fix edge cases
```

**Estimated Total: 10-13 hours of development**

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing Product/Order APIs | High | Add new fields as optional, maintain backward compatibility |
| Large migration complexity | Medium | Split into 2-3 smaller migrations if needed |
| Frontend template compatibility | Low | `ListTemplate` and `FormTemplate` are generic enough to reuse |
| Data consistency (supplier relation) | Medium | Write careful data migration in seed.js to map existing strings to FKs |

---

## Recommendations

1. **Start with Phase 1 + 2** (schema + migration) — this is the foundation
2. **Build backend endpoints in Phase 3** — test each with Postman/Insomnia before frontend work
3. **Wire frontend incrementally** — don't do all pages at once. Start with `/customers` as a proof of concept
4. **Dashboard last** — it aggregates data from all other endpoints, so build it after everything else works
5. **Keep `ListTemplate` and `FormTemplate`** — they are well-designed reusable components. The goal is to feed them real data via hooks instead of `initialData`
6. **Consider adding a `barcode` npm package** for the barcodes page (`react-barcode` or `jsbarcode`)
7. **Add `purchasePrice` to products ASAP** — this is the single most important missing field for any meaningful profit/loss reporting

---

**Next Step:** Approve this plan and I'll begin implementation starting with Phase 1 (Database Schema Extensions).
