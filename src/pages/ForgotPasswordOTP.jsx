import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { sendOTPEmail } from '../utils/emailService'
import { FaEnvelope, FaArrowLeft, FaPaperPlane, FaKey, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa'
import toast from 'react-hot-toast'

const ForgotPasswordOTP = () => {
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState('')

  // Secure refs
  const generatedOtpRef = useRef(null)
  const expiresAtRef = useRef(null)
  const intervalRef = useRef(null)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Generate OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60)
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // STEP 1: SEND OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('email', email)
        .single()

      if (error || !user) {
        toast.error('No account found with this email')
        setLoading(false)
        return
      }

      if (user.role === 'admin') {
        toast.error('Admin password cannot be reset through this form')
        setLoading(false)
        return
      }

      const otpCode = generateOTP()
      const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes expiry

      // Store in refs
      generatedOtpRef.current = otpCode
      expiresAtRef.current = expiresAt

      // Save to database
      await supabase
        .from('users')
        .update({
          reset_otp: otpCode,
          reset_otp_expires: new Date(expiresAt).toISOString(),
          reset_otp_verified: false
        })
        .eq('id', user.id)

      // Send email
      const emailSent = await sendOTPEmail(email, otpCode, user.name)

      setUserId(user.id)
      setUserName(user.name)
      setStep(2)
      startResendTimer()

      if (emailSent) {
        toast.success(`OTP sent to ${email}`)
      } else {
        alert(`Your OTP is: ${otpCode}\n\nThis OTP will expire in 10 minutes.`)
        toast.info('Email failed. OTP shown in alert box.')
      }

    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // STEP 2: VERIFY OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()

    const enteredOtp = String(otp).trim()
    const generatedOtp = String(generatedOtpRef.current).trim()

    if (!enteredOtp || enteredOtp.length !== 6) {
      toast.error('Please enter valid 6-digit OTP')
      return
    }

    if (Date.now() > expiresAtRef.current) {
      toast.error('OTP expired. Please request a new one.')
      return
    }

    if (enteredOtp !== generatedOtp) {
      toast.error('Invalid OTP code')
      return
    }

    await supabase
      .from('users')
      .update({ reset_otp_verified: true })
      .eq('id', userId)

    setStep(3)
    toast.success('OTP verified! Now set your new password.')
  }

  // STEP 3: RESET PASSWORD
  const handleResetPassword = async (e) => {
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
      const { data } = await supabase
        .from('users')
        .select('reset_otp_verified')
        .eq('id', userId)
        .single()

      if (!data?.reset_otp_verified) {
        toast.error('Please verify OTP first')
        setLoading(false)
        return
      }

      await supabase
        .from('users')
        .update({
          password: password,
          reset_otp: null,
          reset_otp_expires: null,
          reset_otp_verified: false
        })
        .eq('id', userId)

      toast.success('Password reset successful! Please login.')

      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      console.error(err)
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // RESEND OTP
  const resendOTP = async () => {
    if (resendTimer > 0) {
      toast.info(`Please wait ${resendTimer} seconds`)
      return
    }

    setLoading(true)

    try {
      const otpCode = generateOTP()
      const expiresAt = Date.now() + 10 * 60 * 1000

      generatedOtpRef.current = otpCode
      expiresAtRef.current = expiresAt

      await supabase
        .from('users')
        .update({
          reset_otp: otpCode,
          reset_otp_expires: new Date(expiresAt).toISOString(),
          reset_otp_verified: false
        })
        .eq('id', userId)

      const emailSent = await sendOTPEmail(email, otpCode, userName)

      startResendTimer()

      if (emailSent) {
        toast.success('New OTP sent to your email')
      } else {
        alert(`Your new OTP is: ${otpCode}`)
        toast.info('Email failed. OTP shown in alert box.')
      }

    } catch (err) {
      console.error(err)
      toast.error('Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // Render Step 1: Email Form
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect max-w-md w-full p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Forgot Password?
            </h2>
            <p className="text-gray-600">
              Enter your email address. We'll send you an OTP to reset your password.
            </p>
          </div>

          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                className="input-modern pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : 'Send OTP'}
              <FaPaperPlane />
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-primary hover:underline flex items-center justify-center gap-1">
              <FaArrowLeft size={12} /> Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Render Step 2: OTP Verification
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect max-w-md w-full p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaKey className="text-2xl text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>
            <p className="text-gray-600">
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="input-modern text-center text-2xl tracking-widest font-mono"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
              <FaCheckCircle />
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={resendOTP}
              disabled={resendTimer > 0 || loading}
              className="text-sm text-primary hover:underline"
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setStep(1)}
              className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1 mx-auto"
            >
              <FaArrowLeft size={10} /> Use different email
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Render Step 3: New Password
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect max-w-md w-full p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-2xl text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Set New Password</h2>
          <p className="text-gray-600">
            Enter your new password for <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New Password"
              className="input-modern"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm New Password"
              className="input-modern"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPassword"
              onChange={() => setShowPassword(!showPassword)}
              className="w-4 h-4"
            />
            <label htmlFor="showPassword" className="text-sm text-gray-600">
              Show Password
            </label>
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

export default ForgotPasswordOTP