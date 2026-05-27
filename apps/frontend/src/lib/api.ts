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