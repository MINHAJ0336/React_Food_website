import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import { Link } from 'react-router-dom'
import { FaStar, FaShoppingBag, FaEye } from 'react-icons/fa'

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
      preparing: { color: 'bg-purple-100 text-purple-700', label: 'Preparing' },
      delivered: { color: 'bg-green-100 text-green-700', label: 'Delivered ✓' },
      cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>{config.label}</span>
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
        
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-semibold">{user?.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            {user?.phone && (
              <div>
                <p className="text-gray-500 text-sm">Phone</p>
                <p className="font-semibold">{user?.phone}</p>
              </div>
            )}
            {user?.address && (
              <div>
                <p className="text-gray-500 text-sm">Address</p>
                <p className="font-semibold">{user?.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">My Orders</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <FaShoppingBag className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <Link to="/menu" className="text-primary hover:underline mt-2 inline-block">
                Browse Menu →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="font-mono text-sm text-gray-500">Order #{order.order_number}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleDateString()} at {' '}
                        {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                      <p className="text-lg font-bold text-primary mt-1">${order.grand_total}</p>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-2">
                      {getStatusBadge(order.status)}
                      
                      {/* Show Review Button ONLY for delivered orders */}
                      {order.status === 'delivered' && (
                        <Link
                          to={`/restaurant/${order.restaurant_id}?review=true`}
                          className="flex items-center gap-2 text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition"
                        >
                          <FaStar /> Leave a Review
                        </Link>
                      )}
                      
                      <Link
                        to={`/restaurant/${order.restaurant_id}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <FaEye /> View Restaurant
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard