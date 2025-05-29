const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isInitialized = false;
    console.log('📧 Email service created, will initialize on first use');
  }

  async ensureInitialized() {
    if (this.isInitialized) return;

    try {
      // Check if real SMTP credentials are provided
      if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_PASS !== 'your_app_password_here') {
        console.log('📧 Initializing SMTP transporter...');

        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          connectionTimeout: 10000, // 10 seconds
          greetingTimeout: 5000, // 5 seconds
          socketTimeout: 10000, // 10 seconds
        });

        // Test the connection with timeout
        const verifyPromise = this.transporter.verify();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SMTP connection timeout')), 15000)
        );

        await Promise.race([verifyPromise, timeoutPromise]);
        console.log('✅ SMTP server ready');
      } else {
        // Fallback to Ethereal Email for testing
        console.log('📧 No real SMTP credentials found, creating test email account with Ethereal...');
        const testAccount = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        console.log('✅ Test email account created:');
        console.log(`   User: ${testAccount.user}`);
        console.log(`   📧 Emails will generate preview URLs you can view in browser`);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      console.log('📧 Falling back to console logging mode');
      this.transporter = null;
      this.isInitialized = true;
    }
  }

  // Generate a secure token for password setup
  generatePasswordToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send password setup email to new employee
  async sendPasswordSetupEmail(employeeEmail, employeeName, token) {
    const setupUrl = `${process.env.FRONTEND_URL}/setup-password?token=${token}`;

    // Ensure email service is initialized
    await this.ensureInitialized();

    // If no transporter is available, log the email details to console
    if (!this.transporter) {
      console.log('\n=== EMAIL SIMULATION ===');
      console.log(`To: ${employeeEmail}`);
      console.log(`Subject: Welcome to Employee Management System - Set Your Password`);
      console.log(`Employee: ${employeeName}`);
      console.log(`Password Setup URL: ${setupUrl}`);
      console.log('========================\n');

      return {
        success: true,
        messageId: 'simulated-' + Date.now(),
        message: 'Email simulated - check console for details'
      };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: employeeEmail,
      subject: 'Welcome to Employee Management System - Set Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
            <h1>Welcome to EMS</h1>
          </div>

          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2>Hello ${employeeName},</h2>

            <p>Welcome to our Employee Management System! Your employee account has been created successfully.</p>

            <p>To complete your account setup, please click the button below to set your password:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupUrl}"
                 style="background-color: #3498db; color: white; padding: 12px 30px;
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Set Your Password
              </a>
            </div>

            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3498db;">${setupUrl}</p>

            <p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

            <p style="color: #666; font-size: 14px;">
              If you didn't expect this email, please contact your HR department immediately.
            </p>
          </div>

          <div style="background-color: #2c3e50; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© 2024 Employee Management System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);

      console.log('📧 Password setup email sent successfully');
      console.log(`   To: ${employeeEmail}`);
      console.log(`   Employee: ${employeeName}`);

      // Generate preview URL for Ethereal emails (if using Ethereal)
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`   🌐 Preview URL: ${previewUrl}`);
        return {
          success: true,
          messageId: info.messageId,
          previewUrl: previewUrl,
          message: `Email sent! Preview at: ${previewUrl}`
        };
      }

      // For real email services (Gmail, etc.)
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully!'
      };
    } catch (error) {
      console.error('❌ Error sending password setup email:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(userEmail, userName, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject: 'Password Reset Request - Employee Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
            <h1>Password Reset</h1>
          </div>

          <div style="padding: 30px; background-color: #f8f9fa;">
            <h2>Hello ${userName},</h2>

            <p>We received a request to reset your password for your Employee Management System account.</p>

            <p>Click the button below to reset your password:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #e74c3c; color: white; padding: 12px 30px;
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #e74c3c;">${resetUrl}</p>

            <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

            <p style="color: #666; font-size: 14px;">
              If you didn't request this password reset, please ignore this email or contact your administrator.
            </p>
          </div>

          <div style="background-color: #2c3e50; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© 2024 Employee Management System. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  async testConnection() {
    if (!this.transporter) {
      console.log('Email service: Running in simulation mode');
      return true;
    }

    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
