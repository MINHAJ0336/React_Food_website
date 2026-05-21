import { supabase } from '../config/supabase'

export const sendNotification = async (userId, title, message, type) => {
  try {
    console.log('📢 Sending notification:', { userId, title, type })
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title: title,
        message: message,
        type: type,
        is_read: false
      }])
      .select()
    
    if (error) {
      console.error('❌ Error sending notification:', error)
      return null
    }
    
    console.log('✅ Notification sent successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Error:', error)
    return null
  }
}

// Get all admin users
const getAdminUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'admin')
  
  if (error) {
    console.error('Error fetching admins:', error)
    return []
  }
  console.log('👥 Admin users found:', data?.length)
  return data || []
}

// ============== REVIEW NOTIFICATIONS ==============

// Send notification to USER when review is approved
export const notifyReviewApproved = async (userId, restaurantName) => {
  console.log('⭐ notifyReviewApproved called:', { userId, restaurantName })
  return sendNotification(
    userId,
    'Review Approved! ⭐',
    `Your review for ${restaurantName} has been approved and is now visible.`,
    'review'
  )
}

// Send notification to ALL ADMINS when a new review is submitted
export const notifyAdminNewReview = async (userName, restaurantName, rating, comment) => {
  console.log('⭐ notifyAdminNewReview called:', { userName, restaurantName, rating })
  
  const admins = await getAdminUsers()
  
  if (admins.length === 0) {
    console.log('❌ No admin users found')
    return
  }
  
  const shortComment = comment?.length > 50 ? comment.substring(0, 50) + '...' : comment || 'No comment'
  
  for (const admin of admins) {
    console.log(`📧 Sending to admin: ${admin.email}`)
    await sendNotification(
      admin.id,
      '⭐ New Review Submitted!',
      `${userName} gave ${restaurantName} a ${rating}/5 star rating. "${shortComment}"`,
      'review'
    )
  }
}

// ============== ORDER NOTIFICATIONS ==============

export const notifyOrderPlaced = async (userId, orderNumber) => {
  return sendNotification(
    userId,
    'Order Placed! 🎉',
    `Your order #${orderNumber} has been placed successfully.`,
    'order'
  )
}

export const notifyOrderStatusUpdate = async (userId, orderNumber, status) => {
  const messages = {
    confirmed: 'has been confirmed and is being prepared.',
    preparing: 'is being prepared by the restaurant.',
    delivered: 'has been delivered! Enjoy your meal! 🍽️',
    cancelled: 'has been cancelled.'
  }
  
  const titles = {
    confirmed: 'Order Confirmed ✅',
    preparing: 'Order Being Prepared 🍳',
    delivered: 'Order Delivered! 🚚',
    cancelled: 'Order Cancelled ❌'
  }
  
  return sendNotification(
    userId,
    titles[status] || `Order ${status}`,
    `Your order #${orderNumber} ${messages[status] || `status updated to ${status}`}`,
    status === 'delivered' ? 'delivery' : 'order'
  )
}

export const notifyAdminNewOrder = async (customerName, orderNumber, orderTotal, restaurantName) => {
  const admins = await getAdminUsers()
  if (admins.length === 0) return
  
  for (const admin of admins) {
    await sendNotification(
      admin.id,
      '🛒 New Order Received!',
      `${customerName} placed a new order #${orderNumber} for $${orderTotal} from ${restaurantName}.`,
      'order'
    )
  }
}

// ============== CONTACT MESSAGE NOTIFICATIONS ==============

export const notifyAdminNewMessage = async (userName, userEmail, subject) => {
  const admins = await getAdminUsers()
  if (admins.length === 0) return
  
  for (const admin of admins) {
    await sendNotification(
      admin.id,
      '📧 New Contact Message!',
      `${userName} (${userEmail}) sent a new message: "${subject || 'No subject'}"`,
      'message'
    )
  }
}