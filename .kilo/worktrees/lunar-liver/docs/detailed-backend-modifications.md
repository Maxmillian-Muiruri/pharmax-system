# Detailed Backend Modifications: Solo Frontend Integration

This document lists every backend file affected, the specific functions updated, and the code added to support the PharmX frontend.

---

## 1. Database Layer (`prisma/schema.prisma`)
**Modifications:**
- Updated the `User` model to include profile fields and a relation to `CartItem`.
- Updated the `Product` model to include a relation to `CartItem`.
- Added the `CartItem` model.

```prisma
model User {
  // ... existing fields ...
  phone         String?
  gender        String?
  dateOfBirth   DateTime?
  address       String?
  profilePicture String?
  cartItems     CartItem[]
}

model Product {
  // ... existing fields ...
  cartItems     CartItem[]
}

model CartItem {
  id        String   @id @default(uuid())
  userId    String
  productId String
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([userId, productId])
  @@index([userId])
}
```

---

## 2. Authentication Module
### `src/middleware/auth.js`
**Modification**: Included `name` in the user selection to ensure it's passed to the frontend.
```javascript
const user = await prisma.user.findUnique({
  where: { id: payload.sub },
  select: { id: true, email: true, name: true, userType: true, isActive: true }, // Added 'name'
})
```

### `src/controllers/auth.js`
**Addition**: Created the `updateProfile` function.
```javascript
export async function updateProfile(req, res, next) {
  const { name, phone, gender, dateOfBirth, address, profilePicture } = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone, gender, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, address, profilePicture },
    select: { id: true, email: true, name: true, phone: true, gender: true, dateOfBirth: true, address: true, profilePicture: true, userType: true, isActive: true }
  });
  // ... returns updatedUser
}
```

### `src/routes/auth.js`
**Addition**: Added the profile route.
```javascript
router.put('/profile', authenticate, updateProfile)
```

---

## 3. Order & Checkout Module
### `src/controllers/orderController.js`
**Modifications**:
- **NaN Fix**: Added `parseFloat` to `totalAmount` calculation.
- **Payload Parsing**: Updated logic to handle nested `shippingAddress` and `billingInfo`.
- **UUID Support**: Enhanced `getOrderByTrackingNumber` to allow direct navigation using database IDs.
```javascript
// Example modification for UUID support:
const order = await prisma.order.findFirst({
  where: { OR: [{ orderNumber: id }, { id: id }] },
  include: { product: true }
});
```

### `src/middleware/schemas.js`
**Modification**: Updated `createOrderSchema` to prevent stripping frontend-specific keys (like `billingInfo`).
```javascript
export const createOrderSchema = zod.object({
  // ... existing fields ...
}).passthrough(); // Added .passthrough()
```

---

## 4. Shopping Cart Module (NEW)
### `src/controllers/cartController.js` [NEW FILE]
**Code**: Implemented `getCart`, `updateCart` (Clear & Replace sync), and `clearCart`.

### `src/routes/cart.js` [NEW FILE]
**Code**: Defined endpoints for the above controller.

---

## 5. Main Application Configuration
### `src/app.js`
**Modifications**:
- Imported `cartRouter`.
- Registered `app.use("/api/cart", cartRouter)`.

---

**Note**: All changes were designed to ensure that data captured by your solo frontend (like checkout details and profile edits) have a permanent home in the underlying pharmacy system's database.
