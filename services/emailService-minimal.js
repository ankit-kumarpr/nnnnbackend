const nodemailer = require('nodemailer');
const { FROM_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

// Simple, reliable email service for Render
const transporter = nodemailer.createTransporter({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  // Minimal settings for maximum compatibility
  connectionTimeout: 5000, // 5 seconds only
  greetingTimeout: 3000, // 3 seconds only
  socketTimeout: 5000, // 5 seconds only
  tls: {
    rejectUnauthorized: false
  },
  // No retries, no pooling
  maxRetries: 0,
  pool: false
});

// Skip verification completely
console.log('📧 Email service initialized (no verification)');

async function sendMail({ to, subject, html, text }) {
  try {
    console.log('📧 Attempting to send email to:', to);
    
    // Add timeout wrapper
    const emailPromise = transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html
    });

    const info = await Promise.race([
      emailPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout')), 8000)
      )
    ]);
    
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', {
      error: error.message,
      to: to,
      provider: SMTP_HOST
    });
    
    // Don't throw error in production, just log and continue
    console.log('📧 Email failed but API continuing...');
    return { 
      messageId: 'failed-' + Date.now(), 
      accepted: [], 
      rejected: [to],
      error: error.message
    };
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
