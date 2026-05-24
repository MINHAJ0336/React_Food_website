import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'  // ADD THIS IMPORT
import ProtectedRoute from './components/Layout/ProtectedRoute'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import ChatButton from './components/Chat/ChatButton'  // ADD THIS IMPORT
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Signup from './components/Auth/Signup'
import Login from './components/Auth/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import OrderTracking from './pages/OrderTracking'
import RestaurantDetail from './pages/RestaurantDetail'
import ForgotPasswordOTP from './pages/ForgotPasswordOTP'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <Router 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <ChatProvider>  {/* ADD THIS WRAPPER */}
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Navbar />
            <Routes>
              {/* Public Routes - Everyone can access */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password-otp" element={<ForgotPasswordOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected Routes - Only logged in users */}
              <Route path="/cart" element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } />
              
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['user', 'admin']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/restaurant/:id" element={
                <ProtectedRoute>
                  <RestaurantDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/track-order/:id" element={
                <ProtectedRoute>
                  <OrderTracking />
                </ProtectedRoute>
              } />
              
              {/* Admin Only Route */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
            <Footer />
            <ChatButton />  {/* ADD THIS COMPONENT */}
          </div>
        </ChatProvider>  {/* ADD THIS CLOSING TAG */}
      </AuthProvider>
    </Router>
  )
}

export default App