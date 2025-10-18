const nodemailer = require('nodemailer');
const { FROM_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

// Production-optimized transporter for Render
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false, // Always use STARTTLS for Render compatibility
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  // Render-optimized settings
  connectionTimeout: 15000, // 15 seconds
  greetingTimeout: 5000, // 5 seconds
  socketTimeout: 15000, // 15 seconds
  // Minimal TLS settings for Render
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1'
  },
  // Disable problematic features
  ignoreTLS: false,
  requireTLS: false,
  // No retries to avoid hanging
  maxRetries: 0,
  // Pool settings for Render
  pool: false,
  maxConnections: 1,
  maxMessages: 1
});

// Skip verification completely in production
console.log('📧 Email transporter configured for production (Render optimized)');

async function sendMail({ to, subject, html, text }) {
  try {
    console.log('📧 Sending email to:', to);
    
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html
    });
    
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    });

    // Check if email was rejected
    if (info.rejected && info.rejected.length > 0) {
      console.error('❌ Email rejected for:', info.rejected);
      throw new Error(`Email rejected for addresses: ${info.rejected.join(', ')}`);
    }

    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', {
      error: error.message,
      code: error.code,
      to: to
    });
    
    // Don't throw error in production, just log it
    if (process.env.NODE_ENV === 'production') {
      console.log('📧 Email failed but continuing (production mode)');
      return { messageId: 'failed-' + Date.now(), accepted: [], rejected: [to] };
    }
    
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

// Import all template functions
const {
  welcomeForAdminTemplate,
  otpEmailTemplate,
  welcomeForUserTemplate,
  welcomeForIndividualTemplate,
  welcomeForVendorTemplate,
  kycSubmissionTemplate,
  kycApprovalTemplate,
  kycRejectionTemplate
} = require('./emailService');

module.exports = {
  sendMail,
  welcomeForAdminTemplate,
  otpEmailTemplate,
  welcomeForUserTemplate,
  welcomeForIndividualTemplate,
  welcomeForVendorTemplate,
  kycSubmissionTemplate,
  kycApprovalTemplate,
  kycRejectionTemplate
};
