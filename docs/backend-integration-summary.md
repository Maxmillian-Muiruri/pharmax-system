# Backend Integration Summary: Supporting the PharmX Frontend

This document provides a technical overview of the changes made to the backend to support full integration with the consumer-facing frontend.

## 1. Database Schema Extensions (`prisma/schema.prisma`)
To support persistent user profiles and cross-device cart synchronization, the database was expanded:
- **User Model**: Added `phone`, `gender`, `dateOfBirth`, `address`, and `profilePicture` fields.
- **CartItem Model (NEW)**: Created a new model to store shopping cart items linked to users and products.
- **Product Model**: Added a two-way relation to `CartItem`.

## 2. Authentication & Profile Updates
### Modified: `src/middleware/auth.js`
- **User Selection**: Updated the `authenticate` middleware to include the user's `name` when verifying tokens. This ensures the frontend receives the full identity of the user upon login.

### Modified: `src/controllers/auth.js`
- **`updateProfile` (NEW)**: Implemented this function to handle incoming profile updates (`PUT /api/auth/profile`), allowing users to persist their personal details to the database.

### Modified: `src/routes/auth.js`
- Added the `PUT /profile` endpoint, protected by the `authenticate` middleware.

## 3. Persistent Shopping Cart (New Module)
### Created: `src/controllers/cartController.js`
- **`getCart`**: Retrieves all saved items for a logged-in user, joining with product details (name, price).
- **`updateCart`**: Implements a "Clear & Replace" synchronization logic to ensure the cloud cart matches the user's latest local state.
- **`clearCart`**: Wipes the user's cart after a successful checkout.

### Created: `src/routes/cart.js`
- Mounted at `/api/cart`, providing `GET`, `PUT`, and `DELETE` methods for authenticated users.

## 4. Order & Checkout Logic Improvements
### Modified: `src/controllers/orderController.js`
- **Data Parsing**: Fixed a critical bug where `totalAmount` was being calculated as `NaN` by adding `parseFloat()` to numeric inputs.
- **Support for Flexible Data**: Updated `createOrder` to correctly parse nested shipping and billing information sent from the frontend checkout form.
- **Enhanced Tracking**: Updated the tracking logic to support searches by both `orderNumber` (e.g., ORD-XXX) AND database `UUID` to prevent 404 errors during direct navigation.

### Modified: `src/middleware/schemas.js`
- **Schema Validation**: Updated the `createOrderSchema` to be more permissive, preventing the automatic stripping of essential checkout metadata needed for payment processing.

## 5. Global Registry (`src/app.js`)
- Registered the new `cartRouter` to the main express application at the `/api/cart` prefix.

---

**Summary of Impact**: These changes transitioned the application from a "Mock/Local-Only" state to a robust, cloud-connected system where user identity, shopping state, and order history are securely persisted in a central database.
