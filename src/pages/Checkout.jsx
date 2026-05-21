import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import toast from 'react-hot-toast'
import { notifyOrderPlaced, notifyAdminNewOrder } from '../utils/notificationHelper'

const Checkout = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please login to checkout')
      navigate('/login')
      return
    }

    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart)
      if (parsedCart.length === 0) {
        toast.error('Your cart is empty')
        navigate('/menu')
      } else {
        setCart(parsedCart)
      }
    } else {
      navigate('/menu')
    }

    if (user?.address) {
      setAddress(user.address)
    }
  }, [user, authLoading, navigate])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.1
  const total = subtotal + deliveryFee + tax

  const placeOrder = async () => {
    if (!user || !user.id) {
      toast.error('Please login to place order')
      navigate('/login')
      return
    }

    if (!address.trim()) {
      toast.error('Please enter delivery address')
      return
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty')
      navigate('/menu')
      return
    }

    setLoading(true)
    
    try {
      const orderNumber = 'ORD' + Date.now()
      const restaurantId = cart[0]?.restaurant_id || 1
      const restaurantName = cart[0]?.restaurant_name || 'Restaurant'
      
      // Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          user_id: user.id,
          restaurant_id: restaurantId,
          total_amount: subtotal,
          delivery_fee: deliveryFee,
          tax_amount: tax,
          grand_total: total,
          delivery_address: address,
          payment_method: paymentMethod,
          status: 'pending'
        }])
        .select()
        .single()

      if (orderError) {
        console.error('Order error:', orderError)
        toast.error('Failed to place order: ' + orderError.message)
        setLoading(false)
        return
      }

      // Insert order items
      for (const item of cart) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert([{
            order_id: order.id,
            menu_item_id: item.id,
            quantity: item.quantity,
            price: item.price
          }])

        if (itemError) {
          console.error('Order item error:', itemError)
        }
      }

      // ✅ Send notification to USER
      console.log('Sending notification to user:', user.id)
      await notifyOrderPlaced(user.id, orderNumber)

      // ✅ Send notification to ALL ADMINS
      console.log('Sending notification to admins')
      await notifyAdminNewOrder(user.name, orderNumber, total, restaurantName)

      localStorage.removeItem('cart')
      toast.success('Order placed successfully!')
      
      setTimeout(() => {
        const wantReview = window.confirm('Order placed successfully! Would you like to leave a review for this restaurant?')
        if (wantReview) {
          navigate(`/restaurant/${restaurantId}?review=true`)
        } else {
          navigate(`/track-order/${order.id}`)
        }
      }, 1000)
      
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to place order: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div><p className="text-gray-600 text-sm">Name</p><p className="font-semibold">{user.name}</p></div>
                <div><p className="text-gray-600 text-sm">Email</p><p className="font-semibold">{user.email}</p></div>
                {user.phone && <div><p className="text-gray-600 text-sm">Phone</p><p className="font-semibold">{user.phone}</p></div>}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <textarea rows="3" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your complete delivery address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                  <input type="radio" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-500" />
                  <div><p className="font-semibold">Cash on Delivery</p><p className="text-sm text-gray-500">Pay when you receive your order</p></div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                  <input type="radio" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-500" />
                  <div><p className="font-semibold">Credit/Debit Card</p><p className="text-sm text-gray-500">Pay securely online</p></div>
                </label>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="max-h-64 overflow-y-auto mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between py-2 border-b">
                    <div><span className="font-medium">{item.quantity}x</span><span className="ml-2">{item.name}</span></div>
                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Delivery Fee</span><span>${deliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="border-t pt-3 mt-3"><div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-green-600">${total.toFixed(2)}</span></div></div>
              </div>
              <button onClick={placeOrder} disabled={loading || !address.trim()} className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition mt-6">
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">By placing this order, you agree to our terms and conditions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout