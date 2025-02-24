// src/lib/email.js
/**
 * Email service configuration module
 * This module sets up Nodemailer with SMTP configuration
 * for sending emails from a Next.js application
 */

import nodemailer from 'nodemailer';

/**
 * Create reusable transporter object using SMTP transport
 * Uses environment variables for secure configuration
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Gmail SMTP server
  port: 587, // Standard secure SMTP port
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Sends an email using the configured transporter
 *
 * @param {Object} options - Email sending options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of the email
 * @param {string} options.html - HTML version of the email (optional)
 * @returns {Promise} - Promise that resolves with the sent mail info
 */
export async function sendEmail({ to, subject, text, html }) {
  try {
    // Verify the connection configuration
    await transporter.verify();

    // Prepare mail options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html: html || text, // Use text as HTML if no HTML is provided
    };

    // Send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Sends a test email to verify the configuration
 *
 * @returns {Promise} - Promise that resolves with the sent mail info
 */
export async function sendTestEmail() {
  return sendEmail({
    to: process.env.TEST_EMAIL_RECIPIENT,
    subject: 'Test Email from Next.js App',
    text: 'If you are receiving this email, your email configuration is working correctly.',
    html: `
      <h1>Email Test</h1>
      <p>If you are receiving this email, your email configuration is working correctly.</p>
      <p>Sent at: ${new Date().toLocaleString()}</p>
    `,
  });
}
