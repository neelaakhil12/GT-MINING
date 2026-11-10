import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create Nodemailer Transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for port 465, false for port 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER || 'gtmining2026@gmail.com',
    pass: (process.env.SMTP_PASSWORD || 'umdqrqcjpniegqdh').replace(/\s+/g, ''),
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send Password Reset OTP Email
 * @param {Object} params
 * @param {string} params.toEmail - Recipient email address
 * @param {string} params.otpCode - 6-digit OTP code
 * @param {string} [params.recipientName] - User's name
 * @param {string} [params.resetLink] - Direct reset URL
 */
export async function sendPasswordResetEmail({ toEmail, otpCode, recipientName, resetLink, isAdmin }) {
  const fromAddress = process.env.SMTP_FROM || '"GT Mining Network" <gtmining2026@gmail.com>';
  const websiteUrl = process.env.WEBSITE_URL || 'http://localhost:5174';
  const isMasterAdmin = Boolean(isAdmin || (toEmail && toEmail.toLowerCase() === 'gtmining2026@gmail.com'));
  
  const directLink = resetLink || (isMasterAdmin
    ? `${websiteUrl}/admin/login?mode=reset&email=${encodeURIComponent(toEmail)}&otp=${otpCode}`
    : `${websiteUrl}/forgot-password?email=${encodeURIComponent(toEmail)}&otp=${otpCode}`);

  const userName = isMasterAdmin ? 'Master Administrator' : (recipientName || 'GT Pioneer');

  const subject = isMasterAdmin
    ? `[GT Admin Gateway] ${otpCode} is your Master Admin Password Reset Code`
    : `[GT Network] ${otpCode} is your Password Reset Verification Code`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${isMasterAdmin ? 'GT Admin Gateway Password Reset' : 'GT Mining Account Recovery'}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #F0FAF3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0A341B; }
        .wrapper { width: 100%; max-width: 580px; margin: 30px auto; background: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #D1FAE5; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.08); }
        .header { background: ${isMasterAdmin ? 'linear-gradient(135deg, #78350F 0%, #D97706 100%)' : 'linear-gradient(135deg, #0A341B 0%, #15803D 100%)'}; padding: 32px 24px; text-align: center; }
        .logo-text { font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: 1px; margin: 0; }
        .sub-tag { font-size: 11px; font-weight: 700; color: ${isMasterAdmin ? '#FEF3C7' : '#86EFAC'}; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 18px; font-weight: 800; color: #0A341B; margin: 0 0 12px 0; }
        .body-text { font-size: 14px; line-height: 22px; color: #1E5E36; margin: 0 0 24px 0; }
        .otp-card { background: ${isMasterAdmin ? '#FEF3C7' : '#EAF8EE'}; border: 2px dashed ${isMasterAdmin ? '#F59E0B' : '#22C55E'}; border-radius: 16px; padding: 22px; text-align: center; margin: 28px 0; }
        .otp-label { font-size: 11px; font-weight: 800; color: ${isMasterAdmin ? '#B45309' : '#15803D'}; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
        .otp-number { font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #0A341B; font-family: 'Courier New', Courier, monospace; margin: 4px 0; }
        .otp-expiry { font-size: 11.5px; color: ${isMasterAdmin ? '#D97706' : '#16A34A'}; font-weight: 600; margin-top: 8px; }
        .btn-wrapper { text-align: center; margin: 28px 0; }
        .btn-link { background: ${isMasterAdmin ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'}; color: ${isMasterAdmin ? '#0A341B' : '#FFFFFF'} !important; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-weight: 900; font-size: 14px; display: inline-block; box-shadow: 0 6px 18px rgba(245, 158, 11, 0.35); }
        .security-notice { background: #FEF9C3; border-left: 4px solid #EAB308; padding: 14px 18px; border-radius: 10px; font-size: 12px; color: #854D0E; line-height: 18px; margin: 28px 0 0 0; }
        .footer { padding: 24px 32px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center; font-size: 11.5px; color: #6B7280; line-height: 18px; }
      </style>
    </head>
    <body>
      <div style="padding: 20px 10px;">
        <div class="wrapper">
          <div class="header">
            <h1 class="logo-text">${isMasterAdmin ? '🛡️ GT ADMIN GATEWAY' : '💎 GT MINING NETWORK'}</h1>
            <div class="sub-tag">${isMasterAdmin ? 'Master Administration Security' : 'Autonomous Decentralized Cloud Protocol'}</div>
          </div>
          
          <div class="content">
            <h2 class="greeting">Hello, ${userName}!</h2>
            <p class="body-text">
              We received a request to recover and reset the administrator password for <strong>${toEmail}</strong>.
            </p>
            
            <div class="otp-card">
              <div class="otp-label">Master Password Reset Code</div>
              <div class="otp-number">${otpCode}</div>
              <div class="otp-expiry">⏱️ Valid for 15 minutes • Single Use Only</div>
            </div>

            <p class="body-text" style="text-align: center; font-size: 13px;">
              Enter this 6-digit code on the Admin Reset screen, or click the button below to reset your password directly:
            </p>

            <div class="btn-wrapper">
              <a href="${directLink}" class="btn-link" target="_blank">
                Reset Admin Password Directly →
              </a>
            </div>

            <div class="security-notice">
              <strong>🔒 Security Notice:</strong> If you did not initiate this administrator password recovery, please secure your server immediately.
            </div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 6px 0;">This is an automated security dispatch from GT Mining Protocol.</p>
            <p style="margin: 0;">© 2026 GT Mining Network. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
GT MINING NETWORK - Password Reset
--------------------------------------------------
Hello ${userName},

Your OTP verification code for password reset is:

${otpCode}

This code is valid for 15 minutes.

You can also reset your password directly using this link:
${directLink}

If you did not request this, please disregard this email.

GT Mining Network Protocol
https://gtmining.org
  `;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject,
    text,
    html,
  });

  console.log(`[Email Service] Password reset email sent successfully to ${toEmail}. Message ID: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}

/**
 * Send Sign Up Verification OTP Email
 * @param {Object} params
 * @param {string} params.toEmail - Recipient email address
 * @param {string} params.otpCode - 6-digit OTP code
 * @param {string} [params.recipientName] - User's name
 */
export async function sendSignUpOtpEmail({ toEmail, otpCode, recipientName }) {
  const fromAddress = process.env.SMTP_FROM || '"GT Mining Network" <gtmining2026@gmail.com>';
  const userName = recipientName || 'GT Pioneer';
  const subject = `[GT Network] ${otpCode} is your Account Verification Code`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>GT Mining Account Verification</title>
      <style>
        body { margin: 0; padding: 0; background-color: #F0FAF3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0A341B; }
        .wrapper { width: 100%; max-width: 580px; margin: 30px auto; background: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #D1FAE5; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.08); }
        .header { background: linear-gradient(135deg, #0A341B 0%, #15803D 100%); padding: 32px 24px; text-align: center; }
        .logo-text { font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: 1px; margin: 0; }
        .sub-tag { font-size: 11px; font-weight: 700; color: #86EFAC; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 18px; font-weight: 800; color: #0A341B; margin: 0 0 12px 0; }
        .body-text { font-size: 14px; line-height: 22px; color: #1E5E36; margin: 0 0 24px 0; }
        .otp-card { background: #EAF8EE; border: 2px dashed #22C55E; border-radius: 16px; padding: 22px; text-align: center; margin: 28px 0; }
        .otp-label { font-size: 11px; font-weight: 800; color: #15803D; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
        .otp-number { font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #0A341B; font-family: 'Courier New', Courier, monospace; margin: 4px 0; }
        .otp-expiry { font-size: 11.5px; color: #16A34A; font-weight: 600; margin-top: 8px; }
        .security-notice { background: #ECFDF5; border-left: 4px solid #10B981; padding: 14px 18px; border-radius: 10px; font-size: 12px; color: #065F46; line-height: 18px; margin: 28px 0 0 0; }
        .footer { padding: 24px 32px; background: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center; font-size: 11.5px; color: #6B7280; line-height: 18px; }
      </style>
    </head>
    <body>
      <div style="padding: 20px 10px;">
        <div class="wrapper">
          <div class="header">
            <h1 class="logo-text">💎 GT MINING NETWORK</h1>
            <div class="sub-tag">Decentralized Autonomous Mining Protocol</div>
          </div>
          <div class="content">
            <h2 class="greeting">Welcome, ${userName}!</h2>
            <p class="body-text">
              Thank you for registering on GT Mining Network. To verify your email address and activate your mining account, please enter the 6-digit verification code below:
            </p>
            <div class="otp-card">
              <div class="otp-label">Account Verification Code</div>
              <div class="otp-number">${otpCode}</div>
              <div class="otp-expiry">⏱️ Valid for 10 minutes • Single Use Only</div>
            </div>
            <div class="security-notice">
              <strong>🔒 Security Notice:</strong> Never share your verification code with anyone. GT Network staff will never ask for your code.
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} GT Mining Network. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hello ${userName},

Your GT Network verification code is: ${otpCode}

This code is valid for 10 minutes. Please enter this code to complete your registration.

GT Mining Network
  `;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: toEmail,
    subject,
    text,
    html,
  });

  console.log(`[Email Service] Sign up verification email sent to ${toEmail}. Message ID: ${info.messageId}`);
  return { success: true, messageId: info.messageId };
}

