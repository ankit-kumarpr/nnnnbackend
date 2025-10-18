const nodemailer = require('nodemailer');
const { FROM_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

// Simple transporter configuration for better compatibility
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 587),
  secure: false, // Use STARTTLS
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  // Minimal timeout settings
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 15000, // 15 seconds
  socketTimeout: 30000, // 30 seconds
  // Disable TLS verification for compatibility
  tls: {
    rejectUnauthorized: false
  }
});

// Skip verification in production to avoid timeout issues
if (process.env.NODE_ENV !== 'production') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter verification failed:', error.message);
    } else {
      console.log('✅ Email transporter is ready to send messages');
    }
  });
} else {
  console.log('📧 Email transporter configured (verification skipped in production)');
}

async function sendMail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html
    });
    
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

// Export all the template functions
function welcomeForAdminTemplate({ name, email, phone, password,customId }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome Admin</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f7;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f7f7;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin: 40px 0; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Gnet E-commerce</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color: #333333; margin-top: 0;">Hello ${name}!</h2>
                  <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                    Your admin account has been successfully created. Here are your login credentials:
                  </p>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0; color: #333333;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 5px 0; color: #333333;"><strong>Phone:</strong> ${phone}</p>
                    <p style="margin: 5px 0; color: #333333;"><strong>Password:</strong> ${password}</p>
                    <p style="margin: 5px 0; color: #333333;"><strong>Custom ID:</strong> ${customId}</p>
                  </div>
                  
                  <p style="color: #ff6b6b; text-align: center; font-size: 14px;">
                    Please change your password after first login for security.
                  </p>
                  
                  <p style="color: #999999; font-size: 14px; line-height: 1.6;">
                    If you have any questions, please contact our support team.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="color: #999999; margin: 0; font-size: 14px;">
                    &copy; ${new Date().getFullYear()} Gnet E-commerce. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function otpEmailTemplate({ code }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f7;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f7f7;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin: 40px 0; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Email Verification</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color: #333333; margin-top: 0;">Verify Your Email</h2>
                  <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                    Thank you for registering with Gnet E-commerce. Use the following OTP code to complete your verification:
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; background-color: #f8f9fa; padding: 15px 30px; border: 2px dashed #4facfe; border-radius: 8px;">
                      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333333;">${code}</div>
                    </div>
                  </div>
                  
                  <p style="color: #ff6b6b; text-align: center; font-size: 14px;">
                    This code will expire in ${process.env.OTP_EXPIRES_MIN || 10} minutes.
                  </p>
                  
                  <p style="color: #999999; font-size: 14px; line-height: 1.6;">
                    If you didn't request this code, please ignore this email or contact support if you have concerns.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="color: #999999; margin: 0; font-size: 14px;">
                    &copy; ${new Date().getFullYear()} Gnet E-commerce. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function welcomeForUserTemplate({ name, email, phone, password,customId }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome User</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f7;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f7f7;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin: 40px 0; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Gnet E-commerce</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color: #333333; margin-top: 0;">Hello ${name}!</h2>
                  <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                    Your account has been successfully created. Here are your login credentials:
                  </p>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0; color: #333333;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 5px 0; color: #333333;"><strong>Phone:</strong> ${phone}</p>
                    <p style="margin: 5px 0; color: #333333;"><strong>Password:</strong> ${password}</p>
                    <p style="margin: 5px 0; color: #333333;"><strong>Custom ID:</strong> ${customId}</p>
                  </div>
                  
                  <p style="color: #ff6b6b; text-align: center; font-size: 14px;">
                    Please change your password after first login for security.
                  </p>
                  
                  <p style="color: #999999; font-size: 14px; line-height: 1.6;">
                    If you have any questions, please contact our support team.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="color: #999999; margin: 0; font-size: 14px;">
                    &copy; ${new Date().getFullYear()} Gnet E-commerce. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function welcomeForIndividualTemplate({ name, email, phone, password,customId }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome Individual</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f7;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f7f7;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin: 40px 0; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Gnet E-commerce</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color: #333333; margin-top: 0;">Hello ${name}!</h2>
                  <p style="color: #666666; line-height: 1.6; margin-bottom: 20px;">
                    Your individual account has been successfully created. Here are your login credentials:
                  </p>
                  
                  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0; color: #333333;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 5px 0; color: #333333;"><strong>Phone:</strong> ${phone}</p>
                    <p style="margin: 5px 0; color: #333333;"><strong>Password:</strong> ${password}</p>
                    <p style="margin: 5px 0; color: #333333;"><strong>Custom ID:</strong> ${customId}</p>
                  </div>
                  
                  <p style="color: #ff6b6b; text-align: center; font-size: 14px;">
                    Please change your password after first login for security.
                  </p>
                  
                  <p style="color: #999999; font-size: 14px; line-height: 1.6;">
                    If you have any questions, please contact our support team.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="color: #999999; margin: 0; font-size: 14px;">
                    &copy; ${new Date().getFullYear()} Gnet E-commerce. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

module.exports = {
  sendMail,
  welcomeForAdminTemplate,
  otpEmailTemplate,
  welcomeForUserTemplate,
  welcomeForIndividualTemplate,
};
