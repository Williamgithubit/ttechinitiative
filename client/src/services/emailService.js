import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

/**
 * Send an email using Firebase Cloud Functions
 * @param {Object} emailData - Email data
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.text - Plain text email content
 * @param {string} [emailData.html] - HTML email content (optional)
 * @returns {Promise<Object>} Result of the email sending operation
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const sendEmailFunction = httpsCallable(functions, 'sendEmail');
    const result = await sendEmailFunction({
      to,
      subject,
      text,
      html,
    });
    return result.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send a password reset email
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Result of the operation
 */
export const sendPasswordResetEmail = async (email) => {
  try {
    const sendResetEmailFunction = httpsCallable(functions, 'sendPasswordResetEmail');
    const result = await sendResetEmailFunction({ email });
    return result.data;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};
