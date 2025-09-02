'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  username: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to suppress browser extension errors
const suppressExtensionErrors = (error: any) => {
  if (error && typeof error === 'object') {
    const message = error.message || error.toString()
    if (message.includes('bootstrap-autofill-overlay') || 
        message.includes('insertBefore') ||
        message.includes('NotFoundError')) {
      // Suppress browser extension errors
      return true
    }
  }
  return false
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      const data = await response.json()

      if (data.authenticated) {
        setUser(data.user)
        // If we're on login page and user is authenticated, redirect to dashboard
        if (window.location.pathname === '/login') {
          window.location.href = '/'
        }
      } else {
        setUser(null)
        // Only redirect to login if we're not already there and not on dashboard
        if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
          window.location.href = '/login'
        }
      }
    } catch (error: any) {
      // Suppress browser extension errors
      if (suppressExtensionErrors(error)) {
        console.log('Suppressed browser extension error during auth check')
        return
      }
      
      console.error('Auth check error:', error)
      setUser(null)
      // Only redirect to login if we're not already there and not on dashboard
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
      setIsInitialized(true)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt for:', username)
      setLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()
      console.log('Login response:', data)

      if (response.ok) {
        console.log('Login successful, setting user:', data.user)
        setUser(data.user)
        setLoading(false)
        console.log('Redirecting to dashboard...')
        // Redirect to dashboard after successful login
        window.location.href = '/'
        return true
      }
      console.log('Login failed:', data.error)
      setLoading(false)
      return false
    } catch (error: any) {
      // Suppress browser extension errors
      if (suppressExtensionErrors(error)) {
        console.log('Suppressed browser extension error during login')
        setLoading(false)
        return false
      }
      
      console.error('Login error:', error)
      setLoading(false)
      return false
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.location.href = '/login'
    } catch (error: any) {
      // Suppress browser extension errors
      if (suppressExtensionErrors(error)) {
        console.log('Suppressed browser extension error during logout')
        setLoading(false)
        return
      }
      
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only run initial auth check if not already initialized
    if (!isInitialized) {
      checkAuth()
    }
  }, [isInitialized])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
