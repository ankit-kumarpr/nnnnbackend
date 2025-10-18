const express = require('express');
const { testEmail } = require('../services/emailService-debug');

const router = express.Router();

// Test email endpoint for debugging
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    console.log('🧪 Testing email to:', email);
    const result = await testEmail(email);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId,
        email: email
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Test email failed',
        error: result.error,
        email: email
      });
    }
  } catch (error) {
    console.error('Test email endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test email endpoint error',
      error: error.message
    });
  }
});

// Email configuration check endpoint
router.get('/email-config', (req, res) => {
  const config = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    FROM_EMAIL: process.env.FROM_EMAIL,
    // Don't expose password
    SMTP_PASS: process.env.SMTP_PASS ? '***configured***' : 'NOT_SET'
  };

  res.json({
    success: true,
    config: config,
    message: 'Email configuration check'
  });
});

module.exports = router;
