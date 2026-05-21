import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaStar, FaShoppingBag, FaArrowRight } from 'react-icons/fa'
import toast from 'react-hot-toast'

const OrderConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const orderData = location.state?.order
    if (orderData) {
      setOrder(orderData)
    } else {
      navigate('/menu')
    }
  }, [location, navigate])

  if (!order) return null

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h1 className="text-3xl font-bold mb-2">Order Confirmed! 🎉</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order! Your food will be delivered soon.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="font-semibold">Order #{order.order_number}</p>
            <p className="text-sm text-gray-500">Total: ${order.grand_total}</p>
            <p className="text-sm text-gray-500">
              Delivery to: {order.delivery_address}
            </p>
          </div>

          {/* Review Prompt */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-yellow-500 text-xl">⭐</div>
              <div className="text-left">
                <p className="font-semibold">Enjoyed your meal?</p>
                <p className="text-sm text-gray-600 mb-3">
                  Share your experience and help others discover great food!
                </p>
                <button
                  onClick={() => navigate(`/restaurant/${order.restaurant_id}?review=true`)}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-90 transition flex items-center gap-2"
                >
                  Write a Review <FaStar />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate('/menu')}
              className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition"
            >
              Order Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation