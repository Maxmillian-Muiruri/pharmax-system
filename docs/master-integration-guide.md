# Master Integration & Onboarding Guide

Welcome to the PharmX ecosystem. This guide explains how the standalone **Frontend** and **PharmaOS Backend** were integrated into a unified full-stack application.

---

## 1. Getting Started (Prerequisites)

To keep the frontend and backend in sync, you must ensure the underlying database reflects the latest schema extensions.

1. **Prisma Update**:
   ```bash
   cd apps/pharmaOS-main/backend
   npx prisma db push
   ```
2. **Environment Variables**: Ensure the Frontend `services/api.ts` points to the correct backend port (defaults to `http://localhost:4000/api`).
3. **Run Both Systems**:
   - Backend: `npm run dev` in `/backend`
   - Frontend: `npm run dev` in `/frontend`

---

## 2. Core Integration Patterns

### **"Cloud-Sync" Strategy**
We follow a **Local-First** approach for the user experience:
- **Cart & Profile**: Data is initially saved to `localStorage` for instant performance.
- **Background Sync**: When a user logs in, the `CartContext` and `ProfilePage` automatically synchronize their local state with the backend database.
- **Persistence**: All details (Phone, Address, Cart Items) are now stored in Postgres via Prisma.

### **API Response Standard**
All backend controllers use a unified response wrapper:
- **Success**: `{ success: true, data: { ... } }`
- **Error**: `{ success: false, message: "...", code: "..." }`

### **Recursive Validation (.passthrough)**
Because the frontend sends complex checkout data (nested billing and shipping), we use `zod.passthrough()` in the backend schemas (`src/middleware/schemas.js`). This prevents the validator from stripping fields that the database needs for order processing.

---

## 3. Feature-to-File Reference

| Feature | Frontend File | Backend Controller | Data Source |
| :--- | :--- | :--- | :--- |
| **Authentication** | `src/context/AuthContext.tsx` | `controllers/auth.js` | `User` Table |
| **Shopping Cart** | `src/context/CartContext.tsx` | `controllers/cartController.js` | `CartItem` Table |
| **Product List**| `src/app/products/page.tsx` | `controllers/productController.js` | `Product` Table |
| **Order Tracking**| `src/app/orders/[id]/page.tsx` | `controllers/orderController.js` | `Order` Table |
| **Prescriptions** | `src/app/prescriptions/page.tsx`| `controllers/prescriptionController.js` | `Prescription` Table |

---

## 4. Key Improvements & "Fixed" Gotchas

### **Numeric Precision (Order Totals)**
The backend originally suffered from `NaN` errors during checkout. We implemented `parseFloat()` in the `orderController.js` to ensure the currency logic remains production-stable.

### **UUID & Order Number Support**
The tracking system was upgraded to support both **Order Numbers** (e.g., `ORD-XXXX`) and **Database UUIDs**. This ensures that direct links from "My Orders" work seamlessly without 404 errors.

### **Missing Identity (Name Mapping)**
The backend `authenticate` middleware was updated to include the `name` field in the session. Without this, the profile page would appear as "Not Set" even after a successful login.

---

## 5. Developer Tools (Simulation)

To test the pharmacist verification flow without a separate Admin login, we added a **"Demo: Verify Now"** button on the prescription cards. This button directly calls the `PUT /api/prescriptions/:id/status` endpoint to simulate a completed review.

---

**Documentation Maintainer**: AI Coding Assistant (Antigravity)
**Last Updated**: April 2026
