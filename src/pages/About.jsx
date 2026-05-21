import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUtensils, FaTruck, FaSmile, FaAward, FaUsers, FaHeart, FaStar, FaQuoteLeft } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { supabase } from '../config/supabase'

const About = () => {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  const stats = [
    { number: '100+', label: 'Restaurants', icon: FaUtensils, color: 'from-orange-500 to-red-500' },
    { number: '1000+', label: 'Daily Orders', icon: FaTruck, color: 'from-green-500 to-teal-500' },
    { number: '10k+', label: 'Happy Customers', icon: FaSmile, color: 'from-blue-500 to-indigo-500' },
    { number: '98%', label: 'Satisfaction Rate', icon: FaHeart, color: 'from-pink-500 to-rose-500' },
  ]

  const features = [
    {
      title: 'Quality Food',
      description: 'We partner with the best restaurants to ensure you get the highest quality food.',
      icon: FaStar,
      color: 'text-yellow-500'
    },
    {
      title: 'Fast Delivery',
      description: 'Our delivery partners ensure your food arrives hot and fresh within minutes.',
      icon: FaTruck,
      color: 'text-green-500'
    },
    {
      title: 'Best Service',
      description: '24/7 customer support to assist you with any questions or concerns.',
      icon: FaUsers,
      color: 'text-blue-500'
    },
    {
      title: 'Great Value',
      description: 'Competitive prices and exclusive offers to make your meal affordable.',
      icon: FaAward,
      color: 'text-purple-500'
    }
  ]

  const teamMembers = [
    {
      name: 'Minhaj Ahmed Khan',
      role: 'Founder & CEO',
      image: 'https://res.cloudinary.com/dnwfmwcdh/image/upload/v1779294271/DAP06741_ne9vs9.jpg',
      bio: 'Passionate about food and technology'
    },
    {
      name: 'Muneeb Khan',
      role: 'Head of Operations',
      image: 'https://res.cloudinary.com/dnwfmwcdh/image/upload/v1779293888/DSC01310_ewzbhx.jpg',
      bio: 'Ensuring smooth deliveries'
    },
    {
      name: 'Zaeem Ahmed',
      role: 'Tech Lead',
      image: 'https://res.cloudinary.com/dnwfmwcdh/image/upload/v1779294221/DSC01503_hiz1fc.jpg',
      bio: 'Building amazing experiences'
    }
  ]

  // Fetch dynamic testimonials from database
  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      // Fetch approved reviews with user details
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          users:user_id (name, email)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error

      if (data && data.length > 0) {
        // Transform reviews into testimonials format
        const formattedTestimonials = data.map(review => ({
          id: review.id,
          name: review.users?.name || 'Anonymous Customer',
          rating: review.rating,
          comment: review.comment,
          date: new Date(review.created_at).toLocaleDateString(),
          // Use avatar placeholder or generate from name
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.users?.name || 'User')}&background=FF6B35&color=fff`
        }))
        setTestimonials(formattedTestimonials)
      } else {
        // Fallback testimonials if no reviews
        setTestimonials([
          {
            id: 1,
            name: 'John Doe',
            rating: 5,
            comment: 'Amazing platform! The food delivery is super fast and the restaurants are top quality. Highly recommended!',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
          },
          {
            id: 2,
            name: 'Sarah Smith',
            rating: 5,
            comment: 'Best food delivery service in town! The app is very user-friendly and orders arrive on time.',
            avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
          },
          {
            id: 3,
            name: 'Mike Johnson',
            rating: 4,
            comment: 'Great variety of restaurants and amazing deals. Customer support is very responsive.',
            avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
          }
        ])
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      // Set fallback testimonials
      setTestimonials([
        {
          id: 1,
          name: 'John Doe',
          rating: 5,
          comment: 'Amazing platform! The food delivery is super fast and the restaurants are top quality.',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        {
          id: 2,
          name: 'Sarah Smith',
          rating: 5,
          comment: 'Best food delivery service in town! The app is very user-friendly.',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
        },
        {
          id: 3,
          name: 'Mike Johnson',
          rating: 4,
          comment: 'Great variety of restaurants and amazing deals.',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Helper function to render stars based on rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}
            size={14}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-secondary/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="inline-block mb-6"
            >
              <div className="bg-gradient-to-r from-primary to-secondary p-3 rounded-2xl shadow-lg">
                <FaUtensils className="text-4xl text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              About RestoHub
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We're on a mission to connect people with the best food experiences in their city.
              Founded in 2026, RestoHub is revolutionizing the food delivery industry.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link to="/menu" className="btn-primary group inline-flex items-center gap-2">
                <FaUtensils className="group-hover:rotate-12 transition" />
                Explore Restaurants
              </Link>
              <Link to="/track-order" className="btn-secondary group inline-flex items-center gap-2">
                <FaTruck className="group-hover:translate-x-1 transition" />
                Track Order
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                  <stat.icon />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-3xl blur-2xl opacity-20" />
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500"
                  alt="Our Mission"
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Our Mission
              </h2>
              <div className="w-20 h-1 bg-primary rounded-full mx-auto lg:mx-0 mb-6"></div>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                To make great food accessible to everyone, anytime, anywhere. We believe that
                ordering food should be simple, fast, and enjoyable.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                We're building a platform that connects local restaurants with hungry customers,
                creating a win-win ecosystem for everyone.
              </p>
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
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Why Choose Us
            </h2>
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
                className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition cursor-pointer group"
              >
                <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center ${feature.color} text-3xl group-hover:scale-110 transition`}>
                  <feature.icon />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 text-lg">
              {testimonials.length > 0 
                ? `Real reviews from ${testimonials.length} happy customers` 
                : 'Loved by thousands of food lovers'}
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner"></div>
              <p className="ml-3 text-gray-500">Loading reviews...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.slice(0, 3).map((testimonial, index) => (
                <motion.div
                  key={testimonial.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl p-6 shadow-lg relative hover:shadow-xl transition"
                >
                  <FaQuoteLeft className="text-3xl text-primary/20 absolute top-4 right-4" />
                  
                  {/* Rating Stars */}
                  <div className="mb-3">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  {/* Review Comment */}
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-4">
                    "{testimonial.comment}"
                  </p>
                  
                  {/* Customer Info */}
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{testimonial.name}</p>
                      {testimonial.date && (
                        <p className="text-xs text-gray-400">{testimonial.date}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* View All Reviews Link */}
          {testimonials.length > 3 && (
            <div className="text-center mt-8">
              <Link 
                to="/reviews" 
                className="text-primary hover:underline inline-flex items-center gap-2"
              >
                View all {testimonials.length} reviews <FaStar size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Meet Our Team
            </h2>
            <p className="text-gray-600 text-lg">Passionate people behind RestoHub</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="text-center group"
              >
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full opacity-0 group-hover:opacity-20 transition duration-300" />
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary/20 group-hover:border-primary transition"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary mb-2">{member.role}</p>
                <p className="text-gray-500 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full filter blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full filter blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Start Your Food Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of satisfied customers and experience the best food delivery service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:scale-105 transition inline-flex items-center gap-2 group"
              >
                <FaUtensils /> Order Now
              </Link>

              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-primary transition inline-flex items-center gap-2"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default About