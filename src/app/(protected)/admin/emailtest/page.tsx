// src/app/(protected)/admin/emailtest/page.tsx
/**
 * Admin page for testing email functionality
 * Provides a simple interface to send test emails
 */

"use client";
import { useState } from 'react';

export default function EmailTestPage() {
  const [status, setStatus] = useState<{
    loading: boolean;
    message?: string;
    error?: string;
  }>({ loading: false });

  const testRecipient = process.env.NEXT_PUBLIC_TEST_EMAIL_RECIPIENT;

  /**
   * Handles the test email sending process
   */
  const handleTestEmail = async () => {
    if (!testRecipient) {
      setStatus({
        loading: false,
        error: 'Test recipient email not configured. Please check your environment variables.',
      });
      return;
    }

    setStatus({ loading: true });
    
    try {
      // Call the API route
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testRecipient,
          subject: 'Test Email from Admin Panel',
          text: 'This is a test email sent from the admin panel.',
          html: `
            <h1>Test Email</h1>
            <p>This is a test email sent from the admin panel.</p>
            <p>If you are receiving this email, your email configuration is working correctly.</p>
            <p>Sent at: ${new Date().toLocaleString()}</p>
          `,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || 'Failed to send test email');
      }

      const data = await res.json();

      setStatus({
        loading: false,
        message: `Test email sent successfully! Message ID: ${data.messageId}`,
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to send test email',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Email Configuration Test</h1>
        
        {/* Status Messages */}
        {status.message && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
            {status.message}
          </div>
        )}
        
        {status.error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded">
            Error: {status.error}
          </div>
        )}

        {/* Test Email Button */}
        <div className="space-y-4">
          <p className="text-gray-600">
            Click the button below to send a test email to{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {testRecipient || 'Not configured'}
            </code>
          </p>
          
          <button
            onClick={handleTestEmail}
            disabled={status.loading || !testRecipient}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status.loading ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>

        {/* Email Configuration Info */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Email Configuration</h2>
          <div className="space-y-2">
            <p>
              <strong>Contact Email:</strong>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'Not configured'}
              </code>
            </p>
            <p>
              <strong>Test Recipient:</strong>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">
                {testRecipient || 'Not configured'}
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
