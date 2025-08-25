import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  deleteDoc,
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { uploadStudentImageClient, deleteStudentImageFromCloudinary } from './cloudinaryService';

export interface FirebaseCertificate {
  certificateNumber: string; // Used as document ID
  fullName: string;
  program: string;
  yearOfCompletion: number;
  status: 'Valid' | 'Invalid';
  studentImageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CertificateFormData {
  fullName: string;
  certificateNumber: string;
  program: string;
  yearOfCompletion: number;
  status: 'Valid' | 'Invalid';
  studentImage?: File;
}

/**
 * Upload student image to Cloudinary
 * @param file - Image file to upload
 * @param certificateNumber - Certificate number for unique file naming
 * @returns Promise<string> - Cloudinary URL of uploaded image
 */
export async function uploadStudentImage(file: File, certificateNumber: string): Promise<string> {
  try {
    return await uploadStudentImageClient(file, certificateNumber);
  } catch (error) {
    console.error('Error uploading student image:', error);
    throw new Error('Failed to upload student image');
  }
}

/**
 * Delete student image from Cloudinary
 * @param certificateNumber - Certificate number to identify the image
 * @returns Promise<void>
 */
export async function deleteStudentImage(certificateNumber: string): Promise<void> {
  try {
    await deleteStudentImageFromCloudinary(certificateNumber);
  } catch (error) {
    console.error('Error deleting student image:', error);
    // Don't throw error for deletion failures
  }
}

/**
 * Check if certificate number already exists
 * @param certificateNumber - Certificate number to check
 * @returns Promise<boolean> - True if exists, false otherwise
 */
export async function checkCertificateExists(certificateNumber: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'certificates', certificateNumber);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking certificate existence:', error);
    throw new Error('Failed to check certificate existence');
  }
}

/**
 * Add new certificate to Firestore
 * @param certificateData - Certificate data to add
 * @returns Promise<FirebaseCertificate> - Created certificate
 */
export async function addCertificate(certificateData: CertificateFormData): Promise<FirebaseCertificate> {
  try {
    // Check if certificate number already exists
    const exists = await checkCertificateExists(certificateData.certificateNumber);
    if (exists) {
      throw new Error('Certificate number already exists');
    }

    let studentImageUrl = '';

    // Upload student image if provided
    if (certificateData.studentImage) {
      try {
        studentImageUrl = await uploadStudentImage(
          certificateData.studentImage, 
          certificateData.certificateNumber
        );
      } catch (error) {
        console.warn('Failed to upload image, proceeding without image:', error);
        // Continue without image - don't throw error
      }
    }

    // Create certificate document
    const certificate: Omit<FirebaseCertificate, 'createdAt' | 'updatedAt'> = {
      certificateNumber: certificateData.certificateNumber,
      fullName: certificateData.fullName,
      program: certificateData.program,
      yearOfCompletion: certificateData.yearOfCompletion,
      status: certificateData.status,
      studentImageUrl
    };

    // Use certificate number as document ID
    const docRef = doc(db, 'certificates', certificateData.certificateNumber);
    
    // Add timestamps and save to Firestore
    await setDoc(docRef, {
      ...certificate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Return the created certificate with current timestamp
    return {
      ...certificate,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

  } catch (error) {
    console.error('Error adding certificate:', error);
    
    // Clean up uploaded image if certificate creation failed
    if (certificateData.studentImage) {
      try {
        const imageUrl = await uploadStudentImage(
          certificateData.studentImage, 
          certificateData.certificateNumber
        );
        await deleteStudentImage(imageUrl);
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded image:', cleanupError);
      }
    }
    
    throw error;
  }
}

/**
 * Get all certificates from Firestore
 * @returns Promise<FirebaseCertificate[]> - Array of all certificates
 */
export async function getAllCertificates(): Promise<FirebaseCertificate[]> {
  try {
    const certificatesRef = collection(db, 'certificates');
    const q = query(certificatesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const certificates: FirebaseCertificate[] = [];
    querySnapshot.forEach((doc) => {
      certificates.push(doc.data() as FirebaseCertificate);
    });
    
    return certificates;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw new Error('Failed to fetch certificates');
  }
}

/**
 * Get certificate by certificate number
 * @param certificateNumber - Certificate number to fetch
 * @returns Promise<FirebaseCertificate | null> - Certificate data or null if not found
 */
export async function getCertificate(certificateNumber: string): Promise<FirebaseCertificate | null> {
  try {
    const docRef = doc(db, 'certificates', certificateNumber);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as FirebaseCertificate;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw new Error('Failed to fetch certificate');
  }
}

/**
 * Update certificate status
 * @param certificateNumber - Certificate number to update
 * @param status - New status
 * @returns Promise<void>
 */
export async function updateCertificateStatus(
  certificateNumber: string, 
  status: 'Valid' | 'Invalid'
): Promise<void> {
  try {
    const docRef = doc(db, 'certificates', certificateNumber);
    await setDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating certificate status:', error);
    throw new Error('Failed to update certificate status');
  }
}

/**
 * Update entire certificate
 * @param originalCertificateNumber - Original certificate number (document ID)
 * @param updatedData - Updated certificate data
 * @returns Promise<FirebaseCertificate>
 */
export async function updateCertificate(
  originalCertificateNumber: string,
  updatedData: CertificateFormData
): Promise<FirebaseCertificate> {
  try {
    const originalDocRef = doc(db, 'certificates', originalCertificateNumber);
    
    // If certificate number changed, we need to create new document and delete old one
    if (originalCertificateNumber !== updatedData.certificateNumber) {
      // Check if new certificate number already exists
      const exists = await checkCertificateExists(updatedData.certificateNumber);
      if (exists) {
        throw new Error('Certificate number already exists');
      }
      
      // Get original document data
      const originalDoc = await getDoc(originalDocRef);
      if (!originalDoc.exists()) {
        throw new Error('Original certificate not found');
      }
      
      const originalData = originalDoc.data() as FirebaseCertificate;
      
      // Handle image update
      let studentImageUrl = originalData.studentImageUrl || '';
      
      if (updatedData.studentImage) {
        // Delete old image if it exists
        if (originalData.studentImageUrl) {
          await deleteStudentImage(originalData.studentImageUrl);
        }
        // Upload new image
        studentImageUrl = await uploadStudentImage(
          updatedData.studentImage,
          updatedData.certificateNumber
        );
      }
      
      // Create new document
      const newDocRef = doc(db, 'certificates', updatedData.certificateNumber);
      const newCertificate = {
        certificateNumber: updatedData.certificateNumber,
        fullName: updatedData.fullName,
        program: updatedData.program,
        yearOfCompletion: updatedData.yearOfCompletion,
        status: updatedData.status,
        studentImageUrl,
        createdAt: originalData.createdAt,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(newDocRef, newCertificate);
      
      // Delete original document
      await deleteDoc(originalDocRef);
      
      return {
        ...newCertificate,
        updatedAt: Timestamp.now()
      } as FirebaseCertificate;
    } else {
      // Same certificate number, just update existing document
      let studentImageUrl = '';
      
      // Get current data to preserve existing image if no new image provided
      const currentDoc = await getDoc(originalDocRef);
      if (currentDoc.exists()) {
        const currentData = currentDoc.data() as FirebaseCertificate;
        studentImageUrl = currentData.studentImageUrl || '';
        
        // Handle image update
        if (updatedData.studentImage) {
          // Delete old image if it exists
          if (currentData.studentImageUrl) {
            await deleteStudentImage(originalCertificateNumber);
          }
          // Upload new image
          studentImageUrl = await uploadStudentImage(
            updatedData.studentImage,
            updatedData.certificateNumber
          );
        }
      }
      
      const updatedCertificate = {
        fullName: updatedData.fullName,
        program: updatedData.program,
        yearOfCompletion: updatedData.yearOfCompletion,
        status: updatedData.status,
        studentImageUrl,
        updatedAt: serverTimestamp()
      };
      
      await setDoc(originalDocRef, updatedCertificate, { merge: true });
      
      return {
        certificateNumber: originalCertificateNumber,
        ...updatedCertificate,
        updatedAt: Timestamp.now()
      } as FirebaseCertificate;
    }
  } catch (error) {
    console.error('Error updating certificate:', error);
    throw error;
  }
}

/**
 * Delete certificate
 * @param certificateNumber - Certificate number to delete
 * @returns Promise<void>
 */
export async function deleteCertificate(certificateNumber: string): Promise<void> {
  try {
    const docRef = doc(db, 'certificates', certificateNumber);
    
    // Get certificate data to delete associated image
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const certificateData = docSnap.data() as FirebaseCertificate;
      
      // Delete associated image if it exists
      if (certificateData.studentImageUrl) {
        await deleteStudentImage(certificateNumber);
      }
    }
    
    // Delete the document
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw new Error('Failed to delete certificate');
  }
}
