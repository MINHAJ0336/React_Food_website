import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { FaLock, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(false)
  const [email, setEmail] = useState('')
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const token = searchParams.get('token')
    const userEmail = searchParams.get('email')
    
    if (token && userEmail) {
      verifyToken(token, userEmail)
    } else {
      toast.error('Invalid reset link')
      navigate('/forgot-password')
    }
  }, [searchParams, navigate])

  const verifyToken = async (token, userEmail) => {
    try {
      // Check if token is valid and not expired
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', userEmail)
        .eq('reset_token', token)
        .gt('reset_token_expires', new Date().toISOString())
        .single()

      if (error || !data) {
        toast.error('Invalid or expired reset link')
        navigate('/forgot-password')
        return
      }

      setValidToken(true)
      setEmail(userEmail)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Invalid reset link')
      navigate('/forgot-password')
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password.length < 4) {
      toast.error('Password must be at least 4 characters')
      return
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Update password in database
      const { error } = await supabase
        .from('users')
        .update({ 
          password: password,
          reset_token: null,
          reset_token_expires: null
        })
        .eq('email', email)

      if (error) throw error

      toast.success('Password reset successfully!')
      
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
        <p className="ml-3 text-gray-600">Verifying link...</p>
      </div>
    )
  }

  if (!validToken) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect max-w-md w-full p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create New Password
          </h2>
          <p className="text-gray-600">
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              className="input-modern pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              className="input-modern pl-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
            <FaCheckCircle />
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPassword