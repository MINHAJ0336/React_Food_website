import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../config/supabase'
import { useAuth } from '../../context/AuthContext'
import { FaBell, FaCheckCircle, FaTruck, FaStar, FaUtensils, FaTimes, FaTrash } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const NotificationBell = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      
      // Poll for new notifications every 10 seconds
      const interval = setInterval(fetchNotifications, 10000)
      
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        clearInterval(interval)
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30)
      
      if (error) {
        console.log('Notifications table not ready:', error.message)
        return
      }
      
      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    } catch (err) {
      console.log('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
      
      if (!error) {
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, is_read: true } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.log('Error marking as read:', err)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)
      
      if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
        toast.success('All notifications marked as read')
      }
    } catch (err) {
      console.log('Error marking all as read:', err)
    }
  }

  const deleteNotification = async (id, e) => {
    e.stopPropagation()
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
      
      if (!error) {
        const deleted = notifications.find(n => n.id === id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (deleted && !deleted.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        toast.success('Notification deleted')
      }
    } catch (err) {
      console.log('Error deleting notification:', err)
    }
  }

  const getIcon = (type) => {
    switch(type) {
      case 'order': return <FaCheckCircle className="text-green-500" size={16} />
      case 'delivery': return <FaTruck className="text-blue-500" size={16} />
      case 'review': return <FaStar className="text-yellow-500" size={16} />
      case 'restaurant': return <FaUtensils className="text-orange-500" size={16} />
      default: return <FaBell className="text-gray-500" size={16} />
    }
  }

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Just now'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-700 hover:text-primary transition focus:outline-none"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-100"
          >
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-gray-50 to-white">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="spinner-small mx-auto mb-2"></div>
                  <p className="text-sm">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FaBell className="text-4xl mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">When you get notifications, they will appear here</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-gray-50 transition cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50/30 border-l-4 border-l-primary' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => deleteNotification(notification.id, e)}
                            className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                            title="Delete"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {getTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 border-t bg-gray-50 text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-gray-500 hover:text-primary"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell