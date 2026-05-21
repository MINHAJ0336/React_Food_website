import React, { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { motion } from 'framer-motion'
import { 
  FaStore, FaTags, FaHamburger, FaShoppingCart, FaUsers, 
  FaEye, FaPlus, FaEdit, FaTrash, FaUtensils, 
  FaPhone, FaMapMarkerAlt, FaImage, FaEnvelope, FaStar,
  FaCheckCircle, FaTimesCircle, FaUser, FaCalendar,
  FaReply, FaInbox, FaTimes, FaBoxOpen
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { notifyOrderStatusUpdate } from '../utils/notificationHelper'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('restaurants')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Data states
  const [restaurants, setRestaurants] = useState([])
  const [categories, setCategories] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [reviews, setReviews] = useState([])
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [stats, setStats] = useState({})
  
  // Message and Review states
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [selectedReview, setSelectedReview] = useState(null)
  const [filter, setFilter] = useState('all')
  
  // Order Detail Modal states
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])

  useEffect(() => {
    fetchAllData()
  }, [activeTab, filter])

  // Real-time subscriptions for new orders, reviews, and messages
  useEffect(() => {
    const orderChannel = supabase
      .channel('admin-orders-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        toast.success(`🛒 New Order #${payload.new.order_number} received!`, { duration: 5000 })
        fetchOrders()
        fetchStats()
      })
      .subscribe()

    const reviewChannel = supabase
      .channel('admin-reviews-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, () => {
        toast.info(`⭐ New review submitted!`, { duration: 5000 })
        fetchReviews()
        fetchStats()
      })
      .subscribe()

    const messageChannel = supabase
      .channel('admin-messages-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages' }, (payload) => {
        toast.info(`📧 New message from ${payload.new.name}!`, { duration: 5000 })
        fetchMessages()
        fetchStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(orderChannel)
      supabase.removeChannel(reviewChannel)
      supabase.removeChannel(messageChannel)
    }
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    await Promise.all([
      fetchRestaurants(),
      fetchCategories(),
      fetchMenuItems(),
      fetchOrders(),
      fetchUsers(),
      fetchMessages(),
      fetchReviews(),
      fetchStats()
    ])
    setLoading(false)
  }

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setRestaurants(data || [])
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error('Error fetching menu items:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(20)
      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      let query = supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      if (filter === 'unread') query = query.eq('status', 'unread')
      else if (filter === 'read') query = query.eq('status', 'read')
      const { data, error } = await query
      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const fetchReviews = async () => {
    try {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false })
      if (filter === 'approved') query = query.eq('is_approved', true)
      else if (filter === 'pending') query = query.eq('is_approved', false)
      const { data, error } = await query
      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const counts = await Promise.all([
        supabase.from('restaurants').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('menu_items').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true })
      ])
      
      setStats({
        restaurants: counts[0].count || 0,
        categories: counts[1].count || 0,
        menu: counts[2].count || 0,
        orders: counts[3].count || 0,
        users: counts[4].count || 0,
        messages: counts[5].count || 0,
        reviews: counts[6].count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const viewOrderDetails = async (order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
    const { data: items, error } = await supabase.from('order_items').select('*, menu_items(name, price)').eq('order_id', order.id)
    if (!error) setOrderItems(items || [])
  }

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({})
    setShowModal(true)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData(item)
    setShowModal(true)
  }

  const handleDelete = async (table, id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return
    setDeleting(true)
    try {
      if (table === 'menu_items') await supabase.from('order_items').delete().eq('menu_item_id', id)
      if (table === 'categories') {
        const { data: menuInCat } = await supabase.from('menu_items').select('id').eq('category_id', id)
        if (menuInCat?.length) {
          for (const item of menuInCat) await supabase.from('order_items').delete().eq('menu_item_id', item.id)
          await supabase.from('menu_items').delete().eq('category_id', id)
        }
      }
      if (table === 'restaurants') {
        const { data: catsInRest } = await supabase.from('categories').select('id').eq('restaurant_id', id)
        if (catsInRest?.length) {
          for (const cat of catsInRest) {
            const { data: menuInCat } = await supabase.from('menu_items').select('id').eq('category_id', cat.id)
            if (menuInCat?.length) {
              for (const item of menuInCat) await supabase.from('order_items').delete().eq('menu_item_id', item.id)
              await supabase.from('menu_items').delete().eq('category_id', cat.id)
            }
          }
          await supabase.from('categories').delete().eq('restaurant_id', id)
        }
      }
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      toast.success(`"${name}" deleted successfully`)
      fetchAllData()
    } catch (error) {
      toast.error('Delete failed: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let result
      if (activeTab === 'restaurants') {
        const dataToSave = { name: formData.name, description: formData.description || '', address: formData.address || '', phone: formData.phone || '', image_url: formData.image_url || '' }
        result = editingItem ? await supabase.from('restaurants').update(dataToSave).eq('id', editingItem.id) : await supabase.from('restaurants').insert([dataToSave])
      } else if (activeTab === 'categories') {
        const dataToSave = { name: formData.name, description: formData.description || '', restaurant_id: formData.restaurant_id }
        result = editingItem ? await supabase.from('categories').update(dataToSave).eq('id', editingItem.id) : await supabase.from('categories').insert([dataToSave])
      } else if (activeTab === 'menu') {
        const dataToSave = { name: formData.name, description: formData.description || '', price: parseFloat(formData.price), restaurant_id: formData.restaurant_id, category_id: formData.category_id, image_url: formData.image_url || '' }
        result = editingItem ? await supabase.from('menu_items').update(dataToSave).eq('id', editingItem.id) : await supabase.from('menu_items').insert([dataToSave])
      }
      if (result?.error) throw result.error
      toast.success(`${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'added'} successfully!`)
      setShowModal(false)
      fetchAllData()
    } catch (error) {
      toast.error('Operation failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      const { data: order, error: fetchError } = await supabase.from('orders').select('user_id, order_number').eq('id', id).single()
      if (fetchError) throw fetchError
      const { error } = await supabase.from('orders').update({ status }).eq('id', id)
      if (error) throw error
      if (order) await notifyOrderStatusUpdate(order.user_id, order.order_number, status)
      toast.success('Order status updated')
      fetchOrders()
    } catch (error) {
      toast.error('Failed to update status: ' + error.message)
    }
  }

  const markMessageAsRead = async (id) => {
    try {
      const { error } = await supabase.from('contact_messages').update({ status: 'read' }).eq('id', id)
      if (error) throw error
      toast.success('Message marked as read')
      fetchMessages()
    } catch (error) {
      toast.error('Failed to update: ' + error.message)
    }
  }

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id)
      if (error) throw error
      toast.success('Message deleted')
      if (selectedMessage?.id === id) setSelectedMessage(null)
      fetchMessages()
    } catch (error) {
      toast.error('Delete failed: ' + error.message)
    }
  }

  const toggleReviewApproval = async (id, currentStatus) => {
    try {
      const { error } = await supabase.from('reviews').update({ is_approved: !currentStatus }).eq('id', id)
      if (error) throw error
      toast.success(`Review ${!currentStatus ? 'approved' : 'unapproved'}`)
      fetchReviews()
    } catch (error) {
      toast.error('Failed to update: ' + error.message)
    }
  }

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id)
      if (error) throw error
      toast.success('Review deleted')
      if (selectedReview?.id === id) setSelectedReview(null)
      fetchReviews()
    } catch (error) {
      toast.error('Delete failed: ' + error.message)
    }
  }

  const getRestaurantName = (id) => restaurants.find(r => r.id === id)?.name || 'Loading...'
  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || 'Loading...'
  const getUserName = (id) => users.find(u => u.id === id)?.name || 'Unknown User'

  const renderStars = (rating) => (
    <div className="flex gap-1">{ [1,2,3,4,5].map(s => <FaStar key={s} className={s <= rating ? 'text-yellow-500' : 'text-gray-300'} size={14} />) }</div>
  )

  const statCards = [
    { title: 'Restaurants', value: stats.restaurants, icon: FaStore, color: 'from-orange-500 to-red-500', tab: 'restaurants' },
    { title: 'Categories', value: stats.categories, icon: FaTags, color: 'from-green-500 to-teal-500', tab: 'categories' },
    { title: 'Menu Items', value: stats.menu, icon: FaHamburger, color: 'from-blue-500 to-indigo-500', tab: 'menu' },
    { title: 'Orders', value: stats.orders, icon: FaShoppingCart, color: 'from-purple-500 to-pink-500', tab: 'orders' },
    { title: 'Users', value: stats.users, icon: FaUsers, color: 'from-yellow-500 to-orange-500', tab: 'users' },
    { title: 'Messages', value: stats.messages, icon: FaEnvelope, color: 'from-pink-500 to-rose-500', tab: 'messages' },
    { title: 'Reviews', value: stats.reviews, icon: FaStar, color: 'from-indigo-500 to-purple-500', tab: 'reviews' },
  ]

  // Render Restaurants
  const renderRestaurants = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Restaurants</h2>
        <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"><FaPlus /> Add Restaurant</button>
      </div>
      {restaurants.length === 0 ? <div className="text-center py-10 text-gray-500">No restaurants found.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(rest => (
            <div key={rest.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {rest.image_url ? <img src={rest.image_url} alt={rest.name} className="w-full h-full object-cover" /> : <FaUtensils className="text-5xl text-gray-400" />}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2">{rest.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{rest.description || 'No description'}</p>
                <div className="flex items-center gap-2 text-gray-500 text-sm"><FaMapMarkerAlt /> {rest.address || 'No address'}</div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mt-1"><FaPhone /> {rest.phone || 'No phone'}</div>
                <div className="flex justify-end gap-3 mt-4 pt-3 border-t">
                  <button onClick={() => handleEdit(rest)} className="text-blue-500"><FaEdit size={18} /></button>
                  <button onClick={() => handleDelete('restaurants', rest.id, rest.name)} className="text-red-500" disabled={deleting}><FaTrash size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Render Categories
  const renderCategories = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Categories</h2>
        <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"><FaPlus /> Add Category</button>
      </div>
      {categories.length === 0 ? <div className="text-center py-10 text-gray-500">No categories found.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between">
                <div><h3 className="text-xl font-bold mb-2">{cat.name}</h3><p className="text-gray-600 text-sm">{cat.description || 'No description'}</p><p className="text-gray-500 text-sm mt-2">Restaurant: {getRestaurantName(cat.restaurant_id)}</p></div>
                <div className="flex gap-2"><button onClick={() => handleEdit(cat)} className="text-blue-500"><FaEdit /></button><button onClick={() => handleDelete('categories', cat.id, cat.name)} className="text-red-500" disabled={deleting}><FaTrash /></button></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Render Menu Items
  const renderMenuItems = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Menu Items</h2>
        <button onClick={handleAdd} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"><FaPlus /> Add Menu Item</button>
      </div>
      {menuItems.length === 0 ? <div className="text-center py-10 text-gray-500">No menu items found.</div> : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg">
            <thead className="bg-gray-800 text-white">
              <tr><th className="p-3 text-left">Image</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Price</th><th className="p-3 text-left">Category</th><th className="p-3 text-left">Restaurant</th><th className="p-3 text-left">Actions</th></tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-3"><div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">{item.image_url ? <img src={item.image_url} className="w-full h-full object-cover rounded" alt={item.name} /> : <FaImage />}</div></td>
                  <td className="p-3 font-medium">{item.name}</td>
                  <td className="p-3 text-green-600 font-bold">${item.price}</td>
                  <td className="p-3">{getCategoryName(item.category_id)}</td>
                  <td className="p-3">{getRestaurantName(item.restaurant_id)}</td>
                  <td className="p-3"><button onClick={() => handleEdit(item)} className="text-blue-500 mr-3"><FaEdit /></button><button onClick={() => handleDelete('menu_items', item.id, item.name)} className="text-red-500" disabled={deleting}><FaTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // Render Orders
  const renderOrders = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Orders</h2>
      {orders.length === 0 ? <div className="text-center py-10 text-gray-500">No orders found.</div> : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg">
            <thead className="bg-gray-800 text-white">
              <tr><th className="p-3 text-left">Order #</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Total</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">Action</th></tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{order.order_number}</td>
                  <td className="p-3">{getUserName(order.user_id)}</td>
                  <td className="p-3 font-bold text-green-600">${parseFloat(order.grand_total).toFixed(2)}</td>
                  <td className="p-3">
                    <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className={`px-2 py-1 rounded border text-sm ${order.status === 'delivered' ? 'bg-green-100' : order.status === 'cancelled' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                      <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="preparing">Preparing</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-3"><button onClick={() => viewOrderDetails(order)} className="text-blue-500 hover:text-blue-700"><FaEye size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4"><h3 className="text-2xl font-bold">Order Details</h3><button onClick={() => setShowOrderModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl"><FaTimes /></button></div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-semibold mb-2"><FaBoxOpen className="inline mr-2" /> Order Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm"><p className="text-gray-600">Order Number:</p><p className="font-mono">{selectedOrder.order_number}</p><p className="text-gray-600">Status:</p><p className={`font-semibold ${selectedOrder.status === 'delivered' ? 'text-green-600' : selectedOrder.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>{selectedOrder.status}</p><p className="text-gray-600">Date:</p><p>{new Date(selectedOrder.created_at).toLocaleString()}</p><p className="text-gray-600">Payment Method:</p><p>{selectedOrder.payment_method || 'Cash on Delivery'}</p></div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-semibold mb-2">Customer Information</h4><div className="grid grid-cols-2 gap-2 text-sm"><p className="text-gray-600">Name:</p><p>{getUserName(selectedOrder.user_id)}</p><p className="text-gray-600">Delivery Address:</p><p>{selectedOrder.delivery_address}</p></div></div>
              <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-semibold mb-2">Order Items</h4>
                {orderItems.length > 0 ? (<div className="space-y-2">{orderItems.map((item, idx) => (<div key={idx} className="flex justify-between items-center border-b pb-2"><div><p className="font-medium">{item.menu_items?.name || 'Item'}</p><p className="text-sm text-gray-500">Quantity: {item.quantity}</p></div><p className="font-semibold">${parseFloat(item.price).toFixed(2)}</p></div>))}<div className="pt-2 mt-2 border-t"><div className="flex justify-between font-bold"><span>Total Amount:</span><span className="text-green-600">${parseFloat(selectedOrder.grand_total).toFixed(2)}</span></div></div></div>) : (<p className="text-gray-500">No items found</p>)}
              </div>
            </div>
            <div className="flex justify-end mt-6"><button onClick={() => setShowOrderModal(false)} className="bg-primary text-white px-4 py-2 rounded-lg">Close</button></div>
          </div>
        </div>
      )}
    </div>
  )

  // Render Users
  const renderUsers = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
      {users.length === 0 ? <div className="text-center py-10 text-gray-500">No users found.</div> : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg">
            <thead className="bg-gray-800 text-white"><tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Name</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Phone</th><th className="p-3 text-left">Joined</th></tr></thead>
            <tbody>{users.map(user => (<tr key={user.id} className="border-b"><td className="p-3">{user.id}</td><td className="p-3 font-medium">{user.name}</td><td className="p-3">{user.email}</td><td className="p-3"><span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role || 'user'}</span></td><td className="p-3">{user.phone || '-'}</td><td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  )

  // Render Messages
  const renderMessages = () => {
    const msgStats = { total: messages.length, unread: messages.filter(m => m.status === 'unread').length }
    return (
      <div>
        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Contact Messages</h2><button onClick={fetchMessages} className="bg-gray-500 text-white px-4 py-2 rounded-lg"><FaInbox className="inline mr-2" /> Refresh</button></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg"><div className="flex justify-between"><div><p className="text-gray-600 text-sm">Total</p><p className="text-2xl font-bold text-blue-600">{msgStats.total}</p></div><FaEnvelope className="text-3xl text-blue-400" /></div></div>
          <div className="bg-red-50 p-4 rounded-lg"><div className="flex justify-between"><div><p className="text-gray-600 text-sm">Unread</p><p className="text-2xl font-bold text-red-600">{msgStats.unread}</p></div><FaEnvelope className="text-3xl text-red-400" /></div></div>
          <div className="bg-green-50 p-4 rounded-lg"><div className="flex justify-between"><div><p className="text-gray-600 text-sm">Read</p><p className="text-2xl font-bold text-green-600">{msgStats.total - msgStats.unread}</p></div><FaCheckCircle className="text-3xl text-green-400" /></div></div>
        </div>
        <div className="flex gap-2 mb-4"><button onClick={() => { setFilter('all'); fetchMessages(); }} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200'}`}>All</button><button onClick={() => { setFilter('unread'); fetchMessages(); }} className={`px-4 py-2 rounded-lg ${filter === 'unread' ? 'bg-primary text-white' : 'bg-gray-200'}`}>Unread</button><button onClick={() => { setFilter('read'); fetchMessages(); }} className={`px-4 py-2 rounded-lg ${filter === 'read' ? 'bg-primary text-white' : 'bg-gray-200'}`}>Read</button></div>
        {messages.length === 0 ? <div className="text-center py-10 text-gray-500"><FaEnvelope className="text-5xl mx-auto mb-3" /><p>No messages found</p></div> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3 max-h-[500px] overflow-y-auto">{messages.map(msg => (<div key={msg.id} className={`bg-white rounded-lg shadow-md p-4 cursor-pointer ${selectedMessage?.id === msg.id ? 'ring-2 ring-primary' : ''} ${msg.status === 'unread' ? 'border-l-4 border-red-500' : ''}`} onClick={() => setSelectedMessage(msg)}><div className="flex justify-between"><div className="flex items-center gap-2"><FaUser /><span className="font-semibold">{msg.name}</span></div><span className={`px-2 py-1 rounded-full text-xs ${msg.status === 'unread' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg.status}</span></div><p className="text-sm text-gray-500">{msg.email}</p><p className="font-medium">{msg.subject || 'No subject'}</p><p className="text-xs text-gray-400 mt-2"><FaCalendar className="inline mr-1" size={10} /> {new Date(msg.created_at).toLocaleString()}</p></div>))}</div>
            <div className="bg-white rounded-lg shadow-md p-6">{selectedMessage ? (<><div className="flex justify-between mb-4"><h3 className="text-xl font-bold">Message Details</h3><div className="flex gap-2">{selectedMessage.status === 'unread' && <button onClick={() => markMessageAsRead(selectedMessage.id)} className="text-green-500"><FaCheckCircle size={20} /></button>}<button onClick={() => deleteMessage(selectedMessage.id)} className="text-red-500"><FaTrash size={18} /></button><a href={`mailto:${selectedMessage.email}`} className="text-blue-500"><FaReply size={18} /></a></div></div><div className="space-y-4"><div><label className="text-gray-500 text-sm">From:</label><p className="font-semibold">{selectedMessage.name}</p><p>{selectedMessage.email}</p></div>{selectedMessage.subject && <div><label className="text-gray-500 text-sm">Subject:</label><p className="font-medium">{selectedMessage.subject}</p></div>}<div><label className="text-gray-500 text-sm">Message:</label><div className="mt-2 p-4 bg-gray-50 rounded-lg"><p className="whitespace-pre-wrap">{selectedMessage.message}</p></div></div><div><label className="text-gray-500 text-sm">Received:</label><p>{new Date(selectedMessage.created_at).toLocaleString()}</p></div><div className="pt-4 border-t"><a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your inquiry'}`} className="btn-primary inline-flex items-center gap-2"><FaReply /> Reply</a></div></div></>) : (<div className="text-center py-10 text-gray-500"><FaEnvelope className="text-5xl mx-auto mb-3" /><p>Select a message to view details</p></div>)}</div></div>
        )}
      </div>
    )
  }

  // Render Reviews
  const renderReviews = () => {
    const reviewStats = { total: reviews.length, approved: reviews.filter(r => r.is_approved).length, pending: reviews.filter(r => !r.is_approved).length }
    return (
      <div>
        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Manage Reviews</h2><button onClick={fetchReviews} className="bg-gray-500 text-white px-4 py-2 rounded-lg"><FaInbox className="inline mr-2" /> Refresh</button></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg"><div className="flex justify-between"><div><p className="text-gray-600 text-sm">Total</p><p className="text-2xl font-bold text-blue-600">{reviewStats.total}</p></div><FaStar className="text-3xl text-blue-400" /></div></div>
          <div className="bg-green-50 p-4 rounded-lg"><div className="flex justify-between"><div><p className="text-gray-600 text-sm">Approved</p><p className="text-2xl font-bold text-green-600">{reviewStats.approved}</p></div><FaCheckCircle className="text-3xl text-green-400" /></div></div>
          <div className="bg-yellow-50 p-4 rounded-lg"><div className="flex justify-between"><div><p className="text-gray-600 text-sm">Pending</p><p className="text-2xl font-bold text-yellow-600">{reviewStats.pending}</p></div><FaTimesCircle className="text-3xl text-yellow-400" /></div></div>
        </div>
        <div className="flex gap-2 mb-4"><button onClick={() => { setFilter('all'); fetchReviews(); }} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200'}`}>All</button><button onClick={() => { setFilter('approved'); fetchReviews(); }} className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-primary text-white' : 'bg-gray-200'}`}>Approved</button><button onClick={() => { setFilter('pending'); fetchReviews(); }} className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-primary text-white' : 'bg-gray-200'}`}>Pending</button></div>
        {reviews.length === 0 ? <div className="text-center py-10 text-gray-500"><FaStar className="text-5xl mx-auto mb-3" /><p>No reviews found</p></div> : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3 max-h-[500px] overflow-y-auto">{reviews.map(rev => (<div key={rev.id} className={`bg-white rounded-lg shadow-md p-4 cursor-pointer ${selectedReview?.id === rev.id ? 'ring-2 ring-primary' : ''} ${!rev.is_approved ? 'border-l-4 border-yellow-500' : ''}`} onClick={() => setSelectedReview(rev)}><div className="flex justify-between"><div className="flex items-center gap-2"><FaUser /><span className="font-semibold">{getUserName(rev.user_id)}</span></div><span className={`px-2 py-1 rounded-full text-xs ${rev.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{rev.is_approved ? 'Approved' : 'Pending'}</span></div><div className="flex items-center gap-2 mt-1"><FaStore className="text-gray-400 text-sm" /><span className="text-sm">{getRestaurantName(rev.restaurant_id)}</span></div><div className="flex justify-between items-center mt-2">{renderStars(rev.rating)}<span className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</span></div><p className="text-gray-700 text-sm mt-2 line-clamp-2">{rev.comment}</p></div>))}</div>
            <div className="bg-white rounded-lg shadow-md p-6">{selectedReview ? (<><div className="flex justify-between mb-4"><h3 className="text-xl font-bold">Review Details</h3><div className="flex gap-2"><button onClick={() => toggleReviewApproval(selectedReview.id, selectedReview.is_approved)} className={selectedReview.is_approved ? 'text-yellow-500' : 'text-green-500'}>{selectedReview.is_approved ? <FaTimesCircle size={20} /> : <FaCheckCircle size={20} />}</button><button onClick={() => deleteReview(selectedReview.id)} className="text-red-500"><FaTrash size={18} /></button></div></div><div className="space-y-4"><div><label className="text-gray-500 text-sm">Customer:</label><p className="font-semibold">{getUserName(selectedReview.user_id)}</p></div><div><label className="text-gray-500 text-sm">Restaurant:</label><p className="font-semibold">{getRestaurantName(selectedReview.restaurant_id)}</p></div><div><label className="text-gray-500 text-sm">Rating:</label><div className="flex items-center gap-2 mt-1">{renderStars(selectedReview.rating)}<span className="font-bold">{selectedReview.rating}/5</span></div></div><div><label className="text-gray-500 text-sm">Review:</label><div className="mt-2 p-4 bg-gray-50 rounded-lg"><p className="whitespace-pre-wrap">{selectedReview.comment}</p></div></div><div><label className="text-gray-500 text-sm">Submitted:</label><p>{new Date(selectedReview.created_at).toLocaleString()}</p></div></div></>) : (<div className="text-center py-10 text-gray-500"><FaStar className="text-5xl mx-auto mb-3" /><p>Select a review to view details</p></div>)}</div></div>
        )}
      </div>
    )
  }

  // Modal
  const renderModal = () => {
    if (!showModal) return null
    const getForm = () => {
      if (activeTab === 'restaurants') return (<><input type="text" placeholder="Restaurant Name *" className="w-full p-2 border rounded mb-3" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required /><textarea placeholder="Description" className="w-full p-2 border rounded mb-3" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /><input type="text" placeholder="Address" className="w-full p-2 border rounded mb-3" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} /><input type="text" placeholder="Phone" className="w-full p-2 border rounded mb-3" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /><input type="text" placeholder="Image URL" className="w-full p-2 border rounded mb-3" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} /></>)
      if (activeTab === 'categories') return (<><select className="w-full p-2 border rounded mb-3" value={formData.restaurant_id || ''} onChange={e => setFormData({...formData, restaurant_id: e.target.value})} required><option value="">Select Restaurant</option>{restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select><input type="text" placeholder="Category Name *" className="w-full p-2 border rounded mb-3" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required /><textarea placeholder="Description" className="w-full p-2 border rounded mb-3" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></>)
      if (activeTab === 'menu') return (<><select className="w-full p-2 border rounded mb-3" value={formData.restaurant_id || ''} onChange={e => setFormData({...formData, restaurant_id: e.target.value, category_id: ''})} required><option value="">Select Restaurant</option>{restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select><select className="w-full p-2 border rounded mb-3" value={formData.category_id || ''} onChange={e => setFormData({...formData, category_id: e.target.value})} required><option value="">Select Category</option>{categories.filter(c => c.restaurant_id == formData.restaurant_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input type="text" placeholder="Item Name *" className="w-full p-2 border rounded mb-3" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required /><textarea placeholder="Description" className="w-full p-2 border rounded mb-3" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /><input type="number" step="0.01" placeholder="Price *" className="w-full p-2 border rounded mb-3" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} required /><input type="text" placeholder="Image URL" className="w-full p-2 border rounded mb-3" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} /></>)
    }
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 max-w-md w-full"><h3 className="text-2xl font-bold mb-4">{editingItem ? 'Edit' : 'Add'} {activeTab.slice(0,-1)}</h3><form onSubmit={handleSubmit}>{getForm()}<div className="flex gap-4 mt-6"><button type="submit" disabled={loading} className="bg-primary text-white px-4 py-2 rounded flex-1">{loading ? 'Saving...' : 'Save'}</button><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button></div></form></div></div>)
  }

  // ✅ TABS ARRAY - DEFINED HERE
  const tabs = [
    { id: 'restaurants', label: 'Restaurants', icon: FaStore, component: renderRestaurants },
    { id: 'categories', label: 'Categories', icon: FaTags, component: renderCategories },
    { id: 'menu', label: 'Menu Items', icon: FaHamburger, component: renderMenuItems },
    { id: 'orders', label: 'Orders', icon: FaShoppingCart, component: renderOrders },
    { id: 'users', label: 'Users', icon: FaUsers, component: renderUsers },
    { id: 'messages', label: 'Messages', icon: FaEnvelope, component: renderMessages },
    { id: 'reviews', label: 'Reviews', icon: FaStar, component: renderReviews },
  ]

  if (loading && Object.keys(stats).length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner"></div><p className="ml-3">Loading dashboard...</p></div>
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {statCards.map((card, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.05 }} className={`bg-gradient-to-r ${card.color} rounded-xl p-4 text-white cursor-pointer shadow-lg`} onClick={() => setActiveTab(card.tab)}>
              <card.icon className="text-2xl mb-1" />
              <div className="text-xl font-bold">{card.value}</div>
              <div className="text-xs opacity-90">{card.title}</div>
            </motion.div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b overflow-x-auto">
            <div className="flex">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-3 flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <tab.icon /> {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">{tabs.find(t => t.id === activeTab)?.component()}</div>
        </div>
      </div>
      {renderModal()}
    </div>
  )
}

export default AdminDashboard