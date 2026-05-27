import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../services/api'

export interface User {
    id: string
    email: string
    name: string
    userType: string
    isActive: boolean
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<void>
    register: (userData: any) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check for existing session on mount
        const storedUser = localStorage.getItem('pharmacie_user')
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser)
                // Handle both old { user, token } and new flat { ...user, token } shapes
                const currentUser = parsed.user ? { ...parsed.user, token: parsed.token } : parsed
                setUser(currentUser)

                // Verify token and get latest details (now including name)
                authApi.getCurrentUser()
                    .then(res => {
                        const latestUser = res.data.data
                        const token = currentUser.token || (parsed.token)
                        localStorage.setItem('pharmacie_user', JSON.stringify({ ...latestUser, token }))
                        setUser(latestUser)
                    })
                    .catch(() => {
                        localStorage.removeItem('pharmacie_user')
                        setUser(null)
                    })
            } catch {
                localStorage.removeItem('pharmacie_user')
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string) => {
        const response = await authApi.login(email, password)
        const { user, token } = response.data.data
        localStorage.setItem('pharmacie_user', JSON.stringify({ ...user, token }))
        setUser(user)
    }

    const register = async (userData: any) => {
        const response = await authApi.register(userData)
        const { user, token } = response.data.data
        localStorage.setItem('pharmacie_user', JSON.stringify({ ...user, token }))
        setUser(user)
    }

    const logout = () => {
        authApi.logout()
        localStorage.removeItem('pharmacie_user')
        setUser(null)
    }

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
