import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUD_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUD_API_SECRET,
});

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

export async function DELETE(request: NextRequest) {
  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
    });

    const requestPromise = async () => {
      const { applicantId, fileType } = await request.json();

      if (!applicantId || !fileType) {
        return NextResponse.json(
          { error: 'Applicant ID and file type are required' },
          { status: 400 }
        );
      }

      // Determine public_id based on file type
      let publicId: string;
      if (fileType === 'image') {
        publicId = `admission-applications/images/admission-image-${applicantId}`;
      } else if (fileType === 'recommendation') {
        publicId = `admission-applications/recommendations/recommendation-${applicantId}`;
      } else {
        return NextResponse.json(
          { error: 'Invalid file type' },
          { status: 400 }
        );
      }

      // Delete from Cloudinary with retry logic
      const result = await retryWithBackoff(
        () => cloudinary.uploader.destroy(publicId),
        2, // Max 2 retries
        500 // Start with 500ms delay
      );

      return NextResponse.json({
        success: true,
        result,
        message: 'File deleted successfully'
      });
    };

    // Race between the actual request and timeout
    return await Promise.race([requestPromise(), timeoutPromise]) as NextResponse;

  } catch (error) {
    console.error('Error deleting admission file from Cloudinary:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message === 'Request timeout') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 408 }
        );
      }
      
      if (error.message.includes('not found')) {
        // File not found is actually a success case for deletion
        return NextResponse.json({
          success: true,
          message: 'File was already deleted or does not exist'
        });
      }
      
      if (error.message.includes('network') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Network error. Please check your connection and try again.' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
