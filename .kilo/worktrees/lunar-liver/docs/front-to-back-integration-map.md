# Master Integration Map: Frontend to Backend

This document provides a definitive map of how the PharmX Frontend interacts with the Backend API, including the specific files and code logic that support each feature.

---

## 1. Authentication & Identity
| Frontend Feature | Backend Route | Supporting File(s) | Key Logic |
| :--- | :--- | :--- | :--- |
| **Signin / Signup** | `POST /api/auth/login` <br> `POST /api/auth/register` | `auth.js` (controller) | Generates JWT and Refresh tokens; sets initial `name` and `email`. |
| **Session Control** | `GET /api/auth/me` | `middleware/auth.js` | Updated the `select` block to include `name` in the payload. |
| **Profile Management** | `PUT /api/auth/profile` | `auth.js` (controller) | **[NEW]** Persists `phone`, `address`, `gender`, and `profilePicture` to DB. |

---

## 2. Product Discovery
| Frontend Feature | Backend Route | Supporting File(s) | Key Logic |
| :--- | :--- | :--- | :--- |
| **Product Listing** | `GET /api/products` | `productController.js` | Uses `findMany` with optional filters for `category` and `search`. |
| **Product Details** | `GET /api/products/:id` | `productController.js` | Fetches a single record by UUID with order counts. |

---

## 3. Persistent Shopping Cart
| Frontend Feature | Backend Route | Supporting File(s) | Key Logic |
| :--- | :--- | :--- | :--- |
| **Remote Sync** | `GET /api/cart` <br> `PUT /api/cart` | `cartController.js` **[NEW]** | Implements "Clear & Replace" logic to keep cloud and local carts in sync. |
| **Cart Clearing** | `DELETE /api/cart` | `cartController.js` **[NEW]** | Wipes the user's cart records upon successful checkout. |

---

## 4. Checkout & Order Management
| Frontend Feature | Backend Route | Supporting File(s) | Key Logic |
| :--- | :--- | :--- | :--- |
| **Final Checkout** | `POST /api/orders` | `orderController.js` | Fixed `totalAmount: NaN` bug; parses nested `billingInfo` payloads. |
| **Orders List** | `GET /api/orders` | `orderController.js` | Filters orders by the logged-in user's `userId`. |
| **Order Details** | `GET /api/orders/:id` | `orderController.js` | Returns full order status and product join. |

---

## 5. Logistics & Tracking
| Frontend Feature | Backend Route | Supporting File(s) | Key Logic |
| :--- | :--- | :--- | :--- |
| **Live Tracking** | `GET /api/orders/track/:id` | `orderController.js` | **Enhanced**: Supports search by `orderNumber` OR database `id` (UUID). |

---

## 6. Prescription Management
| Frontend Feature | Backend Route | Supporting File(s) | Key Logic |
| :--- | :--- | :--- | :--- |
| **Prescription Upload** | `POST /api/prescriptions` | `prescriptionController.js` | Saves `patientName`, `notes`, and encoded `files` to JSON field. |
| **My Prescriptions** | `GET /api/prescriptions` | `prescriptionController.js` | Fetches all uploads for the current user session. |
| **Verification (Demo)**| `PUT /api/prescriptions/:id/status` | `prescriptionController.js` | Allows updating status to `available` with an `estimatedPrice`. |

---

## 7. Crucial Infrastructure Changes
*   **`prisma/schema.prisma`**: Expanded `User` and `Product` models; added `CartItem`.
*   **`middleware/schemas.js`**: Switched `createOrderSchema` to `.passthrough()` to support custom checkout metadata.
*   **`app.js`**: Registered the new Global Route `/api/cart`.

---
**Document Version**: 1.0 (Integration Finalized)
