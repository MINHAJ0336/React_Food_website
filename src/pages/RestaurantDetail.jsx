import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { useAuth } from '../context/AuthContext'
import { FaStar, FaArrowLeft, FaShoppingCart, FaUserCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'

const RestaurantDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [reviews, setReviews] = useState([])
  const [userOrders, setUserOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('menu')
  
  // Review form state
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [existingReview, setExistingReview] = useState(null)

  useEffect(() => {
    fetchRestaurant()
    fetchMenuItems()
    fetchReviews()
    if (user) {
      fetchUserOrders()
      checkExistingReview()
    }
  }, [id, user])

  const fetchRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      setRestaurant(data)
    } catch (error) {
      console.error('Error:', error)
      navigate('/menu')
    }
  }

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', id)
        .eq('is_available', true)
      
      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error('Error fetching menu:', error)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users:user_id (name, email)
        `)
        .eq('restaurant_id', id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id)
        .eq('restaurant_id', id)
        .eq('status', 'delivered')
      
      if (error) throw error
      setUserOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const checkExistingReview = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('restaurant_id', id)
      .maybeSingle()
    
    if (data) {
      setExistingReview(data)
      setRating(data.rating)
      setComment(data.comment)
    }
  }

  const addToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existing = cart.find(i => i.id === item.id)
    
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...item, quantity: 1, restaurant_id: id, restaurant_name: restaurant?.name })
    }
    
    localStorage.setItem('cart', JSON.stringify(cart))
    toast.success(`${item.name} added to cart!`)
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitting(true)

    try {
      if (existingReview) {
        const { error } = await supabase
          .from('reviews')
          .update({
            rating: rating,
            comment: comment,
            is_approved: false
          })
          .eq('id', existingReview.id)

        if (error) throw error
        toast.success('Review updated! Waiting for admin approval.')
      } else {
        const { error } = await supabase
          .from('reviews')
          .insert([{
            user_id: user.id,
            restaurant_id: id,
            rating: rating,
            comment: comment,
            is_approved: false
          }])

        if (error) throw error
        toast.success('Review submitted! Waiting for admin approval.')
      }

      setRating(0)
      setComment('')
      fetchReviews()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const canReview = userOrders.length > 0

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} className={i <= rating ? 'text-yellow-500' : 'text-gray-300'} size={16} />
      )
    }
    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Restaurant not found</p>
      </div>
    )
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary to-secondary">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 p-2 rounded-full hover:bg-white transition z-10"
        >
          <FaArrowLeft className="text-primary" />
        </button>
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-white/90 mb-4">{restaurant.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                {renderStars(averageRating)}
                <span className="ml-1">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('menu')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'menu' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Menu ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-4 font-semibold transition-colors ${
              activeTab === 'reviews' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            {menuItems.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No menu items available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="h-48 bg-gray-200">
                      <img 
                        src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-primary">${item.price}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition flex items-center gap-2"
                        >
                          <FaShoppingCart /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet</p>
                    <p className="text-sm text-gray-400">Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <FaUserCircle className="text-gray-400 text-2xl" />
                            <div>
                              <p className="font-semibold">{review.users?.name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(review.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add Review Form */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">
                  {existingReview ? 'Update Your Review' : 'Write a Review'}
                </h3>
                
                {!user ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">Please login to leave a review</p>
                    <Link to="/login" className="text-primary hover:underline">Login here</Link>
                  </div>
                ) : !canReview ? (
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">You can only review restaurants you've ordered from.</p>
                    <p className="text-sm text-gray-500">Complete an order at this restaurant to leave a review.</p>
                    <Link to="/menu" className="text-primary hover:underline mt-3 inline-block">Browse Menu →</Link>
                  </div>
                ) : (
                  <form onSubmit={submitReview}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Your Rating *</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            {(hover >= star || rating >= star) ? (
                              <FaStar className="text-yellow-500" size={24} />
                            ) : (
                              <FaStar className="text-gray-300" size={24} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Your Review *</label>
                      <textarea
                        rows="4"
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                    </button>

                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Your review will be visible after admin approval
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantDetail