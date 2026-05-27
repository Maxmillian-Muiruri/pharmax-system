# Backend-Frontend Integration Documentation

## Overview

This document provides step-by-step instructions for integrating the PharmX frontend (`apps/frontend`) with the PharmaOS backend (`apps/pharmaOS-main (3)/backend`).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Backend Configuration](#backend-configuration)
4. [Frontend API Client](#frontend-api-client)
5. [Authentication Integration](#authentication-integration)
6. [Product Integration](#product-integration)
7. [Order Integration](#order-integration)
8. [Prescription Integration](#prescription-integration)
9. [Environment Setup](#environment-setup)
10. [Running Both Applications](#running-both-applications)
11. [API Reference](#api-reference)

---

## Architecture Overview

| Component | Technology | Port |
|-----------|------------|------|
| Frontend | React + Vite | 3000 |
| Backend | Express.js + Prisma | 4000 (default) |
| Database | PostgreSQL | - |

**Authentication**: JWT-based with access/refresh tokens  
**API Base URL**: `http://localhost:4000/api`

---

## Prerequisites

1. Node.js 18+ installed
2. PostgreSQL database running
3. Backend `.env` file configured with database URL

---

## Backend Configuration

### 1. Update CORS Configuration

Edit `apps/pharmaOS-main (3)/backend/src/app.js`:

```javascript
// Line 37-41 - Update CLIENT_URL
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '')
app.use(cors({
  origin: clientUrl,
  credentials: true,
}))
```

### 2. Backend Environment Variables

Create `apps/pharmaOS-main (3)/backend/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pharmx?schema=public"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_EXPIRES_IN="30d"

# CORS
CLIENT_URL="http://localhost:3000"

# Server
PORT=4000
NODE_ENV=development
```

### 3. Create Public Product Route (Optional)

If you want products to be accessible without authentication, create a new route:

`apps/pharmaOS-main (3)/backend/src/routes/publicProducts.js`:

```javascript
import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

// Public product listing (no auth required)
router.get('/', async (req, res) => {
  try {
    const { search, category, inStock } = req.query
    const where = {}

    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }
    if (category) {
      where.category = category
    }
    if (inStock === 'true') {
      where.quantity = { gt: 0 }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        _count: { select: { orders: true } }
      }
    })

    res.json({ success: true, data: products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        _count: { select: { orders: true } }
      }
    })

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    res.json({ success: true, data: product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
```

Register in `apps/pharmaOS-main (3)/backend/src/app.js`:

```javascript
import publicProductsRouter from './routes/publicProducts.js'

// Add before protected routes (line 62)
app.use('/api/public/products', publicProductsRouter)
```

---

## Frontend API Client

### Create API Client

Create `apps/frontend/src/lib/api.ts`:

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    localStorage.setItem('token', token)
  }

  getToken() {
    return this.token || localStorage.getItem('token')
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers)
    const token = this.getToken()

    if (token) headers.set('Authorization', `Bearer ${token}`)
    headers.set('Content-Type', 'application/json')

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
    const data = await res.json()

    if (!res.ok) throw new Error(data.message || 'Request failed')
    return data
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ token: string; refreshToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getMe() {
    return this.request<any>('/auth/me')
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' })
  }

  // Products
  async getProducts(params?: { search?: string; category?: string; inStock?: boolean }) {
    const q = new URLSearchParams(params as any).toString()
    return this.request<any[]>(`/public/products?${q}`)
  }

  async getProduct(id: string) {
    return this.request<any>(`/public/products/${id}`)
  }

  // Orders
  async getOrders() {
    return this.request<any[]>('/orders')
  }

  async getOrder(id: string) {
    return this.request<any>(`/orders/${id}`)
  }

  async createOrder(data: {
    customerName: string
    customerPhone: string
    customerEmail?: string
    productId: string
    quantity: number
    totalAmount: number
    shippingAddress?: any
  }) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Prescriptions
  async getPrescriptions() {
    return this.request<any[]>('/prescriptions')
  }

  async createPrescription(data: {
    patientName: string
    phoneNumber: string
    email: string
    doctorName: string
    hospitalName: string
    address: string
    notes?: string
    files?: any[]
  }) {
    return this.request<any>('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updatePrescription(id: string, data: any) {
    return this.request<any>(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiClient()
```

---

## Authentication Integration

### Create Auth Context

Update `apps/frontend/src/context/index.tsx`:

```typescript
import React, { createContext, useState, useEffect } from "react"
import { api } from "../lib/api"

interface User {
  id: string
  email: string
  name: string
  userType: string
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')

      if (token) {
        api.setToken(token)
        try {
          const res = await api.getMe()
          setUser(res.data)
        } catch {
          api.clearToken()
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password)
    const { token, refreshToken, user } = res.data
    api.setToken(token)
    localStorage.setItem('refreshToken', refreshToken)
    setUser(user)
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {}
    api.clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Update Signin Page

Update `apps/frontend/src/app/auth/signin/page.tsx`:

```typescript
import { useState, type FormEvent, type ChangeEvent, useContext } from 'react'
import { Mail, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthContext } from '../../../context'

export const Signin = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false })
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!loginData.email || !loginData.password) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      toast.loading('Signing in...')
      await login(loginData.email, loginData.password)
      toast.dismiss()
      toast.success('Welcome back!')
      navigate('/')
    } catch (error) {
      toast.dismiss()
      toast.error('Invalid credentials')
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-teal-800 mb-1">Sign in</h2>
      <p className="text-gray-500 mb-6">Enter your credentials to access your account</p>

      <form onSubmit={handleLogin}>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all bg-gray-50 focus:bg-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-teal-600 text-white font-semibold rounded-lg cursor-pointer transition-all hover:bg-teal-700 active:scale-[0.98] shadow-lg hover:shadow-xl mb-6"
        >
          Sign in
        </button>
      </form>
    </div>
  )
}

export default Signin
```

---

## Product Integration

### Update Products Page

Update `apps/frontend/src/app/products/page.tsx` to fetch from API:

```typescript
import { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { api } from '../../lib/api'
import { ProductCard } from '../../components/ProductCard'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card } from '../../components/ui/card'

interface Product {
  id: string
  name: string
  category?: string
  quantity: number
  unitPrice: number
  status: string
  expiryDate?: string
}

export const ProductList = () => {
  const { addItem } = useCart()
  const { addToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.getProducts({ search: searchQuery })
        setProducts(res.data || [])
      } catch (error) {
        console.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [searchQuery])

  const handleAddToCart = (product: Product) => {
    addItem({
      name: product.name,
      category: product.category || 'General',
      brand: 'PharmX',
      packSize: '1 pack',
      unitPrice: Number(product.unitPrice),
      quantity: 1,
      requiresPrescription: false,
      stockStatus: product.quantity > 0 ? 'in_stock' : 'out_of_stock',
      imageType: 'tablet',
    })
    addToast({
      type: 'success',
      message: `${product.name} added to cart!`,
      duration: 3000,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl mb-2">All Products</h1>
          <p className="text-lg text-white/90">Browse our complete range of medicines and health products</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-6"
        />

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  category: product.category || 'General',
                  price: Number(product.unitPrice),
                  inStock: product.quantity > 0,
                  image: '/placeholder.png',
                }}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Order Integration

### Update Checkout Page

Update `apps/frontend/src/app/checkout/page.tsx`:

```typescript
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context'
import { CartContext } from '../../context/CartContext'
import { api } from '../../lib/api'
import { toast } from 'sonner'

export const Checkout = () => {
  const { user } = useContext(AuthContext)
  const { items, clearCart, getSubtotal } = useContext(CartContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handlePlaceOrder = async () => {
    if (!items.length) return

    setLoading(true)
    try {
      const orderData = {
        customerName: user?.name || 'Guest',
        customerPhone: user?.phone || '0000000000',
        customerEmail: user?.email,
        productId: items[0].id, // Simplified - create order items
        quantity: items[0].quantity,
        totalAmount: getSubtotal(),
        shippingAddress: {},
      }

      await api.createOrder(orderData)
      clearCart()
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (error) {
      toast.error('Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Checkout form UI */}
      <button
        onClick={handlePlaceOrder}
        disabled={loading || !items.length}
        className="bg-teal-600 text-white px-6 py-3 rounded-lg"
      >
        {loading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  )
}

export default Checkout
```

---

## Environment Setup

### Frontend `.env`

Create `apps/frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_TITLE=PharmX
```

---

## Running Both Applications

### Terminal 1 - Backend

```bash
cd "apps/pharmaOS-main (3)/backend"
npm install
npx prisma generate
npm run dev
```

### Terminal 2 - Frontend

```bash
cd apps/frontend
npm install
npm run dev
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login, returns token + user |
| GET | `/api/auth/me` | Yes | Current user profile |
| POST | `/api/auth/logout` | Yes | Invalidate token |
| POST | `/api/auth/refresh` | No | Refresh access token |
| GET | `/api/public/products` | No | Product listing (public) |
| GET | `/api/public/products/:id` | No | Single product |
| GET | `/api/products` | Yes | Product listing (protected) |
| POST | `/api/orders` | Yes | Create new order |
| GET | `/api/orders` | Yes | List user orders |
| GET | `/api/orders/:id` | Yes | Single order details |
| GET | `/api/prescriptions` | Yes | List prescriptions |
| POST | `/api/prescriptions` | Yes | Create prescription |

---

## Database Schema Reference

Key models from `prisma/schema.prisma`:

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  category    String?
  quantity    Int      @default(0)
  unitPrice   Decimal  @db.Decimal(10, 2)
  expiryDate  DateTime @db.Date
  status      ProductStatus @default(active)
}

model Order {
  id              String   @id @default(uuid())
  orderNumber     String   @unique
  customerName    String
  customerPhone   String
  customerEmail   String?
  quantity        Int
  totalAmount     Decimal  @db.Decimal(10, 2)
  status          OrderStatus @default(pending)
}

model Prescription {
  id          String   @id @default(uuid())
  patientName String
  phoneNumber String
  email       String
  files       Json
  status      PrescriptionStatus @default(under_review)
}
```

---

*Last Updated: May 2026*