import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor - always attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - unwrap .data and handle errors
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401 &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/refresh')) {

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          // No refresh token, clear auth and redirect to login
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          delete api.defaults.headers.common['Authorization']
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(error)
        }

        // Attempt to refresh token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        )

        const { token: newToken, refreshToken: newRefreshToken } = response.data.data

        // Save new tokens
        localStorage.setItem('token', newToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Update default header
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

        // Process queued requests
        processQueue(null, newToken)

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        processQueue(refreshError, null)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        delete api.defaults.headers.common['Authorization']
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    const message = error.response?.data?.error || error.response?.data?.message || 'Request failed. Please try again.'
    return Promise.reject(new Error(message))
  }
)

export default api

// Products API
export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  remove: (id) => api.delete(`/products/${id}`),
}

// Orders API
export const ordersApi = {
  getAll: (params) => api.get('/orders', { params }),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
}

// Alerts API
export const alertsApi = {
  getAll: (params) => api.get('/alerts', { params }),
  runScan: () => api.post('/alerts/run'),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  markAllRead: () => api.put('/alerts/read-all'),
}

// Analytics API
export const analyticsApi = {
  sales: (period) => api.get('/analytics/sales', { params: { period } }),
  topProducts: (params) => api.get('/analytics/top-products', { params }),
  dashboard: () => api.get('/analytics/dashboard'),
  profitLoss: (params) => api.get('/analytics/profit-loss', { params }),
  revenue: (params) => api.get('/analytics/revenue', { params }),
}

// Transactions API
export const transactionsApi = {
  getAll: (params) => api.get('/transactions', { params }),
  getSummary: () => api.get('/transactions/summary'),
}

// Prompt API
export const promptApi = {
  query: (query) => api.post('/prompt', { query }),
}

// Import API
export const importApi = {
  uploadCSV: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/import/products', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// Reports API
export const reportsApi = {
  getInventory: () => api.get('/reports/inventory'),
  getExpiry: () => api.get('/reports/expiry'),
  getSales: () => api.get('/reports/sales'),
}

// Customers API
export const customersApi = {
  getAll: (params) => api.get('/customers', { params }),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  remove: (id) => api.delete(`/customers/${id}`),
  getTop: () => api.get('/customers/top'),
}

// Suppliers API
export const suppliersApi = {
  getAll: (params) => api.get('/suppliers', { params }),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  remove: (id) => api.delete(`/suppliers/${id}`),
}

// Purchases API
export const purchasesApi = {
  getAll: (params) => api.get('/purchases', { params }),
  create: (data) => api.post('/purchases', data),
  update: (id, data) => api.put(`/purchases/${id}`, data),
  remove: (id) => api.delete(`/purchases/${id}`),
  getSummary: (params) => api.get('/purchases/summary', { params }),
}

// Expenses API
export const expensesApi = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  remove: (id) => api.delete(`/expenses/${id}`),
  getSummary: (params) => api.get('/expenses/summary', { params }),
}

// Incomes API
export const incomesApi = {
  getAll: (params) => api.get('/incomes', { params }),
  create: (data) => api.post('/incomes', data),
  update: (id, data) => api.put(`/incomes/${id}`, data),
  remove: (id) => api.delete(`/incomes/${id}`),
  getSummary: (params) => api.get('/incomes/summary', { params }),
}

// Settings API
export const settingsApi = {
  getAll: () => api.get('/settings'),
  get: (key) => api.get(`/settings/${key}`),
  update: (key, data) => api.put(`/settings/${key}`, data),
  updateBulk: (data) => api.put('/settings/bulk', data),
}
