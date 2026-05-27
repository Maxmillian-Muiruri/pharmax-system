import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor - inject JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('pharmacie_user')
        if (token) {
            try {
                const parsed = JSON.parse(token)
                if (parsed?.token) {
                    config.headers.Authorization = `Bearer ${parsed.token}`
                }
            } catch (e) {
                // malformed token, ignore
            }
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('pharmacie_user')
            if (
                window.location.pathname !== '/auth/signin' &&
                window.location.pathname !== '/auth/signup'
            ) {
                window.location.href = '/auth/signin'
            }
        }
        return Promise.reject(error)
    }
)

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (userData: any) =>
        api.post('/auth/register', userData),
    logout: () =>
        api.post('/auth/logout'),
    getCurrentUser: () =>
        api.get('/auth/me'),
    updateProfile: (profileData: any) =>
        api.put('/auth/profile', profileData),
}

// ─── Product API ─────────────────────────────────────────────────────────────
// Maps backend Prisma fields → frontend Product shape
export interface ProductDTO {
    id: string
    name: string
    image: string
    category: string
    description?: string
    generic?: string
    rating: number
    price: number           // mapped from unitPrice
    purchasePrice?: number  // mapped from purchasePrice
    inStock: boolean        // mapped from quantity > 0
    stock: boolean          // same as inStock
    quantity: number        // raw quantity from backend
    status: string          // active | expired | near_expiry | out_of_stock
}

export const productApi = {
    getAll: (params?: any) =>
        api.get('/public/products', { params }).then(res => {
            const mapped: ProductDTO[] = res.data.data.map((p: any) => ({
                id: p.id,
                name: p.name,
                image: p.image || '',
                category: p.category || 'General',
                description: p.description || p.generic || '',
                generic: p.generic || '',
                rating: p.rating || 0,
                price: Number(p.unitPrice),                            // ✅ unitPrice not price
                purchasePrice: p.purchasePrice ? Number(p.purchasePrice) : undefined,
                inStock: p.quantity > 0 && p.status === 'active',     // ✅ quantity not stock
                stock: p.quantity > 0 && p.status === 'active',       // ✅ quantity not stock
                quantity: p.quantity,
                status: p.status,
            }))
            return { ...res, data: { ...res.data, data: mapped } }
        }),

    getById: (id: string) =>
        api.get(`/public/products/${id}`).then(res => {
            const p = res.data.data
            const mapped: ProductDTO = {
                id: p.id,
                name: p.name,
                image: p.image || '',
                category: p.category || 'General',
                description: p.description || p.generic || '',
                generic: p.generic || '',
                rating: p.rating || 0,
                price: Number(p.unitPrice),
                purchasePrice: p.purchasePrice ? Number(p.purchasePrice) : undefined,
                inStock: p.quantity > 0 && p.status === 'active',
                stock: p.quantity > 0 && p.status === 'active',
                quantity: p.quantity,
                status: p.status,
            }
            return { ...res, data: { ...res.data, data: mapped } }
        }),
}

// ─── Order API ───────────────────────────────────────────────────────────────
export const orderApi = {
    getAll: (params?: any) =>
        api.get('/orders', { params }),
    getById: (id: string) =>
        api.get(`/orders/${id}`),
    create: (orderData: any) =>
        api.post('/orders', orderData),
    getByTrackingNumber: (trackingNumber: string) =>
        api.get(`/orders/track/${trackingNumber}`), // public - no auth
}

// ─── Prescription API ────────────────────────────────────────────────────────
export const prescriptionApi = {
    getAll: () =>
        api.get('/prescriptions'),
    getById: (id: string) =>
        api.get(`/prescriptions/${id}`),
    upload: (data: any) =>
        api.post('/prescriptions', data),
    updateStatus: (id: string, status: string, notes?: string, price?: number) =>
        api.put(`/prescriptions/${id}/status`, {
            status,
            reviewNotes: notes,
            estimatedPrice: price,
        }),
}

// ─── Cart API ────────────────────────────────────────────────────────────────
export const cartApi = {
    get: () =>
        api.get('/cart'),
    update: (items: { productId: string; quantity: number }[]) =>
        api.put('/cart', { items }),
    clear: () =>
        api.delete('/cart'),
}

export default api