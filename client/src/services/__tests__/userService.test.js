import { vi, describe, it, expect, beforeAll, afterEach } from 'vitest';
import { 
  getUserRole, 
  updateUserRole, 
  getUserProfile, 
  updateUserProfile 
} from '../userService';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Mock Firebase Firestore
vi.mock('firebase/firestore');
vi.mock('../firebase', () => ({
  db: {}
}));

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: () => 'MOCK_TIMESTAMP'
}));

describe('User Service', () => {
  const mockUserId = 'test-user-123';
  const mockUserData = {
    id: mockUserId,
    email: 'test@example.com',
    role: 'student',
    displayName: 'Test User',
    createdAt: '2023-01-01T00:00:00Z'
  };

  beforeAll(() => {
    // Set up any test fixtures here
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe('getUserRole', () => {
    it('should return the user role when user exists', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ role: 'admin' })
      });

      const role = await getUserRole(mockUserId);
      expect(role).toBe('admin');
      expect(getDoc).toHaveBeenCalledWith(doc(db, 'users', mockUserId));
    });

    it('should create and return default role when user does not exist', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      const role = await getUserRole(mockUserId);
      expect(role).toBe('student');
      expect(setDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          role: 'student',
          createdAt: 'MOCK_TIMESTAMP',
          updatedAt: 'MOCK_TIMESTAMP'
        }
      );
    });
  });

  describe('updateUserRole', () => {
    it('should update the user role', async () => {
      await updateUserRole(mockUserId, 'teacher');
      
      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          role: 'teacher',
          updatedAt: 'MOCK_TIMESTAMP'
        }
      );
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile data', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => true,
        id: mockUserId,
        data: () => ({
          email: 'test@example.com',
          displayName: 'Test User'
        })
      });

      const profile = await getUserProfile(mockUserId);
      expect(profile).toEqual({
        id: mockUserId,
        email: 'test@example.com',
        displayName: 'Test User'
      });
    });

    it('should return null when user does not exist', async () => {
      getDoc.mockResolvedValueOnce({
        exists: () => false
      });

      const profile = await getUserProfile('non-existent-user');
      expect(profile).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile data', async () => {
      const updates = {
        displayName: 'Updated Name',
        photoURL: 'https://example.com/photo.jpg'
      };

      await updateUserProfile(mockUserId, updates);
      
      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', mockUserId),
        {
          ...updates,
          updatedAt: 'MOCK_TIMESTAMP'
        }
      );
    });
  });
});
