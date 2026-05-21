import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabase'
import { FaStar, FaTrash, FaCheckCircle, FaTimesCircle, FaUser, FaStore, FaEye } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { notifyReviewApproved } from '../../utils/notificationHelper'

const ManageReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedReview, setSelectedReview] = useState(null)
  const [users, setUsers] = useState({})
  const [restaurants, setRestaurants] = useState({})

  useEffect(() => {
    fetchUsers()
    fetchRestaurants()
    fetchReviews()
  }, [filter])

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('id, name, email')
    if (data) {
      const userMap = {}
      data.forEach(user => { userMap[user.id] = user })
      setUsers(userMap)
    }
  }

  const fetchRestaurants = async () => {
    const { data } = await supabase.from('restaurants').select('id, name')
    if (data) {
      const restMap = {}
      data.forEach(rest => { restMap[rest.id] = rest })
      setRestaurants(restMap)
    }
  }

  const fetchReviews = async () => {
    try {
      setLoading(true)
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false })
      
      if (filter === 'approved') {
        query = query.eq('is_approved', true)
      } else if (filter === 'pending') {
        query = query.eq('is_approved', false)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Send notification to user when review is approved
  const toggleApproval = async (id, currentStatus) => {
    try {
      // Get review details before updating
      const { data: review, error: fetchError } = await supabase
        .from('reviews')
        .select('user_id, restaurant_id')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: !currentStatus })
        .eq('id', id)
      
      if (error) throw error
      
      // Send notification to user when review is approved (not when unapproved)
      if (!currentStatus && review) {
        const restaurantName = restaurants[review.restaurant_id]?.name || 'Restaurant'
        await notifyReviewApproved(review.user_id, restaurantName)
        toast.success(`Review approved and user notified!`)
      } else {
        toast.success(`Review ${!currentStatus ? 'approved' : 'unapproved'} successfully`)
      }
      
      fetchReviews()
    } catch (error) {
      toast.error('Failed to update: ' + error.message)
    }
  }

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      toast.success('Review deleted successfully')
      if (selectedReview?.id === id) setSelectedReview(null)
      fetchReviews()
    } catch (error) {
      toast.error('Delete failed: ' + error.message)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
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

  const getStatusBadge = (isApproved) => {
    if (isApproved) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1"><FaCheckCircle size={10} /> Approved</span>
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1"><FaTimesCircle size={10} /> Pending</span>
  }

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.is_approved === true).length,
    pending: reviews.filter(r => r.is_approved === false).length
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Reviews</h2>
        <button 
          onClick={fetchReviews}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Reviews</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <FaStar className="text-3xl text-blue-400" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <FaCheckCircle className="text-3xl text-green-400" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <FaTimesCircle className="text-3xl text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          All Reviews
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Pending
        </button>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <FaStar className="text-5xl mx-auto mb-3 text-gray-300" />
          <p>No reviews found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reviews List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition ${
                  selectedReview?.id === review.id ? 'ring-2 ring-primary' : ''
                } ${!review.is_approved ? 'border-l-4 border-yellow-500' : ''}`}
                onClick={() => setSelectedReview(review)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400" />
                    <span className="font-semibold">{users[review.user_id]?.name || 'Loading...'}</span>
                  </div>
                  {getStatusBadge(review.is_approved)}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <FaStore className="text-gray-400 text-sm" />
                  <span className="text-sm text-gray-600">{restaurants[review.restaurant_id]?.name || 'Loading...'}</span>
                </div>
                <div className="flex items-center justify-between">
                  {renderStars(review.rating)}
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mt-2 line-clamp-2">{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Review Detail */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {selectedReview ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">Review Details</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleApproval(selectedReview.id, selectedReview.is_approved)}
                      className={`${selectedReview.is_approved ? 'text-yellow-500' : 'text-green-500'} hover:opacity-70`}
                      title={selectedReview.is_approved ? 'Unapprove' : 'Approve'}
                    >
                      {selectedReview.is_approved ? <FaTimesCircle size={20} /> : <FaCheckCircle size={20} />}
                    </button>
                    <button
                      onClick={() => deleteReview(selectedReview.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-500 text-sm">Customer:</label>
                      <p className="font-semibold">{users[selectedReview.user_id]?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{users[selectedReview.user_id]?.email}</p>
                    </div>
                    <div>
                      <label className="text-gray-500 text-sm">Restaurant:</label>
                      <p className="font-semibold">{restaurants[selectedReview.restaurant_id]?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-gray-500 text-sm">Rating:</label>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(selectedReview.rating)}
                      <span className="font-bold text-lg">{selectedReview.rating}/5</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-gray-500 text-sm">Review:</label>
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedReview.comment}</p>
                    </div>
                  </div>

                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div>
                      <label className="text-gray-500 text-sm">Images:</label>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {JSON.parse(selectedReview.images).map((img, idx) => (
                          <img key={idx} src={img} alt={`Review ${idx + 1}`} className="w-20 h-20 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-gray-500 text-sm">Submitted:</label>
                    <p>{new Date(selectedReview.created_at).toLocaleString()}</p>
                  </div>
                  
                  {selectedReview.order_id && (
                    <div>
                      <label className="text-gray-500 text-sm">Order ID:</label>
                      <p className="font-mono text-sm">{selectedReview.order_id}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <FaEye className="text-5xl mx-auto mb-3 text-gray-300" />
                <p>Select a review to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageReviews