const nodemailer = require('nodemailer');
const { FROM_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

// Enhanced transporter with debugging
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: Number(SMTP_PORT) === 465, // true for 465, false for others
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  // Simplified timeout settings for better compatibility
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  socketTimeout: 60000, // 60 seconds
  // Disable TLS verification for better compatibility
  tls: {
    rejectUnauthorized: false
  },
  // Simple retry settings
  retryDelay: 2000, // 2 seconds between retries
  maxRetries: 2, // Maximum number of retries
  // Debug mode for troubleshooting
  debug: process.env.NODE_ENV === 'development',
  logger: process.env.NODE_ENV === 'development'
});

// Enhanced verification with detailed logging
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message);
    console.error('📧 SMTP Configuration:', {
      host: SMTP_HOST,
      port: SMTP_PORT,
      user: SMTP_USER,
      from: FROM_EMAIL
    });
    console.log('📧 Email service will still work, but verification failed');
  } else {
    console.log('✅ Email transporter is ready to send messages');
    console.log('📧 SMTP Configuration verified:', {
      host: SMTP_HOST,
      port: SMTP_PORT,
      user: SMTP_USER,
      from: FROM_EMAIL
    });
  }
});

async function sendMail({ to, subject, html, text }) {
  try {
    console.log('📧 Attempting to send email:', {
      to,
      from: FROM_EMAIL,
      subject,
      smtpHost: SMTP_HOST
    });

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html
    });
    
    console.log('✅ Email sent successfully:', {
      messageId: info.messageId,
      to: info.accepted,
      rejected: info.rejected,
      response: info.response
    });

    // Check if email was actually accepted
    if (info.rejected && info.rejected.length > 0) {
      console.error('❌ Email was rejected:', info.rejected);
      throw new Error(`Email rejected for addresses: ${info.rejected.join(', ')}`);
    }

    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', {
      error: error.message,
      code: error.code,
      command: error.command,
      to,
      from: FROM_EMAIL
    });
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

// Test email function for debugging
async function testEmail(to) {
  try {
    console.log('🧪 Testing email configuration...');
    
    const testInfo = await transporter.sendMail({
      from: FROM_EMAIL,
      to: to,
      subject: 'Test Email - Gnet E-commerce',
      text: 'This is a test email to verify email configuration.',
      html: '<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>'
    });

    console.log('✅ Test email sent successfully:', testInfo.messageId);
    return { success: true, messageId: testInfo.messageId };
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Export all functions
module.exports = {
  sendMail,
  testEmail,
  transporter,
  // Import all template functions from the original file
  ...require('./emailService')
};
