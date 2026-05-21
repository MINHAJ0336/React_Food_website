import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  FaUtensils, FaTruck, FaCreditCard, FaStar, 
  FaArrowRight, FaShoppingBag, FaClock, FaMapMarkerAlt 
} from 'react-icons/fa'

const Home = () => {
  const features = [
    { icon: FaUtensils, title: 'Premium Quality', desc: 'Fresh ingredients from local farms', color: 'from-orange-500 to-red-500' },
    { icon: FaTruck, title: 'Free Delivery', desc: 'Free delivery on orders above $50', color: 'from-green-500 to-teal-500' },
    { icon: FaCreditCard, title: 'Easy Payment', desc: 'Multiple secure payment options', color: 'from-blue-500 to-indigo-500' },
    { icon: FaStar, title: 'Top Rated', desc: '4.8/5 from 10k+ customers', color: 'from-yellow-500 to-orange-500' },
  ]

  const popularItems = [
    { id: 1, name: 'Margherita Pizza', price: 14.99, rating: 4.8, image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400', restaurantId: 1 },
    { id: 2, name: 'Classic Burger', price: 10.99, rating: 4.7, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', restaurantId: 2 },
    { id: 3, name: 'California Roll', price: 12.99, rating: 4.9, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400', restaurantId: 3 },
    { id: 4, name: 'Grilled Salmon', price: 24.99, rating: 4.8, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', restaurantId: 1 },
  ]

  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(i => i.id === item.id)
    
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...item, quantity: 1 })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    alert(`${item.name} added to cart!`)
  }

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/20 to-secondary/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full filter blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/30 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Delicious Food
                <br />
                Delivered to You
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Craving something delicious? Get your favorite meals from the best restaurants,
                delivered fast and fresh to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/menu" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-opacity-90 transition group">
                  Order Now
                  <FaArrowRight className="group-hover:translate-x-1 transition" />
                </Link>
                <Link to="/about" className="bg-secondary text-white px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-opacity-90 transition">
                  Learn More
                </Link>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-8 mt-13">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">100+</div>
                  <div className="text-gray-600">Restaurants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">1000+</div>
                  <div className="text-gray-600">Daily Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10k+</div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-full blur-2xl opacity-30 animate-pulse" />
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600"
                  alt="Delicious Food"
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 text-lg">Experience the best food delivery service</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl shadow-xl p-6 text-center group cursor-pointer hover:shadow-2xl transition"
              >
                <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white text-3xl group-hover:rotate-6 transition`}>
                  <feature.icon />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Popular Dishes</h2>
            <p className="text-gray-600 text-lg">Most loved items by our customers</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition"
              >
                <Link to={`/restaurant/${item.restaurantId}`}>
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-semibold text-primary">
                      ⭐ {item.rating}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">${item.price}</span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(item);
                        }}
                        className="bg-primary text-white p-2 rounded-full hover:scale-110 transition"
                      >
                        <FaShoppingBag />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-xl mb-8 opacity-90">Get your favorite food delivered in minutes</p>
            <Link to="./Menu" className="bg-white text-primary px-8 py-3 rounded-full font-bold inline-flex items-center gap-2 hover:scale-105 transition">
              Get Started
              <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home