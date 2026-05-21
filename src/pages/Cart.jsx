import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaCreditCard } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Cart = () => {
  const [cart, setCart] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(savedCart)
  }

  const updateQuantity = (id, change) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change
        if (newQuantity < 1) return null
        return { ...item, quantity: newQuantity }
      }
      return item
    }).filter(Boolean)
    
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    toast.success('Cart updated')
  }

  const removeItem = (id) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    toast.success('Item removed')
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.1
  const total = subtotal + deliveryFee + tax

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button onClick={() => navigate('/menu')} className="btn-primary">
            Browse Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-primary transition">
          <FaArrowLeft /> Back
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="glass-effect p-6">
              <h2 className="text-2xl font-bold mb-6">Shopping Cart ({cart.length} items)</h2>
              
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl"
                  >
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-primary font-bold">${item.price}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-600 mt-1">
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="glass-effect p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2">
                <FaCreditCard /> Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart