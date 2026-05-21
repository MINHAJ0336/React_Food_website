import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaUtensils, FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa'
import { motion } from 'framer-motion'
import NotificationBell from './NotificationBell'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const cartCount = JSON.parse(localStorage.getItem('cart') || '[]').length

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaUtensils className="text-3xl text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              RestoHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary transition">Home</Link>
            <Link to="/menu" className="text-gray-700 hover:text-primary transition">Menu</Link>
            <Link to="/about" className="text-gray-700 hover:text-primary transition">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary transition">Contact</Link>
            
            <button onClick={() => navigate('/cart')} className="relative">
              <FaShoppingCart className="text-2xl text-gray-700 hover:text-primary transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            <NotificationBell />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Hi, {user.name}</span>
                <button
                  onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
                >
                  Dashboard
                </button>
                <button onClick={logout} className="text-red-500 hover:text-red-600">Logout</button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90">Login</Link>
                <Link to="/signup" className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-opacity-90">Signup</Link>
              </div>
            )}
          </div>

          {/* Mobile Icons Row (Cart + Menu Button) */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Cart Icon for Mobile */}
            <button onClick={() => navigate('/cart')} className="relative">
              <FaShoppingCart className="text-2xl text-gray-700 hover:text-primary transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Button */}
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t"
          >
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 hover:text-primary" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/menu" className="text-gray-700 hover:text-primary" onClick={() => setIsOpen(false)}>Menu</Link>
              <Link to="/about" className="text-gray-700 hover:text-primary" onClick={() => setIsOpen(false)}>About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-primary" onClick={() => setIsOpen(false)}>Contact</Link>
              
              {/* Cart Link in Mobile Menu */}
              <button 
                onClick={() => { navigate('/cart'); setIsOpen(false) }} 
                className="text-left text-gray-700 hover:text-primary flex items-center gap-2"
              >
                <FaShoppingCart /> Cart 
                {cartCount > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full ml-2">
                    {cartCount}
                  </span>
                )}
              </button>
              
              {user ? (
                <>
                  <button onClick={() => { navigate('/dashboard'); setIsOpen(false) }} className="text-left text-gray-700 hover:text-primary">
                    Dashboard
                  </button>
                  <button onClick={() => { logout(); setIsOpen(false) }} className="text-left text-red-500">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="bg-primary text-white text-center px-4 py-2 rounded-lg hover:bg-opacity-90" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link to="/signup" className="bg-secondary text-white text-center px-4 py-2 rounded-lg hover:bg-opacity-90" onClick={() => setIsOpen(false)}>Signup</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  )
}

export default Navbar