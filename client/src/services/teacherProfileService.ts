import { 
  collection, 
  doc, 
  updateDoc, 
  getDoc, 
  setDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '@/services/firebase';

export interface TeacherProfile {
  displayName: string;
  email: string;
  phone: string;
  department: string;
  subjects: string[];
  bio: string;
  officeHours: string;
  officeLocation: string;
  yearsExperience: number;
  education: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateTeacherProfileData {
  displayName?: string;
  phone?: string;
  department?: string;
  subjects?: string[];
  bio?: string;
  officeHours?: string;
  officeLocation?: string;
  yearsExperience?: number;
  education?: string;
  photoURL?: string;
}

export class TeacherProfileService {
  private static readonly PROFILES_COLLECTION = 'teacherProfiles';

  /**
   * Get teacher profile by user ID
   */
  static async getProfile(userId: string): Promise<TeacherProfile | null> {
    try {
      const docRef = doc(db, this.PROFILES_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as TeacherProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting teacher profile:', error);
      throw new Error('Failed to fetch profile');
    }
  }

  /**
   * Create or update teacher profile
   */
  static async updateProfile(userId: string, profileData: UpdateTeacherProfileData): Promise<void> {
    try {
      const docRef = doc(db, this.PROFILES_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      const updateData = {
        ...profileData,
        updatedAt: new Date()
      };

      if (docSnap.exists()) {
        // Update existing profile
        await updateDoc(docRef, updateData);
      } else {
        // Create new profile
        await setDoc(docRef, {
          ...updateData,
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating teacher profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Upload profile photo
   */
  static async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    try {
      // Delete existing photo if it exists
      await this.deleteProfilePhoto(userId);
      
      // Upload new photo
      const photoRef = ref(storage, `teacherProfiles/${userId}/profile-photo`);
      const snapshot = await uploadBytes(photoRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update profile with new photo URL
      await this.updateProfile(userId, { photoURL: downloadURL });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw new Error('Failed to upload profile photo');
    }
  }

  /**
   * Delete profile photo
   */
  static async deleteProfilePhoto(userId: string): Promise<void> {
    try {
      const photoRef = ref(storage, `teacherProfiles/${userId}/profile-photo`);
      await deleteObject(photoRef);
      
      // Update profile to remove photo URL
      await this.updateProfile(userId, { photoURL: '' });
    } catch (error) {
      // Ignore error if file doesn't exist
      if (error instanceof Error && !error.message.includes('object-not-found')) {
        console.error('Error deleting profile photo:', error);
      }
    }
  }

  /**
   * Initialize profile with default values from user auth data
   */
  static async initializeProfile(userId: string, userData: { displayName?: string; email?: string }): Promise<TeacherProfile> {
    const defaultProfile: TeacherProfile = {
      displayName: userData.displayName || '',
      email: userData.email || '',
      phone: '',
      department: '',
      subjects: [],
      bio: '',
      officeHours: '',
      officeLocation: '',
      yearsExperience: 0,
      education: '',
      photoURL: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, this.PROFILES_COLLECTION, userId), defaultProfile);
    return defaultProfile;
  }
}
