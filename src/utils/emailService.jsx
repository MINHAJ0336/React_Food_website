import emailjs from '@emailjs/browser';

// Get keys from environment variables
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

// Debug: Check if keys are loaded (remove in production)
console.log('🔑 EmailJS Config:', {
  hasPublicKey: !!EMAILJS_PUBLIC_KEY,
  hasServiceId: !!EMAILJS_SERVICE_ID,
  hasTemplateId: !!EMAILJS_TEMPLATE_ID
});

// Initialize EmailJS with public key from env
emailjs.init(EMAILJS_PUBLIC_KEY);

export const sendOTPEmail = async (userEmail, otpCode, userName) => {
  console.log('📧 Sending OTP to:', userEmail);
  
  const displayName = userName || userEmail.split('@')[0];
  
  const templateParams = {
    email: userEmail,
    otp: otpCode,
    name: displayName,
    from_name: 'RestoHub'
  };

  try {
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    console.log('✅ OTP email sent successfully:', result.status);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};