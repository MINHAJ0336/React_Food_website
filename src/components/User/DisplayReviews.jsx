import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { FaStar, FaStarHalfAlt, FaRegStar, FaUserCircle } from 'react-icons/fa'

const DisplayReviews = ({ restaurantId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [restaurantId])

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users:user_id (name, email)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReviews(data || [])
      setTotalReviews(data?.length || 0)
      
      if (data && data.length > 0) {
        const avg = data.reduce((sum, review) => sum + review.rating, 0) / data.length
        setAverageRating(avg)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }
useEffect(() => {
  // Check URL parameter to auto-open review tab
  const params = new URLSearchParams(window.location.search)
  if (params.get('review') === 'true') {
    setActiveTab('reviews')
  }
}, [])
  // Format date without date-fns
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-500" size={16} />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" size={16} />)
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" size={16} />)
      }
    }
    return stars
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="spinner-small mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading reviews...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Rating Summary */}
      {totalReviews > 0 ? (
        <div className="text-center mb-6 pb-6 border-b">
          <div className="text-5xl font-bold text-primary mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center gap-1 mb-2">
            {renderStars(averageRating)}
          </div>
          <p className="text-gray-600">
            Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
      ) : (
        <div className="text-center mb-6 pb-6 border-b">
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-sm text-gray-400">Be the first to review this restaurant!</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
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
    </div>
  )
}

export default DisplayReviews