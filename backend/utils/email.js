/**
 * Email service using Nodemailer
 * This file contains utility functions to send emails using Nodemailer
 */
const nodemailer = require('nodemailer');

/**
 * Create a reusable transporter object
 * For production, use your own SMTP server or a service like Gmail, SendGrid, etc.
 */
const createTransporter = () => {
  // For Gmail, you might need to create an app password:
  // https://support.google.com/accounts/answer/185833
  return nodemailer.createTransport({
    service: 'gmail', // Can be any service supported by Nodemailer
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - Optional HTML content
 * @returns {Promise} - Promise resolving when email is sent
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Herdoza Fitness Gym" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      text,
      html: html || text // Use HTML if provided, otherwise use plain text
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send an OTP verification email
 * @param {string} to - Recipient email address
 * @param {string} otp - One-time password
 * @param {string} type - Type of OTP (signup, login, reset)
 * @returns {Promise} - Promise resolving when email is sent
 */
const sendOTP = async (to, otp, type = 'signup') => {
  let subject, text, html;
  
  switch (type) {
    case 'signup':
      subject = 'Verify Your Email for Herdoza Fitness Gym';
      text = `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this code, please ignore this email.`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Herdoza Fitness Gym</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e2e8f0;">
            <h3>Verify Your Email</h3>
            <p>Thank you for signing up with Herdoza Fitness Gym. Please use the verification code below to complete your registration:</p>
            <div style="background-color: #f3f4f6; padding: 10px; text-align: center; margin: 20px 0;">
              <h2 style="letter-spacing: 5px; margin: 0;">${otp}</h2>
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p style="color: #6b7280; font-size: 0.875rem;">If you did not request this code, please ignore this email.</p>
          </div>
          <div style="background-color: #1f2937; padding: 15px; text-align: center; color: white; font-size: 0.75rem;">
            &copy; ${new Date().getFullYear()} Herdoza Fitness Gym. All rights reserved.
          </div>
        </div>
      `;
      break;
      
    case 'login':
      subject = 'Login Verification for Herdoza Fitness Gym';
      text = `Your login verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not attempt to login, please contact us immediately.`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Herdoza Fitness Gym</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e2e8f0;">
            <h3>Login Verification</h3>
            <p>You recently attempted to sign in to your Herdoza Fitness Gym account. Please use the verification code below to complete the login process:</p>
            <div style="background-color: #f3f4f6; padding: 10px; text-align: center; margin: 20px 0;">
              <h2 style="letter-spacing: 5px; margin: 0;">${otp}</h2>
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p style="color: #6b7280; font-size: 0.875rem;">If you did not attempt to login, please contact us immediately.</p>
          </div>
          <div style="background-color: #1f2937; padding: 15px; text-align: center; color: white; font-size: 0.75rem;">
            &copy; ${new Date().getFullYear()} Herdoza Fitness Gym. All rights reserved.
          </div>
        </div>
      `;
      break;
      
    case 'reset':
      subject = 'Password Reset for Herdoza Fitness Gym';
      text = `Your password reset code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you did not request a password reset, please ignore this email.`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Herdoza Fitness Gym</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #e2e8f0;">
            <h3>Password Reset</h3>
            <p>You recently requested to reset your password for your Herdoza Fitness Gym account. Please use the code below to reset your password:</p>
            <div style="background-color: #f3f4f6; padding: 10px; text-align: center; margin: 20px 0;">
              <h2 style="letter-spacing: 5px; margin: 0;">${otp}</h2>
            </div>
            <p>This code will expire in 5 minutes.</p>
            <p style="color: #6b7280; font-size: 0.875rem;">If you did not request a password reset, please ignore this email.</p>
          </div>
          <div style="background-color: #1f2937; padding: 15px; text-align: center; color: white; font-size: 0.75rem;">
            &copy; ${new Date().getFullYear()} Herdoza Fitness Gym. All rights reserved.
          </div>
        </div>
      `;
      break;
  }
  
  return sendEmail(to, subject, text, html);
};

module.exports = {
  sendEmail,
  sendOTP
};