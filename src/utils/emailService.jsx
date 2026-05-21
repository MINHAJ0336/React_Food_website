
import emailjs from '@emailjs/browser';

// Initialize EmailJS
emailjs.init('opMNzdKJ0Uwto9ftA');

// 📩 Send OTP Email Function
export const sendOTPEmail = async (userEmail, otpCode, userName) => {

  const displayName = userName || userEmail.split('@')[0];
  // 🔥 IMPORTANT: These keys must match EmailJS template variables
  const templateParams = {
    email: userEmail, // {{email}}
    otp: otpCode,     // {{otp}}
    name: userName || userEmail.split('@')[0], // {{name}}
    from_name: 'RestoHub' // {{from_name}}
  };

  try {
    const result = await emailjs.send(
      'service_cjmcj0h',
      'template_54nssse',   // Template ID
      templateParams
    );

    console.log('✅ OTP email sent successfully:', result.status, result.text);
    return true;

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};