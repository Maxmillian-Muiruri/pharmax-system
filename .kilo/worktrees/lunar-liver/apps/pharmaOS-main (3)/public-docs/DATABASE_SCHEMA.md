# PharmaOS Database Schema Documentation

**Database:** PostgreSQL  
**ORM:** Prisma  
**Last Updated:** April 9, 2026

---

## Overview

The PharmaOS database manages a comprehensive pharmacy management system with inventory control, order processing, financial tracking, procurement, and user authentication with role-based access control.

The database consists of **12 tables** that handle:
- Product inventory management with expiry tracking
- Customer and supplier relationships
- Order processing and fulfillment
- Financial transactions (income, expenses, transactions)
- Procurement and purchase order management
- System alerts and notifications
- User authentication and authorization
- Pharmacist license management

---

## Enums (Custom Types)

### UserType
Defines user roles and permissions in the system:
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Administrative access
- `FINANCE` - Financial module access
- `RECEIVING_BAY` - Receiving inventory access
- `MANAGER` - Management oversight
- `DISPATCH` - Order dispatch access
- `RIDER` - Delivery tracking
- `PHARMACIST` - Pharmaceutical verification

### ProductStatus
Tracks product lifecycle state:
- `active` - Product is available for sale
- `expired` - Product has passed expiry date
- `near_expiry` - Product approaching expiry date
- `out_of_stock` - Product quantity is zero

### OrderStatus
Tracks order fulfillment progress:
- `pending` - Order created, not yet processed
- `processing` - Order being prepared
- `completed` - Order fulfilled
- `cancelled` - Order voided

### TransactionType
Categorizes financial movements:
- `sale` - Product sold to customer
- `restock` - Inventory replenished
- `write_off` - Inventory removed (expired/damaged)

### AlertType
Classifies system notifications:
- `expired` - Product has expired
- `near_expiry` - Product approaching expiry
- `low_stock` - Product below minimum stock threshold

---

## Tables

### 1. Customer
**Purpose:** Stores customer information for order processing and credit management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique customer identifier |
| `name` | String | Not Null | Customer full name |
| `phone` | String | Nullable | Contact phone number |
| `email` | String | Unique, Nullable | Email address |
| `address` | String | Nullable | Physical address |
| `balance` | Decimal(10,2) | Default: 0 | Outstanding credit balance |
| `createdAt` | DateTime | Default: now() | Record creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

**Relationships:**
- One-to-Many: `orders` (Customer → Order)

**Business Logic:**
- Tracks customer credit balances for accounts receivable
- Used for order history and customer service

---

### 2. Supplier
**Purpose:** Manages supplier/vendor information for procurement and inventory replenishment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique supplier identifier |
| `name` | String | Not Null | Supplier company name |
| `phone` | String | Nullable | Contact phone number |
| `contactPerson` | String | Nullable | Primary contact person name |
| `email` | String | Unique, Nullable | Email address |
| `address` | String | Nullable | Physical address |
| `createdAt` | DateTime | Default: now() | Record creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

**Relationships:**
- One-to-Many: `products` (Supplier → Product)
- One-to-Many: `purchases` (Supplier → Purchase)

**Business Logic:**
- Links products to their suppliers for traceability
- Tracks purchase orders for vendor management

---

### 3. Product
**Purpose:** Core inventory table tracking all pharmaceutical products with expiry management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique product identifier |
| `name` | String | Not Null | Product name |
| `generic` | String | Nullable | Generic/chemical name |
| `category` | String | Nullable | Product category/classification |
| `quantity` | Int | Default: 0 | Current stock quantity |
| `purchasePrice` | Decimal(10,2) | Nullable | Cost price from supplier |
| `unitPrice` | Decimal(10,2) | Not Null | Selling price per unit |
| `expiryDate` | DateTime (Date) | Not Null | Product expiration date |
| `batchNumber` | String | Nullable | Manufacturing batch number |
| `barcode` | String | Unique, Nullable | Barcode for scanning |
| `minimumStock` | Int | Default: 10 | Reorder threshold |
| `status` | ProductStatus | Default: active | Current product status |
| `createdAt` | DateTime | Default: now() | Record creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |
| `supplierId` | String | Nullable, FK | Link to Supplier table |

**Relationships:**
- Many-to-One: `supplier` (Product → Supplier)
- One-to-Many: `orders` (Product → Order)
- One-to-Many: `alerts` (Product → Alert)
- One-to-Many: `transactions` (Product → Transaction)
- One-to-Many: `purchaseItems` (Product → PurchaseItem)

**Business Logic:**
- Central to inventory management
- Automatic status updates based on expiry dates and stock levels
- Batch tracking for recall management
- Barcode support for point-of-sale scanning
- Low stock alerts when quantity falls below minimumStock

---

### 4. Order
**Purpose:** Tracks customer orders from creation to fulfillment, including payment tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique order identifier |
| `customerName` | String | Not Null | Customer name at order time |
| `customerPhone` | String | Not Null | Customer phone at order time |
| `productId` | String | FK, Not Null | Product being ordered |
| `quantity` | Int | Not Null | Number of units ordered |
| `totalAmount` | Decimal(10,2) | Not Null | Total order value |
| `status` | OrderStatus | Default: pending | Order fulfillment status |
| `paymentMethod` | String | Nullable | Payment type (cash, card, etc.) |
| `amountPaid` | Decimal(10,2) | Nullable | Amount already paid |
| `amountDue` | Decimal(10,2) | Nullable | Outstanding balance |
| `notes` | String | Nullable | Special instructions |
| `createdAt` | DateTime | Default: now() | Order creation timestamp |
| `customerId` | String | Nullable, FK | Link to Customer table |

**Relationships:**
- Many-to-One: `product` (Order → Product)
- Many-to-One: `customer` (Order → Customer)
- One-to-One: `transaction` (Order → Transaction)

**Business Logic:**
- Captures customer name/phone at order time for historical accuracy
- Supports partial payments (amountPaid vs amountDue)
- Links to transactions for financial reconciliation
- Enables order status workflow (pending → processing → completed)

---

### 5. Transaction
**Purpose:** Financial audit trail for all inventory movements and monetary transactions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique transaction identifier |
| `orderId` | String | Unique, FK, Nullable | Associated order (for sales) |
| `productId` | String | FK, Not Null | Product involved in transaction |
| `type` | TransactionType | Not Null | Transaction category |
| `quantity` | Int | Not Null | Units moved (positive/negative) |
| `amount` | Decimal(10,2) | Not Null | Monetary value |
| `notes` | String | Nullable | Additional context |
| `createdAt` | DateTime | Default: now() | Transaction timestamp |

**Relationships:**
- One-to-One: `order` (Transaction → Order)
- Many-to-One: `product` (Transaction → Product)

**Business Logic:**
- Immutable audit log (never delete, only add)
- Links sales to specific orders
- Tracks inventory adjustments (restocks, write-offs)
- Enables financial reporting and reconciliation

---

### 6. Alert
**Purpose:** System-generated notifications for inventory management and operational awareness.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique alert identifier |
| `productId` | String | FK, Not Null | Product triggering alert |
| `type` | AlertType | Not Null | Alert category |
| `message` | String | Not Null | Alert description text |
| `isRead` | Boolean | Default: false | Read/unread status |
| `triggeredAt` | DateTime | Default: now() | Alert creation timestamp |

**Relationships:**
- Many-to-One: `product` (Alert → Product)

**Business Logic:**
- Automated alerts for expired products
- Automated alerts for products approaching expiry (within NEAR_EXPIRY_DAYS threshold)
- Low stock alerts when quantity < minimumStock
- Dashboard notification system
- Mark as read functionality

---

### 7. Purchase
**Purpose:** Manages purchase orders from suppliers for inventory procurement.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique purchase identifier |
| `supplierId` | String | FK, Not Null | Supplier providing goods |
| `invoiceNo` | String | Unique, Nullable | Supplier invoice number |
| `purchaseDate` | DateTime (Date) | Not Null | Date of purchase |
| `totalAmount` | Decimal(10,2) | Not Null | Total purchase value |
| `notes` | String | Nullable | Additional details |
| `createdAt` | DateTime | Default: now() | Record creation timestamp |

**Relationships:**
- Many-to-One: `supplier` (Purchase → Supplier)
- One-to-Many: `items` (Purchase → PurchaseItem)

**Business Logic:**
- Tracks procurement from suppliers
- Invoice number uniqueness for duplicate detection
- Supports multi-item purchase orders
- Enables vendor cost analysis

---

### 8. PurchaseItem
**Purpose:** Line items within purchase orders, detailing individual products procured.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique line item identifier |
| `purchaseId` | String | FK, Not Null | Parent purchase order |
| `productId` | String | FK, Not Null | Product being purchased |
| `quantity` | Int | Not Null | Units purchased |
| `unitCost` | Decimal(10,2) | Not Null | Cost per unit |
| `total` | Decimal(10,2) | Not Null | Line total (quantity × unitCost) |

**Relationships:**
- Many-to-One: `purchase` (PurchaseItem → Purchase)
- Many-to-One: `product` (PurchaseItem → Product)

**Business Logic:**
- Breaks down purchase orders into individual products
- Used to update Product.quantity when goods are received
- Enables purchase cost analysis per product
- Links back to supplier pricing

---

### 9. Expense
**Purpose:** Tracks business expenses for financial management and reporting.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique expense identifier |
| `category` | String | Not Null | Expense category (rent, utilities, etc.) |
| `amount` | Decimal(10,2) | Not Null | Expense amount |
| `date` | DateTime (Date) | Not Null | Expense date |
| `notes` | String | Nullable | Description/details |
| `status` | String | Default: "completed" | Payment status |
| `createdAt` | DateTime | Default: now() | Record creation timestamp |

**Relationships:** None (standalone table)

**Business Logic:**
- Financial tracking for operating costs
- Categorized for expense reporting
- Supports profit/loss calculations
- Date-based filtering for accounting periods

---

### 10. Income
**Purpose:** Records income entries for comprehensive financial tracking beyond product sales.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique income identifier |
| `category` | String | Not Null | Income source category |
| `amount` | Decimal(10,2) | Not Null | Income amount |
| `date` | DateTime (Date) | Not Null | Income date |
| `notes` | String | Nullable | Description/details |
| `status` | String | Default: "completed" | Receipt status |
| `createdAt` | DateTime | Default: now() | Record creation timestamp |

**Relationships:** None (standalone table)

**Business Logic:**
- Tracks non-sales income (services, consulting, etc.)
- Complements Transaction table for complete financial picture
- Enables income vs expense reporting
- Date-based filtering for accounting periods

---

### 11. Setting
**Purpose:** Key-value store for application configuration and system settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique setting identifier |
| `key` | String | Unique, Not Null | Setting name/identifier |
| `value` | String | Not Null | Setting value (stored as string) |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

**Relationships:** None (standalone table)

**Business Logic:**
- Stores configurable system parameters
- Examples: business name, tax rates, thresholds, logo paths
- Dynamic configuration without code changes
- Admin interface for updating settings

---

### 12. User
**Purpose:** Authentication and authorization system with role-based access control.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique user identifier |
| `email` | String | Unique, Not Null | User email (login credential) |
| `password` | String | Not Null | Hashed password |
| `userType` | UserType | Default: ADMIN | User role/permission level |
| `isActive` | Boolean | Default: true | Account active status |
| `createdAt` | DateTime | Default: now() | Account creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

**Relationships:**
- One-to-One: `pharmacist` (User → Pharmacist)

**Business Logic:**
- Central authentication system
- Role-based access control (RBAC) via UserType enum
- Soft delete via isActive flag (never hard delete)
- Password hashing required (bcrypt/argon2)
- Session management integration

---

### 13. Pharmacist
**Purpose:** Specialized profile for pharmacist users with license tracking for regulatory compliance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | String (UUID) | PK, Default: uuid() | Unique pharmacist identifier |
| `userId` | String | Unique, FK, Not Null | Link to User table |
| `licenseNumber` | String | Unique, Not Null | Professional license number |
| `isActive` | Boolean | Default: true | License active status |
| `createdAt` | DateTime | Default: now() | Record creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

**Relationships:**
- One-to-One: `user` (Pharmacist → User)

**Business Logic:**
- Regulatory compliance requirement
- License number validation
- Required for prescription verification workflows
- Separate isActive to manage license suspension independently
- Only users with PHARMACIST UserType should have Pharmacist records

---

## Entity Relationship Diagram

```
Customer (1) ────< (N) Order >──── (1) Product (N) >──── PurchaseItem
                                                               ↓
                                                        Purchase (1) ────< (N) PurchaseItem
                                                               ↓
                                                        Supplier (1) ────< (N) Product

Order (1) ──── (1) Transaction >──── Product

Product (1) ────< (N) Alert

User (1) ──── (1) Pharmacist

[Standalone Tables]
- Expense
- Income
- Setting
```

---

## Indexes & Constraints

### Unique Constraints
- `Customer.email`
- `Supplier.email`
- `Product.barcode`
- `Transaction.orderId`
- `Purchase.invoiceNo`
- `Setting.key`
- `User.email`
- `Pharmacist.userId`
- `Pharmacist.licenseNumber`

### Foreign Key Relationships
- `Product.supplierId` → `Supplier.id`
- `Order.productId` → `Product.id`
- `Order.customerId` → `Customer.id`
- `Transaction.orderId` → `Order.id`
- `Transaction.productId` → `Product.id`
- `Alert.productId` → `Product.id`
- `Purchase.supplierId` → `Supplier.id`
- `PurchaseItem.purchaseId` → `Purchase.id`
- `PurchaseItem.productId` → `Product.id`
- `Pharmacist.userId` → `User.id`

---

## Database Migration & Seeding

### Migrations
Located in: `backend/prisma/migrations/`

### Seed Data
Script: `backend/prisma/seed.js` (or similar)

Seed creates:
- Sample products with expiry dates
- Test customers and suppliers
- Sample orders and transactions
- Initial alerts for expired/near-expiry products
- Default admin user

---

## Key Business Workflows

### 1. Product Expiry Management
- Daily automated scan checks `Product.expiryDate`
- Updates `Product.status` to `expired` or `near_expiry`
- Creates `Alert` records for affected products
- Prevents sale of expired items

### 2. Low Stock Monitoring
- Compares `Product.quantity` against `Product.minimumStock`
- Triggers `Alert` when below threshold
- Dashboard displays low stock warnings
- Enables reorder workflows

### 3. Order Processing
1. Create `Order` with customer and product details
2. Record payment (`amountPaid`, `amountDue`)
3. Update `Order.status` through workflow
4. Create `Transaction` for audit trail
5. Decrement `Product.quantity`

### 4. Purchase Order Receiving
1. Create `Purchase` with supplier details
2. Add `PurchaseItem` entries for each product
3. On receipt, update `Product.quantity` for each item
4. Create `Transaction` with type `restock`
5. Update `Product.purchasePrice` if needed

### 5. Financial Reporting
- `Transaction` table tracks product-related movements
- `Income` table tracks non-sales revenue
- `Expense` table tracks operating costs
- Combined reports show profit/loss by period

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/pharmaos` |
| `PORT` | Backend server port | `3000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |
| `LOW_STOCK_THRESHOLD` | Global low stock default | `10` |
| `NEAR_EXPIRY_DAYS` | Days before expiry alert | `7` |

---

## Notes

- All monetary values use `Decimal(10, 2)` for precision
- UUIDs used for all primary keys (distributed ID generation)
- Timestamps use PostgreSQL timezone-aware DateTime
- Soft deletes preferred (set `isActive = false`) over hard deletes
- Audit trail maintained through immutable Transaction records
- Prisma ORM handles schema migrations and type safety

---

**PharmaOS Database Documentation** - Tech Vanguard © 2026
