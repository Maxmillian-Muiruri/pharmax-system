# Frontend-Backend Integration Guide

## Overview

Your frontend application currently operates as a standalone client with localStorage-based data management. The backend provides a comprehensive pharmacy management API. This guide explains what needs to be integrated and how to connect the frontend to the backend.

## Current Frontend State Analysis

### What the Frontend Currently Does

- **Products**: Uses hardcoded `allProducts` array in `products/page.tsx`
- **Cart**: Uses `CartContext` with localStorage persistence
- **Orders**: Uses `prescriptions.ts` utilities for localStorage-based order management
- **Authentication**: Has UI components but no actual API integration
- **Prescriptions**: Uses localStorage for prescription uploads and status tracking
- **Order Tracking**: Uses localStorage to simulate order status updates

### What the Backend Provides

- **Products API**: Full CRUD operations for inventory management
- **Orders API**: Order creation, status updates, and tracking
- **Customers API**: Customer management and order history
- **Authentication API**: JWT-based user authentication
- **Prescriptions**: Processing and status management
- **Analytics**: Sales data and reporting

## Integration Requirements

### 1. API Client Setup

First, you need to create an API client to communicate with the backend:

```typescript
// src/services/api.ts
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.data.token);
    return response.data;
  }

  async register(userData: any) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    this.setToken(response.data.token);
    return response.data;
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  // Products endpoints
  async getProducts(params?: any) {
    const query = params ? new URLSearchParams(params).toString() : "";
    return this.request(`/products?${query}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  // Orders endpoints
  async createOrder(orderData: any) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return this.request("/orders");
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Customers endpoints
  async createCustomer(customerData: any) {
    return this.request("/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  async getCustomers() {
    return this.request("/customers");
  }

  // Add more endpoint methods as needed...
}

export const apiClient = new ApiClient(API_BASE_URL);
```

### 2. Authentication Integration

#### Update Auth Context

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  userType: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiClient.getCurrentUser()
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          apiClient.clearToken();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiClient.register(userData);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### Update Signin Component

```typescript
// src/app/auth/signin/page.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
// ... existing imports

export const Signin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      addToast({
        type: "success",
        message: "Login successful!",
        duration: 3000,
      });
      navigate("/");
    } catch (error: any) {
      addToast({
        type: "error",
        message: error.message || "Login failed",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of component remains similar
};
```

### 3. Products Integration

#### Update Product List Page

```typescript
// src/app/products/page.tsx
import { useState, useEffect } from "react";
import { apiClient } from "../../services/api";
// ... existing imports

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProducts({
        search: filters.search || undefined,
        status: filters.status || undefined,
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Remove the hardcoded allProducts array
  // Update filtering logic to work with API data
  // The rest of the component can remain similar

  // ... rest of component
};
```

### 4. Orders Integration

#### Update Order Creation (Checkout)

```typescript
// src/app/checkout/page.tsx
import { apiClient } from "../../services/api";
// ... existing imports

const handlePlace = async () => {
  setPlacing(true);

  try {
    // Transform frontend order data to backend format
    const orderData = {
      customerName: shipping.firstName + " " + shipping.lastName,
      customerPhone: shipping.phone,
      productId: cartItems[0].id, // Assuming single product for now
      quantity: cartItems[0].quantity,
    };

    const response = await apiClient.createOrder(orderData);

    // Backend will return order with ID
    const orderId = response.data.id;

    // Update local storage for tracking
    saveOrder({
      id: orderId,
      date: new Date().toISOString(),
      items: cartItems,
      total: subtotal + deliveryFee + tax,
      estimatedDelivery: delivery === "express" ? "Same day" : "2-4 hours",
      status: "pending",
      shippingInfo: shipping,
      paymentMethod: payMethod,
      transactionId: "TXN-" + orderId,
      isPrescriptionOrder: !!prescriptionData,
      prescriptionId: prescriptionData?.id ?? null,
    });

    clearCart();
    if (prescriptionData) {
      clearCheckoutPrescriptionId();
    }

    addToast({
      type: "success",
      message: "Order placed successfully!",
      duration: 3000,
    });
    navigate("/orders");
  } catch (error: any) {
    addToast({
      type: "error",
      message: error.message || "Failed to place order",
      duration: 5000,
    });
  } finally {
    setPlacing(false);
  }
};
```

#### Update Order Tracking

```typescript
// src/trackorder/OrderTracking.tsx
import { apiClient } from "../services/api";

const fetchOrderData = async (orderNum: string) => {
  setIsLoading(true);
  setSearched(true);

  try {
    // Try to get order from backend first
    const response = await apiClient.getOrder(orderNum);
    const orderData = response.data;

    // Transform backend data to frontend format
    setOrderData(transformBackendOrder(orderData));
  } catch (error) {
    // Fallback to localStorage if backend call fails
    const stored = getStoredOrderById(orderNum);
    if (stored) {
      setOrderData(mapStoredOrderToOrderData(stored));
    } else {
      setOrderData(null);
    }
  } finally {
    setIsLoading(false);
  }
};

const transformBackendOrder = (backendOrder: any) => {
  return {
    orderNumber: backendOrder.id,
    status: backendOrder.status,
    orderDate: backendOrder.createdAt,
    estimatedDelivery: "2-4 business days", // Could be calculated from backend
    currentLocation: getLocationFromStatus(backendOrder.status),
    items: backendOrder.items || [],
    customer: {
      name: backendOrder.customerName,
      phone: backendOrder.customerPhone,
      email: backendOrder.customer?.email || "",
    },
    shippingAddress: {
      street: backendOrder.customer?.address || "",
      city: "",
      state: "",
      zipCode: "",
    },
    timeline: generateTimeline(backendOrder),
    total: Number(backendOrder.totalAmount),
  };
};
```

### 5. Customer Data Integration

#### Update Customer Creation

```typescript
// During checkout or registration
const createCustomerIfNeeded = async (customerData: any) => {
  try {
    // Check if customer exists
    const existingCustomers = await apiClient.getCustomers({
      search: customerData.email,
    });

    if (existingCustomers.data.length === 0) {
      // Create new customer
      await apiClient.createCustomer({
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
      });
    }
  } catch (error) {
    console.error("Failed to create customer:", error);
  }
};
```

### 6. Prescriptions Integration

#### Backend Requirements for Prescriptions

The backend currently doesn't have prescription management endpoints. You need to add:

```typescript
// Add to backend/src/routes/index.js and controllers
// New routes needed:
// POST /api/prescriptions - Upload prescription
// GET /api/prescriptions - List user prescriptions
// GET /api/prescriptions/:id - Get prescription details
// PUT /api/prescriptions/:id/status - Update prescription status

// Database schema additions needed:
// model Prescription {
//   id          String   @id @default(uuid())
//   userId      String
//   patientName String
//   files       Json     // Store file data URLs or paths
//   status      String   @default("under_review")
//   notes       String?
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt
// }
```

### 7. Environment Configuration

Add to your frontend's environment files:

```bash
# .env.local
VITE_API_URL=http://localhost:3000/api

# .env.production
VITE_API_URL=https://your-api-domain.com/api
```

### 8. Error Handling and Loading States

Update components to handle API loading states and errors:

```typescript
// Add loading states to components
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Handle API errors
try {
  setLoading(true);
  const response = await apiClient.getProducts();
  setProducts(response.data);
} catch (err: any) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

## Backend Changes Required

### 1. Add Customer User Type to Database Schema

Add `CUSTOMER` to the UserType enum in `prisma/schema.prisma`:

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
  CUSTOMER  // Add this line
}
```

### 2. Add Prescription Model to Database Schema

Add this model to `prisma/schema.prisma`:

```prisma
model Prescription {
  id            String           @id @default(uuid())
  userId        String
  patientName   String
  phoneNumber   String
  email         String
  doctorName    String
  hospitalName  String
  address       String
  notes         String?
  files         Json             // Store file data URLs or paths
  status        PrescriptionStatus @default(under_review)
  estimatedPrice Decimal?        @db.Decimal(10, 2)
  reviewNotes   String?
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  user          User             @relation(fields: [userId], references: [id])
}

enum PrescriptionStatus {
  under_review
  available
  out_of_stock
  rejected
}
```

Also add relation to User model:

```prisma
model User {
  // ... existing fields
  prescriptions Prescription[]
}
```

### 3. Add User Registration Endpoint

Create `backend/src/controllers/auth.js` function:

```javascript
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new AppError(
        "Email, password, and name are required",
        400,
        "VALIDATION_ERROR",
      );
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      throw new AppError("User already exists", 409, "USER_EXISTS");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        userType: "CUSTOMER", // Regular customers
      },
      select: {
        id: true,
        email: true,
        name: true,
        userType: true,
        isActive: true,
      },
    });

    const token = signAccessToken(user.id);

    res.json({
      success: true,
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}
```

Add route in `backend/src/routes/auth.js`:

```javascript
import { register } from "../controllers/auth.js";
// ... existing imports

router.post("/register", register);
```

### 4. Create Prescription Controller

Create new file `backend/src/controllers/prescriptionController.js`:

```javascript
import prisma from "../lib/prisma.js";
import { sendSuccess } from "../utils/responseHelper.js";

export async function uploadPrescription(req, res, next) {
  try {
    const {
      patientName,
      phoneNumber,
      email,
      doctorName,
      hospitalName,
      address,
      notes,
      files,
    } = req.body;

    const prescription = await prisma.prescription.create({
      data: {
        userId: req.user.id,
        patientName,
        phoneNumber,
        email,
        doctorName,
        hospitalName,
        address,
        notes,
        files,
      },
    });

    sendSuccess(res, 201, prescription, "Prescription uploaded successfully");
  } catch (error) {
    next(error);
  }
}

export async function getUserPrescriptions(req, res, next) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    sendSuccess(res, 200, prescriptions);
  } catch (error) {
    next(error);
  }
}

export async function getPrescription(req, res, next) {
  try {
    const { id } = req.params;
    const prescription = await prisma.prescription.findFirst({
      where: {
        id,
        userId: req.user.id, // Only allow users to see their own prescriptions
      },
    });

    if (!prescription) {
      return res
        .status(404)
        .json({
          success: false,
          error: "Prescription not found",
          code: "NOT_FOUND",
        });
    }

    sendSuccess(res, 200, prescription);
  } catch (error) {
    next(error);
  }
}

export async function updatePrescriptionStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reviewNotes, estimatedPrice } = req.body;

    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
      },
    });

    sendSuccess(res, 200, prescription, "Prescription status updated");
  } catch (error) {
    next(error);
  }
}
```

### 5. Create Prescription Routes

Create new file `backend/src/routes/prescriptions.js`:

```javascript
import { Router } from "express";
import {
  uploadPrescription,
  getUserPrescriptions,
  getPrescription,
  updatePrescriptionStatus,
} from "../controllers/prescriptionController.js";
import { roleGuard } from "../middleware/roleGuard.js";
import { validate } from "../middleware/validate.js";
import { prescriptionSchema } from "../middleware/schemas.js";

const router = Router();

// Customer can upload and view their prescriptions
router.use(roleGuard(["CUSTOMER", "ADMIN", "SUPER_ADMIN"]));

router.post("/", validate(prescriptionSchema), uploadPrescription);
router.get("/", getUserPrescriptions);
router.get("/:id", getPrescription);

// Admin can update prescription status
router.put(
  "/:id/status",
  roleGuard(["ADMIN", "SUPER_ADMIN"]),
  updatePrescriptionStatus,
);

export default router;
```

### 6. Add Prescription Validation Schema

Add to `backend/src/middleware/schemas.js`:

```javascript
export const prescriptionSchema = z.object({
  patientName: z.string().min(1),
  phoneNumber: z.string().min(1),
  email: z.string().email(),
  doctorName: z.string().min(1),
  hospitalName: z.string().min(1),
  address: z.string().min(1),
  notes: z.string().optional(),
  files: z
    .array(
      z.object({
        name: z.string(),
        size: z.number(),
        type: z.string(),
        dataUrl: z.string(),
      }),
    )
    .min(1),
});
```

### 7. Add Public Order Tracking Endpoint

Add to `backend/src/controllers/orderController.js`:

```javascript
export async function getOrderByIdPublic(req, res, next) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: "Order not found", code: "NOT_FOUND" });
    }

    sendSuccess(res, 200, order);
  } catch (error) {
    next(error);
  }
}
```

Add to `backend/src/routes/orders.js`:

```javascript
// Public route for order tracking (no authentication required)
router.get("/track/:id", getOrderByIdPublic);
```

### 8. Update Role Guards for Customer Access

Update role guards in various route files to include 'CUSTOMER':

**Products routes** (`backend/src/routes/products.js`):

```javascript
router.use(
  roleGuard([
    "ADMIN",
    "SUPER_ADMIN",
    "PHARMACIST",
    "RECEIVING_BAY",
    "CUSTOMER",
  ]),
);
```

**Orders routes** (`backend/src/routes/orders.js`):

```javascript
router.use(
  roleGuard([
    "ADMIN",
    "SUPER_ADMIN",
    "PHARMACIST",
    "MANAGER",
    "DISPATCH",
    "RIDER",
    "CUSTOMER",
  ]),
);
```

**Customers routes** (`backend/src/routes/customers.js`):

```javascript
router.use(
  roleGuard([
    "ADMIN",
    "SUPER_ADMIN",
    "MANAGER",
    "PHARMACIST",
    "DISPATCH",
    "RIDER",
    "CUSTOMER",
  ]),
);
router.post("/", createCustomer); // Allow customers to create themselves
```

### 9. Add Prescription Routes to Main App

Add to `backend/src/app.js`:

```javascript
import prescriptionsRouter from "./routes/prescriptions.js";

// ... existing imports

app.use("/api/prescriptions", prescriptionsRouter);
```

### 10. Run Database Migration

After making schema changes, run:

```bash
cd backend
npx prisma migrate dev --name add-customer-support
npx prisma generate
```

### 11. CORS Configuration

Ensure CORS is configured in `backend/src/app.js` to allow your frontend domain:

```javascript
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
```

### 2. Add Prescription Management (if needed)

```typescript
// New controller: backend/src/controllers/prescriptionController.js
export async function uploadPrescription(req, res, next) {
  // Handle prescription upload logic
}

export async function getUserPrescriptions(req, res, next) {
  // Get prescriptions for authenticated user
}
```

### 3. Add CORS Configuration

```typescript
// backend/src/app.js
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
```

## Migration Strategy

### Phase 1: Authentication

1. Implement API client and AuthContext
2. Update login/signup pages
3. Add authentication guards to protected routes

### Phase 2: Products

1. Replace hardcoded products with API calls
2. Update product filtering and search

### Phase 3: Orders

1. Update checkout to create orders via API
2. Modify order tracking to use backend data
3. Add order management features

### Phase 4: Enhanced Features

1. Add prescription management
2. Implement customer profiles
3. Add analytics/dashboard features

## Testing the Integration

1. **Start Backend**: Ensure the backend is running on port 3000
2. **Environment Setup**: Configure `VITE_API_URL` in frontend
3. **Test Authentication**: Try login/registration
4. **Test Products**: Verify product listing works
5. **Test Orders**: Place an order and track it
6. **Error Handling**: Test network errors and API failures

## Benefits of Integration

- **Real-time Data**: Products, orders, and inventory reflect actual state
- **Multi-user Support**: Multiple customers can use the system simultaneously
- **Data Persistence**: Orders and customer data are permanently stored
- **Scalability**: Backend can handle increased load and features
- **Security**: Proper authentication and authorization
- **Analytics**: Access to sales data and reporting features

This integration will transform your frontend from a demo application into a fully functional pharmacy management system.
