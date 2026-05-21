import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const storedUser = localStorage.getItem('restohub_user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (e) {
        console.error('Error parsing user:', e)
        localStorage.removeItem('restohub_user')
      }
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    try {
      console.log('Login attempt:', email)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)

      if (error) {
        toast.error('Login failed: ' + error.message)
        return false
      }

      if (!data || data.length === 0) {
        toast.error('Invalid email or password')
        return false
      }

      const userData = data[0]
      localStorage.setItem('restohub_user', JSON.stringify(userData))
      setUser(userData)
      toast.success(`Welcome back, ${userData.name}!`)
      return true
    } catch (error) {
      console.error('Login exception:', error)
      toast.error('Login failed')
      return false
    }
  }

  const signup = async (userData) => {
    try {
      const { data: existing } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)

      if (existing && existing.length > 0) {
        toast.error('User already exists')
        return false
      }

      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phone: userData.phone || '',
          address: userData.address || '',
          role: 'user'
        }])
        .select()

      if (error) {
        toast.error('Signup failed: ' + error.message)
        return false
      }

      if (data && data.length > 0) {
        toast.success('Account created! Please login.')
        return true
      }

      return false
    } catch (error) {
      console.error('Signup exception:', error)
      toast.error('Signup failed')
      return false
    }
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('restohub_user')
    // Clear user state
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}