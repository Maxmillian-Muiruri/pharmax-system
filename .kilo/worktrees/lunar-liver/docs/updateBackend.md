# Backend Update Plan - Phase 1: Match Frontend Requirements

## Overview

This plan outlines the backend improvements needed to fully support the modern pharmacy frontend application. The goal is to transform the existing pharmaOS backend into a complete pharmacy management system that supports customer-facing features, prescription management, and public order tracking.

**Status**: Backend running on port 4000, database synced  
**Priority**: High - Frontend requires these features to function  
**Target Completion**: Phase 1 complete before frontend integration

---

## Phase 1: Core Database Schema Updates

### 1.1 Add Customer User Type

**File**: `backend/prisma/schema.prisma`

**Changes**:
```prisma
enum UserType {
  SUPER_ADMIN
  ADMIN
  FINANCE
  RECEIVING_BAY
  MANAGER
  DISPATCH
  RIDER
  PHARMACIST
  CUSTOMER  // ← ADD THIS
}
```

**Why**: Frontend allows customer registration and login. Need CUSTOMER type to distinguish from staff.

**Estimated Time**: 5 minutes

---

### 1.2 Add Prescription Model

**File**: `backend/prisma/schema.prisma`

**Changes**:
```prisma
model Prescription {
  id            String           @id @default(uuid())
  userId        String
  prescriptionId String          // Public-facing ID (e.g., RX-291066)
  patientName   String
  phoneNumber   String
  email         String
  doctorName    String
  hospitalName  String
  address       String
  notes         String?
  files         Json             // [{name, size, type, dataUrl}]
  status        PrescriptionStatus @default(under_review)
  estimatedPrice Decimal?        @db.Decimal(10, 2)
  reviewNotes   String?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  
  user          User             @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([status])
}

enum PrescriptionStatus {
  under_review
  available
  out_of_stock
  rejected
  dispensed
}
```

**Add to User model**:
```prisma
model User {
  // ... existing fields
  prescriptions Prescription[]
}
```

**Why**: Frontend has full prescription upload and tracking UI. Backend lacks this entirely.

**Estimated Time**: 10 minutes

---

### 1.3 Add Public Order Tracking Support

**File**: `backend/prisma/schema.prisma` (Order model)

**Current Issue**: Order model uses `customerName` as String, not relation to User. Need to support both:
- Orders placed by registered customers (linked to User)
- Guest checkout (name/phone only)

**Changes**:
```prisma
model Order {
  id              String    @id @default(uuid())
  orderNumber     String    @unique  // e.g., ORD-6Q46UJEI8
  
  // Support both registered and guest customers
  userId          String?   // For registered customers
  customerName    String
  customerPhone   String
  customerEmail   String?
  
  items           OrderItem[]
  totalAmount     Decimal   @db.Decimal(10, 2)
  estimatedDelivery String
  status          OrderStatus @default(pending)
  paymentMethod   String?
  paymentStatus   PaymentStatus @default(pending)
  transactionId   String?
  
  isPrescriptionOrder Boolean @default(false)
  prescriptionId  String?
  
  shippingAddress Json  // {street, city, state, zip}
  notes           String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User?          @relation(fields: [userId], references: [id])
  transaction     Transaction?   @relation(fields: [trannsactionId], references: [id])
  
  @@index([userId])
  @@index([orderNumber])
  @@index([status])
}

enum PaymentStatus {
  pending
  confirmed
  failed
  refunded
}
```

**Why**: Frontend needs order numbers, payment status, and guest checkout support.

**Estimated Time**: 10 minutes

---

## Phase 2: Backend API Endpoints

### 2.1 Prescription Management API

**File**: `backend/src/routes/prescriptions.js` (NEW FILE)

**Endpoints**:
```javascript
// POST /api/prescriptions - Upload new prescription
// GET /api/prescriptions - List user's prescriptions
// GET /api/prescriptions/:id - Get prescription details
// PUT /api/prescriptions/:id/status - Update status (admin only)
```

**Implementation**: `backend/src/controllers/prescriptionController.js`

**Features**:
- File upload support (base64 encoded)
- Auto-generate prescriptionId (RX-XXXXXX)
- Status tracking
- Auto-review simulation (like frontend has)

**Estimated Time**: 30 minutes

---

### 2.2 Public Order Tracking API

**File**: `backend/src/routes/orders.js` (ADD)

**New Endpoint**:
```javascript
// GET /api/orders/track/:orderNumber - Public order tracking (NO AUTH REQUIRED)
```

**Implementation**: `backend/src/controllers/orderController.js`

**Features**:
- No authentication required
- Returns order details by orderNumber (not ID)
- Includes timeline status
- Rate limiting to prevent abuse

**Why**: Frontend `/track/:id` page is public - no login required to track orders.

**Estimated Time**: 15 minutes

---

### 2.3 Enhanced Auth for Customers

**File**: `backend/src/controllers/auth.js` (UPDATE)

**Changes**:
```javascript
// POST /api/auth/register - Register as customer
// Request body: { email, password, name, phone? }
// Sets userType: 'CUSTOMER'

// POST /api/auth/login - Login
// Returns: { token, user: {id, email, name, userType} }

// GET /api/auth/me - Get current user profile
// GET /api/auth/orders - Get user's orders
```

**Why**: Frontend needs proper customer registration/login flow.

**Estimated Time**: 20 minutes

---

### 2.4 Customer Orders API

**File**: `backend/src/routes/orders.js` (ADD)

**New Endpoint**:
```javascript
// GET /api/orders - List authenticated user's orders
// Query params: status, limit, offset
```

**Implementation**: Filter orders by `userId` from JWT

**Why**: Frontend "My Orders" page needs to fetch user's orders.

**Estimated Time**: 15 minutes

---

### 2.5 Enhanced Products API

**File**: `backend/src/routes/products.js` (UPDATE)

**Changes**:
```javascript
// GET /api/products - Add better filtering
// Query params: status, search, category, minPrice, maxPrice, inStockOnly
// Response includes: _count { orders }
```

**Why**: Frontend has advanced product filtering UI.

**Estimated Time**: 10 minutes

---

## Phase 3: Frontend Integration Layer

### 3.1 Create API Client (Frontend)

**File**: `apps/frontend/src/services/api.ts` (NEW)

**Features**:
- Base URL: `http://localhost:4000/api`
- Automatic JWT token injection
- Request/response interceptors
- Error handling
- TypeScript types

**Endpoints**:
```typescript
// Auth
login(email, password)
register(userData)
logout()
getProfile()

// Products
getProducts(filters)
getProduct(id)

// Orders
createOrder(orderData)
getOrders()
getOrder(id)
trackOrder(orderNumber)  // Public endpoint

// Prescriptions
uploadPrescription(data)
getPrescriptions()
getPrescription(id)
```

**Estimated Time**: 30 minutes

---

### 3.2 Auth Context (Frontend)

**File**: `apps/frontend/src/context/AuthContext.tsx` (NEW)

**Features**:
- JWT token management
- Auto-login on page refresh
- Auth state persistence
- Protected route wrapper

**Estimated Time**: 20 minutes

---

## Phase 4: Migration & Deployment

### 4.1 Database Migration

```bash
cd backend
npx prisma migrate dev --name add_customer_prescription_support
npx prisma generate
```

**Creates**: New tables and relations

**Estimated Time**: 5 minutes

---

### 4.2 Seed Test Data

**File**: `backend/prisma/seed.js`

**Add**:
- Test customer accounts
- Sample prescriptions (various statuses)
- Test orders with different statuses

**Purpose**: Frontend testing without manual data entry

**Estimated Time**: 15 minutes

---

### 4.3 CORS Configuration

**File**: `backend/src/app.js`

**Update**:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))
```

**Why**: Allow frontend dev server to access API

**Estimated Time**: 5 minutes

---

## Phase 5: Testing & Validation

### 5.1 API Tests (Postman/Newman)

**Test Scripts**: `backend/tests/api/`

**Coverage**:
- Customer registration/login
- Prescription upload & status flow
- Public order tracking
- Product filtering

**Estimated Time**: 30 minutes

---

### 5.2 Frontend Integration Tests

**Test Scenarios**:
1. Customer can register and login
2. Product list loads from backend
3. Prescription upload works end-to-end
4. Order placement creates backend record
5. Public order tracking works without login

**Estimated Time**: 45 minutes

---

## Summary Timeline

| Phase | Task | Time |
|-------|------|------|
| **1** | Database schema updates | 25 min |
| **2** | API endpoints (prescriptions, public tracking, auth) | 95 min |
| **3** | Frontend API client & auth | 50 min |
| **4** | Migration & deployment prep | 25 min |
| **5** | Testing | 75 min |
| **TOTAL** | | **~4.5 hours** |

---

## Deliverables

### Backend Changes
- [ ] Schema: Add CUSTOMER user type
- [ ] Schema: Add Prescription model
- [ ] Schema: Update Order model (orderNumber, paymentStatus)
- [ ] Routes: Prescription CRUD API
- [ ] Routes: Public order tracking endpoint
- [ ] Routes: Enhanced auth (customer support)
- [ ] Routes: Customer orders endpoint
- [ ] Database migration file

### Frontend Changes
- [ ] API client service
- [ ] Auth context provider
- [ ] Update all pages to use API
- [ ] Environment config (API_URL)

### Documentation
- [ ] API documentation (Swagger/Postman)
- [ ] Integration testing guide
- [ ] Deployment checklist

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | High | Backup database, test migration on copy first |
| Frontend breaks during transition | Medium | Phase rollout, feature flags, fallback to localStorage |
| CORS/security issues | Medium | Proper CORS config, rate limiting |
| Prescription file storage | Medium | Use base64 for MVP, plan for S3/CDN later |

---

## Success Criteria

### Phase 1 Complete When:
1. ✅ Database has new tables (Prescription, updated Order)
2. ✅ Backend API has all required endpoints
3. ✅ Frontend can:
   - Register/login as customer
   - View products from backend
   - Upload prescriptions
   - Place orders (creates backend record)
   - Track orders publicly
4. ✅ Existing data preserved (migration successful)
5. ✅ All tests passing

---

## Next Steps After Phase 1

Once backend supports all frontend features:
1. **Performance optimization**: Add caching, pagination
2. **Real-time updates**: WebSocket for order status changes
3. **Advanced features**: 
   - Inventory alerts
   - Automated expiry scanning
   - Supplier integration
   - Analytics dashboard
4. **Mobile app**: Reuse same backend API

---

## Notes

- **Start with database migration** - everything depends on schema
- **Test each endpoint** before moving to next
- **Keep frontend localStorage** as fallback during transition
- **Document all changes** for team visibility
- **Use feature flags** for gradual rollout
  
---

**Created**: 2026-04-25  
**Author**: System Analysis  
**Status**: Planning Phase  
**Next Review**: After Phase 1 database changes
