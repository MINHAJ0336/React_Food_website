import React, { useState } from 'react'
import { supabase } from '../config/supabase'

const SimpleLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Simple test query
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (error) {
        setMessage(`❌ Connection error: ${error.message}`)
        console.error('Error:', error)
      } else {
        setMessage('✅ Connection successful! Table exists.')
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`)
    }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      console.log('Login attempt:', email)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)

      console.log('Response:', { data, error })

      if (error) {
        setMessage(`❌ Error: ${error.message}`)
      } else if (!data || data.length === 0) {
        setMessage('❌ Invalid email or password')
      } else {
        setUser(data[0])
        localStorage.setItem('user', JSON.stringify(data[0]))
        setMessage(`✅ Welcome ${data[0].name}!`)
      }
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`)
    }
    setLoading(false)
  }

  if (user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}! 🎉</h2>
        <div className="space-y-2">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <button
            onClick={() => {
              localStorage.removeItem('user')
              setUser(null)
            }}
            className="w-full bg-red-500 text-white p-2 rounded mt-4"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold text-center mb-6">RestoHub Login</h1>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="w-full mb-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
      >
        Test Connection
      </button>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
      
      {message && (
        <div className={`mt-4 p-3 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      {/* <div className="mt-4 text-sm text-gray-500">
        <p>Test credentials:</p>
        <p>Email: test@example.com / Password: test123</p>
        <p>Email: admin@restohub.com / Password: admin123</p>
      </div> */}
    </div>
  )
}

export default SimpleLogin