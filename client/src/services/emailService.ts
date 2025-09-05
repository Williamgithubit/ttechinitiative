/**
 * Email service for sending admission notifications
 */

export interface AdmissionEmailData {
  applicantName: string;
  applicantEmail: string;
  applicantId: string;
  program: string;
}

/**
 * Send admission ID notification email to applicant
 * @param emailData - Email data containing applicant information
 * @returns Promise<boolean> - Success status
 */
export async function sendAdmissionIdEmail(emailData: AdmissionEmailData): Promise<boolean> {
  try {
    const response = await fetch('/api/send-admission-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`Email service error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error sending admission email:', error);
    return false;
  }
}
