import React from 'react'
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaUtensils } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-secondary text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FaUtensils className="text-3xl text-primary" />
              <span className="text-xl font-bold">RestoHub</span>
            </div>
            <p className="text-gray-300">Delivering happiness to your doorstep since 2026.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-300 hover:text-primary transition">About Us</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-primary transition">Contact</a></li>
              <li><a href="/menu" className="text-gray-300 hover:text-primary transition">Menu</a></li>
              <li><a href="/terms" className="text-gray-300 hover:text-primary transition">Terms & Conditions</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-300">
              <li>📍 House: 45 Koshar Ltd Hyd</li>
              <li>📞 +92 3360367098</li>
              <li>✉️ support@restohub.com</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-2xl hover:text-primary transition"><FaFacebook /></a>
              <a href="#" className="text-2xl hover:text-primary transition"><FaTwitter /></a>
              <a href="#" className="text-2xl hover:text-primary transition"><FaInstagram /></a>
              <a href="#" className="text-2xl hover:text-primary transition"><FaYoutube /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 RestoHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer