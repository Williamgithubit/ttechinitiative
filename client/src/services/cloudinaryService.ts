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
