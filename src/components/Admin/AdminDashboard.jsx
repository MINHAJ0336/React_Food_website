// import React, { useState, useEffect } from 'react'
// import { supabase } from '../config/supabase'
// import { motion } from 'framer-motion'
// import { FaStore, FaTags, FaHamburger, FaShoppingCart, FaUsers, FaEye, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
// import toast from 'react-hot-toast'

// const AdminDashboard = () => {
//   const [stats, setStats] = useState({})
//   const [recentOrders, setRecentOrders] = useState([])
//   const [activeTab, setActiveTab] = useState('restaurants')
//   const [loading, setLoading] = useState(false)

//   // Data states
//   const [restaurants, setRestaurants] = useState([])
//   const [categories, setCategories] = useState([])
//   const [menuItems, setMenuItems] = useState([])
  
//   // Modal states
//   const [showModal, setShowModal] = useState(false)
//   const [editingItem, setEditingItem] = useState(null)
//   const [formData, setFormData] = useState({})
//   const [selectedRestaurant, setSelectedRestaurant] = useState('')

//   useEffect(() => {
//     fetchAllData()
//   }, [])

//   const fetchAllData = async () => {
//     setLoading(true)
//     await Promise.all([
//       fetchStats(),
//       fetchRestaurants(),
//       fetchCategories(),
//       fetchMenuItems(),
//       fetchRecentOrders()
//     ])
//     setLoading(false)
//   }

//   const fetchStats = async () => {
//     const [restaurants, categories, menu, orders, users] = await Promise.all([
//       supabase.from('restaurants').select('*', { count: 'exact', head: true }),
//       supabase.from('categories').select('*', { count: 'exact', head: true }),
//       supabase.from('menu_items').select('*', { count: 'exact', head: true }),
//       supabase.from('orders').select('*', { count: 'exact', head: true }),
//       supabase.from('users').select('*', { count: 'exact', head: true })
//     ])
    
//     setStats({
//       restaurants: restaurants.count || 0,
//       categories: categories.count || 0,
//       menu: menu.count || 0,
//       orders: orders.count || 0,
//       users: users.count || 0
//     })
//   }

//   const fetchRestaurants = async () => {
//     const { data } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false })
//     setRestaurants(data || [])
//   }

//   const fetchCategories = async () => {
//     let query = supabase.from('categories').select('*, restaurants(name)')
//     if (selectedRestaurant) {
//       query = query.eq('restaurant_id', selectedRestaurant)
//     }
//     const { data } = await query.order('created_at', { ascending: false })
//     setCategories(data || [])
//   }

//   const fetchMenuItems = async () => {
//     let query = supabase.from('menu_items').select('*, restaurants(name), categories(name)')
//     if (selectedRestaurant) {
//       query = query.eq('restaurant_id', selectedRestaurant)
//     }
//     const { data } = await query.order('created_at', { ascending: false })
//     setMenuItems(data || [])
//   }

//   const fetchRecentOrders = async () => {
//     const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5)
//     setRecentOrders(data || [])
//   }

//   const handleAdd = () => {
//     setEditingItem(null)
//     setFormData({})
//     setShowModal(true)
//   }

//   const handleEdit = (item) => {
//     setEditingItem(item)
//     setFormData(item)
//     setShowModal(true)
//   }

//   const handleDelete = async (table, id) => {
//     if (window.confirm('Are you sure you want to delete this item?')) {
//       const { error } = await supabase.from(table).delete().eq('id', id)
//       if (error) {
//         toast.error('Delete failed: ' + error.message)
//       } else {
//         toast.success('Deleted successfully')
//         fetchAllData()
//       }
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)

//     let result
//     if (activeTab === 'restaurants') {
//       if (editingItem) {
//         result = await supabase.from('restaurants').update(formData).eq('id', editingItem.id)
//       } else {
//         result = await supabase.from('restaurants').insert([{ ...formData, slug: formData.name.toLowerCase().replace(/ /g, '-') }])
//       }
//     } else if (activeTab === 'categories') {
//       if (editingItem) {
//         result = await supabase.from('categories').update(formData).eq('id', editingItem.id)
//       } else {
//         result = await supabase.from('categories').insert([formData])
//       }
//     } else if (activeTab === 'menu') {
//       if (editingItem) {
//         result = await supabase.from('menu_items').update(formData).eq('id', editingItem.id)
//       } else {
//         result = await supabase.from('menu_items').insert([formData])
//       }
//     }

//     if (result?.error) {
//       toast.error('Operation failed: ' + result.error.message)
//     } else {
//       toast.success(`${activeTab.slice(0, -1)} ${editingItem ? 'updated' : 'added'} successfully!`)
//       setShowModal(false)
//       fetchAllData()
//     }
//     setLoading(false)
//   }

//   const updateOrderStatus = async (id, status) => {
//     await supabase.from('orders').update({ status }).eq('id', id)
//     fetchRecentOrders()
//     toast.success('Order status updated')
//   }

//   const statCards = [
//     { title: 'Restaurants', value: stats.restaurants, icon: FaStore, color: 'from-orange-500 to-red-500' },
//     { title: 'Categories', value: stats.categories, icon: FaTags, color: 'from-green-500 to-teal-500' },
//     { title: 'Menu Items', value: stats.menu, icon: FaHamburger, color: 'from-blue-500 to-indigo-500' },
//     { title: 'Orders', value: stats.orders, icon: FaShoppingCart, color: 'from-purple-500 to-pink-500' },
//     { title: 'Users', value: stats.users, icon: FaUsers, color: 'from-yellow-500 to-orange-500' },
//   ]

//   const tabs = [
//     { id: 'restaurants', label: 'Restaurants', icon: FaStore },
//     { id: 'categories', label: 'Categories', icon: FaTags },
//     { id: 'menu', label: 'Menu Items', icon: FaHamburger },
//     { id: 'orders', label: 'Orders', icon: FaShoppingCart },
//   ]

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'restaurants':
//         return (
//           <div>
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold">Restaurants</h2>
//               <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
//                 <FaPlus /> Add Restaurant
//               </button>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {restaurants.map(rest => (
//                 <motion.div key={rest.id} whileHover={{ scale: 1.02 }} className="bg-white rounded-lg shadow-md overflow-hidden">
//                   {rest.image_url && <img src={rest.image_url} alt={rest.name} className="w-full h-48 object-cover" />}
//                   <div className="p-4">
//                     <h3 className="text-xl font-bold mb-2">{rest.name}</h3>
//                     <p className="text-gray-600 text-sm mb-2">{rest.description}</p>
//                     <p className="text-gray-500 text-sm">{rest.address}</p>
//                     <p className="text-gray-500 text-sm">{rest.phone}</p>
//                     <div className="flex justify-end gap-2 mt-4">
//                       <button onClick={() => handleEdit(rest)} className="text-blue-500 hover:text-blue-600">
//                         <FaEdit />
//                       </button>
//                       <button onClick={() => handleDelete('restaurants', rest.id)} className="text-red-500 hover:text-red-600">
//                         <FaTrash />
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         )

//       case 'categories':
//         return (
//           <div>
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold">Categories</h2>
//               <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
//                 <FaPlus /> Add Category
//               </button>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {categories.map(cat => (
//                 <motion.div key={cat.id} whileHover={{ scale: 1.02 }} className="bg-white rounded-lg shadow-md p-4">
//                   <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
//                   <p className="text-gray-600 text-sm mb-2">{cat.description}</p>
//                   <p className="text-gray-500 text-sm">Restaurant: {cat.restaurants?.name}</p>
//                   <div className="flex justify-end gap-2 mt-4">
//                     <button onClick={() => handleEdit(cat)} className="text-blue-500 hover:text-blue-600">
//                       <FaEdit />
//                     </button>
//                     <button onClick={() => handleDelete('categories', cat.id)} className="text-red-500 hover:text-red-600">
//                       <FaTrash />
//                     </button>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         )

//       case 'menu':
//         return (
//           <div>
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold">Menu Items</h2>
//               <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
//                 <FaPlus /> Add Menu Item
//               </button>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full bg-white rounded-lg overflow-hidden">
//                 <thead className="bg-gray-800 text-white">
//                   <tr>
//                     <th className="p-3 text-left">Name</th>
//                     <th className="p-3 text-left">Price</th>
//                     <th className="p-3 text-left">Category</th>
//                     <th className="p-3 text-left">Restaurant</th>
//                     <th className="p-3 text-left">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {menuItems.map(item => (
//                     <tr key={item.id} className="border-b hover:bg-gray-50">
//                       <td className="p-3">{item.name}</td>
//                       <td className="p-3">${item.price}</td>
//                       <td className="p-3">{item.categories?.name}</td>
//                       <td className="p-3">{item.restaurants?.name}</td>
//                       <td className="p-3">
//                         <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-600 mr-3">
//                           <FaEdit />
//                         </button>
//                         <button onClick={() => handleDelete('menu_items', item.id)} className="text-red-500 hover:text-red-600">
//                           <FaTrash />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )

//       case 'orders':
//         return (
//           <div>
//             <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
//             <div className="overflow-x-auto">
//               <table className="w-full bg-white rounded-lg overflow-hidden">
//                 <thead className="bg-gray-800 text-white">
//                   <tr>
//                     <th className="p-3 text-left">Order #</th>
//                     <th className="p-3 text-left">Total</th>
//                     <th className="p-3 text-left">Status</th>
//                     <th className="p-3 text-left">Date</th>
//                     <th className="p-3 text-left">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {recentOrders.map(order => (
//                     <tr key={order.id} className="border-b hover:bg-gray-50">
//                       <td className="p-3">{order.order_number}</td>
//                       <td className="p-3">${order.grand_total}</td>
//                       <td className="p-3">
//                         <select
//                           value={order.status}
//                           onChange={(e) => updateOrderStatus(order.id, e.target.value)}
//                           className="px-2 py-1 border rounded"
//                         >
//                           <option value="pending">Pending</option>
//                           <option value="confirmed">Confirmed</option>
//                           <option value="preparing">Preparing</option>
//                           <option value="delivered">Delivered</option>
//                           <option value="cancelled">Cancelled</option>
//                         </select>
//                       </td>
//                       <td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td>
//                       <td className="p-3">
//                         <button className="text-primary hover:underline">
//                           <FaEye />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )

//       default:
//         return null
//     }
//   }

//   // Modal Form Component
//   const renderModal = () => {
//     if (!showModal) return null

//     const getFormFields = () => {
//       if (activeTab === 'restaurants') {
//         return (
//           <>
//             <input type="text" placeholder="Name" className="input-field mb-4" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
//             <textarea placeholder="Description" className="input-field mb-4" rows="3" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
//             <input type="text" placeholder="Address" className="input-field mb-4" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
//             <input type="text" placeholder="Phone" className="input-field mb-4" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
//             <input type="text" placeholder="Image URL" className="input-field mb-4" value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
//           </>
//         )
//       } else if (activeTab === 'categories') {
//         return (
//           <>
//             <select className="input-field mb-4" value={formData.restaurant_id || ''} onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })} required>
//               <option value="">Select Restaurant</option>
//               {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
//             </select>
//             <input type="text" placeholder="Category Name" className="input-field mb-4" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
//             <textarea placeholder="Description" className="input-field mb-4" rows="3" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
//           </>
//         )
//       } else if (activeTab === 'menu') {
//         return (
//           <>
//             <select className="input-field mb-4" value={formData.restaurant_id || ''} onChange={(e) => setFormData({ ...formData, restaurant_id: e.target.value })} required>
//               <option value="">Select Restaurant</option>
//               {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
//             </select>
//             <select className="input-field mb-4" value={formData.category_id || ''} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required>
//               <option value="">Select Category</option>
//               {categories.filter(c => c.restaurant_id == formData.restaurant_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//             </select>
//             <input type="text" placeholder="Item Name" className="input-field mb-4" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
//             <textarea placeholder="Description" className="input-field mb-4" rows="3" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
//             <input type="number" step="0.01" placeholder="Price" className="input-field mb-4" value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
//             <input type="text" placeholder="Image URL" className="input-field mb-4" value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
//           </>
//         )
//       }
//     }

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg p-6 max-w-md w-full">
//           <h3 className="text-2xl font-bold mb-4">{editingItem ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}</h3>
//           <form onSubmit={handleSubmit}>
//             {getFormFields()}
//             <div className="flex gap-4 mt-6">
//               <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save'}</button>
//               <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
//             </div>
//           </form>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 py-8">
//       <div className="container mx-auto px-4">
//         <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
//           {statCards.map((card, index) => (
//             <motion.div key={index} whileHover={{ scale: 1.05 }} className={`bg-gradient-to-r ${card.color} rounded-xl p-6 text-white`}>
//               <card.icon className="text-3xl mb-2" />
//               <div className="text-2xl font-bold">{card.value}</div>
//               <div className="text-sm opacity-90">{card.title}</div>
//             </motion.div>
//           ))}
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <div className="border-b">
//             <div className="flex">
//               {tabs.map(tab => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`px-6 py-3 flex items-center gap-2 transition-colors ${
//                     activeTab === tab.id ? 'bg-primary text-white' : 'hover:bg-gray-100'
//                   }`}
//                 >
//                   <tab.icon /> {tab.label}
//                 </button>
//               ))}
//             </div>
//           </div>
//           <div className="p-6">
//             {renderContent()}
//           </div>
//         </div>
//       </div>
//       {renderModal()}
//     </div>
//   )
// }

// export default AdminDashboard