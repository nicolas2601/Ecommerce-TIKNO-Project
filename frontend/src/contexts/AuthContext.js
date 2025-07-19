import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Obtener sesión inicial desde localStorage
    const getInitialSession = async () => {
      const storedToken = localStorage.getItem('access_token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      }
      setLoading(false)
    }

    getInitialSession()
  }, [])

  const signUp = async (email, password, userData = {}) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          password_confirm: password,
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          phone: userData.phone || ''
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Guardar tokens y usuario en localStorage
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        setToken(data.access)
        setUser(data.user)
        
        return { data, error: null }
      } else {
        return { data: null, error: data }
      }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  }

  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Guardar tokens y usuario en localStorage
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        setToken(data.access)
        setUser(data.user)
        
        return { data, error: null }
      } else {
        return { data: null, error: data }
      }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  }

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      
      if (refreshToken) {
        await fetch(`${process.env.REACT_APP_API_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            refresh: refreshToken
          })
        })
      }
      
      // Limpiar localStorage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      
      setToken(null)
      setUser(null)
      
      return { error: null }
    } catch (error) {
      return { error: { message: error.message } }
    }
  }

  const resetPassword = async (email) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/password/reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        return { data, error: null }
      } else {
        return { data: null, error: data }
      }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  }

  const value = {
    user,
    loading,
    token,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}