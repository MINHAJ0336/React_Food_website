import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { FaStar, FaRegStar } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const AddReview = ({ restaurantId, orderId, onReviewAdded }) => {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingReview, setExistingReview] = useState(null)

  useEffect(() => {
    if (user && restaurantId) {
      checkExistingReview()
    }
  }, [user, restaurantId])

  const checkExistingReview = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('restaurant_id', restaurantId)
      .maybeSingle()
    
    if (data) {
      setExistingReview(data)
      setRating(data.rating)
      setComment(data.comment)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setLoading(true)

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
            restaurant_id: restaurantId,
            order_id: orderId || null,
            rating: rating,
            comment: comment,
            is_approved: false
          }])

        if (error) throw error
        toast.success('Review submitted! Waiting for admin approval.')
      }

      setComment('')
      setRating(0)
      if (onReviewAdded) onReviewAdded()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">Please login to leave a review</p>
        <a href="/login" className="text-primary hover:underline mt-2 inline-block">Login here</a>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">
        {existingReview ? 'Update Your Review' : 'Write a Review'}
      </h3>
      
      <form onSubmit={handleSubmit}>
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
                  <FaRegStar className="text-gray-300" size={24} />
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent!'}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Your Review *</label>
          <textarea
            rows="4"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Share your experience with this restaurant..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Your review will be visible after admin approval
        </p>
      </form>
    </div>
  )
}

export default AddReview