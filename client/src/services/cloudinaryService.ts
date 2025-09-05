/**
 * Delete student image from Cloudinary via API
 * @param certificateNumber - Certificate number to identify the image
 * @returns Promise<void>
 */
export async function deleteStudentImageFromCloudinary(
  certificateNumber: string
): Promise<void> {
  try {
    const response = await fetch('/api/delete-image', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ certificateNumber }),
    });

    if (!response.ok) {
      console.warn('Failed to delete image from Cloudinary');
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    // Don't throw error for deletion failures
  }
}

/**
 * Client-side image upload using Next.js API route
 * @param file - Image file to upload
 * @param certificateNumber - Certificate number for unique file naming
 * @returns Promise<string> - Cloudinary URL of uploaded image
 */
export async function uploadStudentImageClient(
  file: File,
  certificateNumber: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('certificateNumber', certificateNumber);

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to upload image');
    }
    
    return data.url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Upload admission application image to Cloudinary
 * @param file - Image file to upload
 * @param applicantId - Applicant ID for unique file naming
 * @returns Promise<string> - Cloudinary URL of uploaded image
 */
export async function uploadAdmissionImage(
  file: File,
  applicantId: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicantId', applicantId);
    formData.append('uploadType', 'admission-image');

    const response = await fetch('/api/upload-admission-file', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload admission image');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to upload admission image');
    }
    
    return data.url;
  } catch (error) {
    console.error('Error uploading admission image to Cloudinary:', error);
    throw new Error('Failed to upload admission image to Cloudinary');
  }
}

/**
 * Upload community recommendation file to Cloudinary
 * @param file - File to upload (PDF, DOC, etc.)
 * @param applicantId - Applicant ID for unique file naming
 * @returns Promise<string> - Cloudinary URL of uploaded file
 */
export async function uploadCommunityRecommendation(
  file: File,
  applicantId: string
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicantId', applicantId);
    formData.append('uploadType', 'recommendation');

    const response = await fetch('/api/upload-admission-file', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload community recommendation');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to upload community recommendation');
    }
    
    return data.url;
  } catch (error) {
    console.error('Error uploading community recommendation to Cloudinary:', error);
    throw new Error('Failed to upload community recommendation to Cloudinary');
  }
}

/**
 * Delete admission file from Cloudinary
 * @param applicantId - Applicant ID
 * @param fileType - Type of file ('image' | 'recommendation')
 * @returns Promise<void>
 */
export async function deleteAdmissionFileFromCloudinary(
  applicantId: string,
  fileType: 'image' | 'recommendation'
): Promise<void> {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch('/api/delete-admission-file', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ applicantId, fileType }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle different response statuses
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log(`Successfully deleted ${fileType} for applicant ${applicantId}`);
        return;
      }
    }

    // Handle specific error cases
    if (response.status === 408) {
      console.warn(`Timeout deleting ${fileType} for applicant ${applicantId}`);
      return; // Don't throw for timeouts
    }

    if (response.status === 404) {
      console.log(`${fileType} for applicant ${applicantId} was already deleted or doesn't exist`);
      return; // File not found is success for deletion
    }

    if (response.status >= 500) {
      console.warn(`Server error deleting ${fileType} for applicant ${applicantId}:`, response.status);
      return; // Don't throw for server errors
    }

    // For other errors, log but don't throw
    console.warn(`Failed to delete ${fileType} for applicant ${applicantId}:`, response.status);

  } catch (error) {
    // Handle network errors and aborted requests
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`Request timeout deleting ${fileType} for applicant ${applicantId}`);
        return; // Don't throw for timeouts
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        console.warn(`Network error deleting ${fileType} for applicant ${applicantId}:`, error.message);
        return; // Don't throw for network errors
      }
    }
    
    console.error(`Error deleting ${fileType} for applicant ${applicantId}:`, error);
    // Don't throw error for deletion failures - this prevents blocking the main deletion operation
  }
}
