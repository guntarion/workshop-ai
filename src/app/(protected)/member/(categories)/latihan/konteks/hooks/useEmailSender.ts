import { useState } from 'react';
import { EmailStatus, EmailData, Prompt } from '../types';
import { EMAIL_CONFIG } from '../constants';

export function useEmailSender() {
  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    loading: false,
    success: false,
    error: null
  });

  const generateEmailContent = (role: string, prompts: Prompt[], userEmail: string): EmailData => {
    const textContent = `Peran: ${role}\n\n${prompts.map(prompt => 
      `Version ${prompt.version}:\n${prompt.content}\n\nFeedback:\n${prompt.feedback || 'No feedback yet'}\n\n`
    ).join('\n')}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
          }
          .container {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 10px;
          }
          .role-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .version {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .version-header {
            background-color: #f8f9fa;
            padding: 10px 15px;
            border-radius: 6px;
            margin-bottom: 15px;
          }
          .timestamp {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
          }
          .content-block {
            background-color: #ffffff;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            margin: 10px 0;
            white-space: pre-wrap;
            font-family: monospace;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .highlight {
            color: #0066cc;
            font-weight: bold;
          }
          h2, h3, h4 {
            color: #2d3748;
            margin: 20px 0 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Latihan Kejelasan Instruksi</h1>
          </div>

          <div class="role-section">
            <h2>Peran Anda:</h2>
            <div class="content-block">
              ${role}
            </div>
          </div>

          <div class="versions">
            ${prompts.map(prompt => `
              <div class="version">
                <div class="version-header">
                  <h3>Prompt Versi ${prompt.version}</h3>
                  <div class="timestamp">${prompt.timestamp.toLocaleString()}</div>
                </div>
                <div class="content-block">
                  <h4>Instruksi:</h4>
                  ${prompt.content.replace(/\n/g, '<br>')}
                </div>
                ${prompt.feedback ? `
                  <div class="content-block">
                    <h4>Feedback AI:</h4>
                    ${prompt.feedback.replace(/\n/g, '<br>')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>
              <strong>${EMAIL_CONFIG.footerText.workshop}</strong><br>
              ${EMAIL_CONFIG.footerText.date}<br>
              ${EMAIL_CONFIG.footerText.organization}
            </p>
            <p class="highlight">
              ${EMAIL_CONFIG.footerText.facilitator}<br>
              ${EMAIL_CONFIG.footerText.role}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return {
      to: userEmail,
      subject: EMAIL_CONFIG.subject,
      text: textContent,
      html: htmlContent
    };
  };

  const sendEmail = async (role: string, prompts: Prompt[], userEmail: string) => {
    if (!prompts.length) {
      setEmailStatus({
        loading: false,
        success: false,
        error: 'Harap buat setidaknya satu prompt terlebih dahulu sebelum mengirim email.'
      });
      return;
    }

    if (!userEmail) {
      setEmailStatus({
        loading: false,
        success: false,
        error: 'Email pengguna tidak ditemukan. Silakan login ulang.'
      });
      return;
    }

    setEmailStatus({
      loading: true,
      success: false,
      error: null
    });

    try {
      const emailData = generateEmailContent(role, prompts, userEmail);
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send email');
      }

      setEmailStatus({
        loading: false,
        success: true,
        error: null
      });

      // Reset success status after timeout
      setTimeout(() => {
        setEmailStatus(prev => ({
          ...prev,
          success: false
        }));
      }, EMAIL_CONFIG.successTimeout);

    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus({
        loading: false,
        success: false,
        error: error instanceof Error ? error.message : 'Gagal mengirim email. Silakan coba lagi.'
      });
    }
  };

  return {
    emailStatus,
    sendEmail
  };
}