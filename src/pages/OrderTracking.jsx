import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { motion } from 'framer-motion'
import { FaCheckCircle, FaClock, FaUtensils, FaTruck, FaBoxOpen } from 'react-icons/fa'

const OrderTracking = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    const { data } = await supabase.from('orders').select('*').eq('id', id).single()
    setOrder(data)
    setLoading(false)
  }

  const steps = [
    { status: 'pending', label: 'Order Placed', icon: FaClock, color: 'bg-yellow-500' },
    { status: 'confirmed', label: 'Confirmed', icon: FaCheckCircle, color: 'bg-blue-500' },
    { status: 'preparing', label: 'Preparing', icon: FaUtensils, color: 'bg-purple-500' },
    { status: 'delivered', label: 'Delivered', icon: FaBoxOpen, color: 'bg-green-500' },
  ]

  const currentStepIndex = steps.findIndex(step => step.status === order?.status)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect p-8"
        >
          <h1 className="text-2xl font-bold text-center mb-8">Track Your Order</h1>
          <p className="text-center text-gray-600 mb-8">Order #{order?.order_number}</p>
          
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />
            </div>
            
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isCompleted = index <= currentStepIndex
                
                return (
                  <div key={step.status} className="text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto relative z-10 ${
                      isCompleted ? step.color : 'bg-gray-300'
                    } text-white`}>
                      <Icon />
                    </div>
                    <p className="text-sm mt-2 font-semibold">{step.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Your order is <span className="font-semibold text-primary">{order?.status}</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Total Amount: ${order?.grand_total}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default OrderTracking