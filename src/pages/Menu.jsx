import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../config/supabase'
import { FaSearch, FaShoppingCart, FaStar, FaEye } from 'react-icons/fa'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const Menu = () => {
  const [menuItems, setMenuItems] = useState([])
  const [restaurants, setRestaurants] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMenuItems()
    fetchRestaurants()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
      
      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error('Error fetching menu:', error)
      toast.error('Failed to load menu')
    } finally {
      setLoading(false)
    }
  }

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
      
      if (error) throw error
      
      const restaurantMap = {}
      data?.forEach(rest => {
        restaurantMap[rest.id] = rest.name
      })
      setRestaurants(restaurantMap)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    }
  }

  const filteredItems = menuItems.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (item, e) => {
    e.stopPropagation()
    e.preventDefault()
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(i => i.id === item.id)
    
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...item, quantity: 1, restaurant_id: item.restaurant_id })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success(`${item.name} added to cart!`)
  }

  const getImageUrl = (imageUrl) => {
    if (imageUrl) return imageUrl
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Our Menu
          </h1>
          <p className="text-gray-600 text-lg">Discover delicious dishes from our kitchen</p>
        </div>

        {/* Search */}
        <div className="glass-effect p-6 mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              className="input-modern pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="card-modern overflow-hidden group relative"
            >
              {/* Restaurant Name Badge */}
              <div className="absolute top-4 left-4 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {restaurants[item.restaurant_id] || 'Restaurant'}
              </div>
              
              <div className="h-56 overflow-hidden">
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FaStar />
                    <span className="text-sm font-semibold">{item.rating || 4.5}</span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description || 'Delicious meal prepared with fresh ingredients'}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">${item.price}</span>
                  <div className="flex gap-2">
                    <Link
                      to={`/restaurant/${item.restaurant_id}`}
                      className="bg-gray-500 text-white p-3 rounded-full hover:bg-gray-600 transition"
                      title="View Restaurant"
                    >
                      <FaEye />
                    </Link>
                    <button
                      onClick={(e) => addToCart(item, e)}
                      className="bg-primary text-white p-3 rounded-full hover:scale-110 transition"
                      title="Add to Cart"
                    >
                      <FaShoppingCart />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No menu items found</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 text-primary hover:underline"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu