import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useToast } from './ToastContext'

const AuthContext = createContext()

// Session activity tracking
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes of inactivity
let activityTimer = null

function resetActivityTimer() {
  if (activityTimer) clearTimeout(activityTimer)
  activityTimer = setTimeout(() => {
    // Session considered inactive after timeout
    localStorage.setItem('sessionInactive', 'true')
  }, SESSION_TIMEOUT)
}

// Track user activity across events
['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, resetActivityTimer, true)
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const toast = useToast()
  const refreshPromiseRef = useRef(null)

  // Helper function to decode JWT and check expiry
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      return null
    }
  }

  // Centralized token refresh function
  const refreshTokens = useCallback(async () => {
    // Prevent concurrent refresh attempts
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current
    }

    refreshPromiseRef.current = (async () => {
      try {
        const storedRefreshToken = localStorage.getItem('refreshToken')
        if (!storedRefreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        })

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Refresh failed' }))
          throw new Error(error.message || error.error || 'Refresh failed')
        }

        const result = await response.json()
        const { token: newToken, refreshToken: newRefreshToken } = result.data

        localStorage.setItem('token', newToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        setToken(newToken)
        setRefreshToken(newRefreshToken)
        resetActivityTimer()

        return newToken
      } catch (error) {
        // Clear all session data
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('sessionInactive')
        setToken(null)
        setRefreshToken(null)
        setUser(null)
        throw error
      } finally {
        refreshPromiseRef.current = null
      }
    })()

    return refreshPromiseRef.current
  }, [])

  // Proactive token refresh before expiry (check every 5 minutes)
  useEffect(() => {
    if (!token) return

    const checkAndRefresh = async () => {
      const decoded = decodeToken(token)
      if (!decoded || !decoded.exp) return

      const currentTime = Date.now() / 1000
      const timeUntilExpiry = decoded.exp - currentTime

      // Refresh if less than 5 minutes remaining
      if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
        try {
          await refreshTokens()
        } catch (error) {
          navigate('/login', { replace: true })
          toast.error('Session expired. Please log in again.')
        }
      } else if (timeUntilExpiry <= 0) {
        // Already expired, attempt refresh immediately
        try {
          await refreshTokens()
        } catch (error) {
          navigate('/login', { replace: true })
          toast.error('Session expired. Please log in again.')
        }
      }
    }

    // Check immediately on mount
    checkAndRefresh()

    // Then check every 5 minutes
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [token, refreshTokens, navigate, toast])

  // Set default auth header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
      resetActivityTimer()
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
      if (activityTimer) clearTimeout(activityTimer)
    }
  }, [token])

  // Store refresh token when it changes
  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    } else {
      localStorage.removeItem('refreshToken')
    }
  }, [refreshToken])

  // Listen for storage events from other tabs (sync logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        // Token cleared from another tab
        setToken(null)
        setRefreshToken(null)
        setUser(null)
        navigate('/login', { replace: true })
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [navigate])

  // Initial load - verify token
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await api.get('/auth/me')
        setUser(res.data)
        resetActivityTimer()
      } catch (err) {
        // If verification fails, the API interceptor will handle refresh
        // If refresh also fails, it will redirect to login
        // Just clear local state here
        setToken(null)
        setRefreshToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    verifyUser()
  }, [token])

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      const { user: userData, token: jwt, refreshToken: refreshJwt } = res.data

      // Synchronously set local storage BEFORE navigating to prevent race conditions
      localStorage.setItem('token', jwt)
      localStorage.setItem('refreshToken', refreshJwt)
      api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`

      setToken(jwt)
      setRefreshToken(refreshJwt)
      setUser(userData)
      navigate('/', { replace: true })
      toast.success(`Welcome back, ${userData.name || userData.email}!`)
      return true
    } catch (err) {
      toast.error(err.message || 'Login failed')
      return false
    }
  }

  const logout = useCallback(() => {
    const currentRefreshToken = localStorage.getItem('refreshToken')
    api.post('/auth/logout', { refreshToken: currentRefreshToken })
      .catch(() => {}) // Fire and forget
    
    setToken(null)
    setRefreshToken(null)
    setUser(null)
    navigate('/login', { replace: true })
    toast.info('Logged out successfully')
  }, [navigate, toast])

  const value = {
    user,
    token,
    refreshToken,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
