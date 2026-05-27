# PharmaOS Authentication & Authorization - Quick Start Guide

## ✅ Implementation Complete

All authentication and authorization features have been successfully implemented and tested.

---

## 🔐 Default Login Credentials

**Password for all users:** `pharma123`

| Email | User Type | Access Level |
|-------|-----------|--------------|
| superadmin1@pharmaos.com | SUPER_ADMIN | Full system access |
| admin1@pharmaos.com | ADMIN | Products, Orders, Reports, Settings |
| finance@pharmaos.com | FINANCE | Transactions, Analytics, Expenses, Incomes |
| receiving@pharmaos.com | RECEIVING_BAY | Products, Suppliers, Purchases, Import |
| manager@pharmaos.com | MANAGER | Analytics, Reports, Orders, Products |
| dispatch@pharmaos.com | DISPATCH | Orders, Customers, Alerts |
| rider@pharmaos.com | RIDER | Orders, Customers (read-only) |
| pharmacist1@pharmaos.com | PHARMACIST | POS, Products, Alerts |

---

## 🧪 Testing the System

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin1@pharmaos.com","password":"pharma123"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "uuid",
      "email": "admin1@pharmaos.com",
      "userType": "ADMIN",
      "isActive": true
    }
  }
}
```

### 2. Access Protected Resource
```bash
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Test Forbidden Access
Login as `rider@pharmaos.com`, then try to access settings:
```bash
curl http://localhost:3000/api/settings \
  -H "Authorization: Bearer RIDER_TOKEN_HERE"
```

**Response:**
```json
{
  "success": false,
  "error": "You do not have permission to access this resource",
  "code": "FORBIDDEN",
  "required": ["ADMIN", "SUPER_ADMIN"],
  "current": "RIDER"
}
```

---

## 📁 Files Created/Modified

### New Files
- `backend/src/middleware/roleGuard.js` - Role-based access control middleware
- `backend/src/utils/permissions.js` - Centralized permissions map
- `CLAUDE.md` - Complete documentation of auth system

### Modified Files
- `backend/prisma/schema.prisma` - Updated User model, added Pharmacist model
- `backend/prisma/seed.js` - Seeded 12 users + 3 pharmacists
- `backend/src/middleware/auth.js` - Updated to use userType and isActive
- `backend/src/controllers/auth.js` - Updated login response structure
- `backend/package.json` - Fixed seed script configuration
- `backend/src/routes/*.js` - All routes protected with roleGuard
- `frontend/src/components/layout/Sidebar.jsx` - Updated to use userType
- `frontend/src/services/api.js` - Added missing analytics API methods

---

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  password     String    // Bcrypt hashed
  userType     UserType  @default(ADMIN)
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  pharmacist   Pharmacist?
}
```

### Pharmacist Model
```prisma
model Pharmacist {
  id            String   @id @default(uuid())
  userId        String   @unique
  licenseNumber String   @unique
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### UserType Enum
```
SUPER_ADMIN | ADMIN | FINANCE | RECEIVING_BAY | MANAGER | DISPATCH | RIDER | PHARMACIST
```

---

## 🔒 Route Protection

| Route | Allowed Roles |
|-------|--------------|
| `/products` (read) | ADMIN, SUPER_ADMIN, PHARMACIST, MANAGER, RECEIVING_BAY |
| `/products` (write) | ADMIN, SUPER_ADMIN |
| `/orders` | ADMIN, SUPER_ADMIN, PHARMACIST, MANAGER, DISPATCH, RIDER |
| `/transactions` | ADMIN, SUPER_ADMIN, FINANCE, MANAGER, PHARMACIST |
| `/analytics` | ADMIN, SUPER_ADMIN, FINANCE, MANAGER |
| `/reports` | ADMIN, SUPER_ADMIN, FINANCE, MANAGER |
| `/expenses` | ADMIN, SUPER_ADMIN, FINANCE |
| `/incomes` | ADMIN, SUPER_ADMIN, FINANCE |
| `/settings` | ADMIN, SUPER_ADMIN |
| `/import` | ADMIN, SUPER_ADMIN, RECEIVING_BAY |
| `/prompt` | ADMIN, SUPER_ADMIN |

---

## 🚀 Next Steps

### For Frontend Integration
1. Update login page to display user type instead of role
2. Add conditional rendering based on `user.userType`
3. Implement route guards for protected pages
4. Add "Access Denied" page for 403 errors

### For Additional Features
1. Add user management UI for SUPER_ADMIN
2. Implement password change functionality
3. Add pharmacist POS validation (check Pharmacist.isActive)
4. Create audit logs for user actions
5. Add session management (logout from all devices)

---

## 🛠️ Maintenance

### Re-seed Database
```bash
cd backend
npm run seed
```

### Reset Database
```bash
npx prisma migrate reset --force
npm run seed
```

### Add New UserType
1. Update enum in `prisma/schema.prisma`
2. Run: `npx prisma db push`
3. Update `PERMISSIONS` in `src/utils/permissions.js`
4. Apply roleGuard to relevant routes

### Modify Permissions
Edit the route file and update the roleGuard call:
```javascript
router.use(roleGuard(['ADMIN', 'SUPER_ADMIN', 'NEW_ROLE']))
```

---

## 📝 Notes

- **Password**: All passwords are hashed with bcrypt (cost factor 12)
- **Token Expiry**: JWT tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`)
- **Active Check**: User `isActive` is verified on every authenticated request
- **Pharmacist Validation**: For POS operations, check both `User.userType` AND `Pharmacist.isActive`

---

## 🐛 Troubleshooting

### Login fails with "Invalid credentials"
- Verify database is seeded: `npm run seed`
- Check database connection in `.env`

### 403 Forbidden on allowed routes
- Verify token is valid and not expired
- Check user's `userType` in token
- Verify route has correct roleGuard configuration

### Database migration errors
- Reset database: `npx prisma migrate reset --force`
- Re-seed: `npm run seed`

---

**Implementation Date:** April 9, 2026  
**Status:** ✅ Complete and Tested
