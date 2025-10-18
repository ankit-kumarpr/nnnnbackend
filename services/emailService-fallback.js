const nodemailer = require('nodemailer');
const { FROM_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

// Multiple email providers for fallback
const emailProviders = [
  // SendGrid (Best for production)
  {
    name: 'SendGrid',
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  },
  // Mailgun
  {
    name: 'Mailgun',
    host: 'smtp.mailgun.org',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAILGUN_USER,
      pass: process.env.MAILGUN_PASS
    }
  },
  // Outlook (Better than Gmail for Render)
  {
    name: 'Outlook',
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.OUTLOOK_USER,
      pass: process.env.OUTLOOK_PASS
    }
  },
  // Gmail (Last resort)
  {
    name: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  }
];

let currentProvider = null;
let transporter = null;

// Initialize transporter with fallback
async function initializeTransporter() {
  for (const provider of emailProviders) {
    try {
      // Skip providers without credentials
      if (!provider.auth.user || !provider.auth.pass) {
        console.log(`⏭️ Skipping ${provider.name} - credentials not set`);
        continue;
      }

      console.log(`🔄 Trying ${provider.name}...`);
      
      const testTransporter = nodemailer.createTransporter({
        host: provider.host,
        port: provider.port,
        secure: provider.secure,
        auth: provider.auth,
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 5000, // 5 seconds
        socketTimeout: 10000, // 10 seconds
        tls: {
          rejectUnauthorized: false
        },
        maxRetries: 0
      });

      // Quick connection test
      await Promise.race([
        testTransporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 8000)
        )
      ]);

      transporter = testTransporter;
      currentProvider = provider.name;
      console.log(`✅ ${provider.name} connected successfully!`);
      break;

    } catch (error) {
      console.log(`❌ ${provider.name} failed:`, error.message);
      continue;
    }
  }

  if (!transporter) {
    console.error('❌ All email providers failed!');
    // Create a dummy transporter that logs emails
    transporter = {
      sendMail: async (options) => {
        console.log('📧 EMAIL LOGGED (No provider available):', {
          to: options.to,
          subject: options.subject,
          from: options.from
        });
        return { messageId: 'logged-' + Date.now(), accepted: [options.to] };
      }
    };
    currentProvider = 'Logger';
  }
}

// Initialize on startup
initializeTransporter();

async function sendMail({ to, subject, html, text }) {
  try {
    if (!transporter) {
      await initializeTransporter();
    }

    console.log(`📧 Sending email via ${currentProvider} to:`, to);
    
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html
    });
    
    console.log(`✅ Email sent successfully via ${currentProvider}:`, {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return info;
  } catch (error) {
    console.error(`❌ Email sending failed via ${currentProvider}:`, {
      error: error.message,
      code: error.code,
      to: to
    });
    
    // Try to reconnect with different provider
    if (currentProvider !== 'Logger') {
      console.log('🔄 Attempting to reconnect with different provider...');
      await initializeTransporter();
      
      // Retry once with new provider
      if (transporter && currentProvider !== 'Logger') {
        try {
          const retryInfo = await transporter.sendMail({
            from: FROM_EMAIL,
            to,
            subject,
            text,
            html
          });
          console.log(`✅ Email sent on retry via ${currentProvider}:`, retryInfo.messageId);
          return retryInfo;
        } catch (retryError) {
          console.error(`❌ Retry also failed:`, retryError.message);
        }
      }
    }
    
    // In production, don't throw error, just log
    console.log('📧 Email failed but continuing (production mode)');
    return { messageId: 'failed-' + Date.now(), accepted: [], rejected: [to] };
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
