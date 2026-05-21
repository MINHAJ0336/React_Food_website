import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa'
import { supabase } from '../config/supabase'
import { notifyAdminNewMessage } from '../utils/notificationHelper'
import toast from 'react-hot-toast'

const Contact = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    subject: '',
    message: '' 
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'General Inquiry',
          message: formData.message,
          status: 'unread'
        }])
        .select()
      
      if (error) throw error
      
      // Send notification to admin
      await notifyAdminNewMessage(formData.name, formData.email, formData.subject)
      
      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Error saving message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Contact Us
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <FaPhone className="text-primary text-xl" />
              <div>
                <p className="font-semibold">Phone</p>
                <p className="text-gray-600">+92 3360367098</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <FaEnvelope className="text-primary text-xl" />
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-gray-600">support@restohub.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <FaMapMarkerAlt className="text-primary text-xl" />
              <div>
                <p className="font-semibold">Address</p>
                <p className="text-gray-600">House: 45 Koshar latifabad Hyderabad</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold mb-4">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name *"
                className="input-modern"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Your Email *"
                className="input-modern"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Subject (optional)"
                className="input-modern"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
              <textarea
                placeholder="Your Message *"
                rows="5"
                className="input-modern"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? 'Sending...' : 'Send Message'}
                <FaPaperPlane />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Contact