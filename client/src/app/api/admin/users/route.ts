import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Configure runtime to use Node.js instead of Edge (required for Firebase Admin SDK)
export const runtime = 'nodejs';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    // Parse the service account key from environment variable
    const serviceAccountKey = process.env.NEXT_PUBLIC_FIREBASE_ADMIN_SDK_KEY;
    if (!serviceAccountKey) {
      throw new Error('Firebase Admin SDK key not found in environment variables');
    }
    
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

const db = getFirestore();
const adminAuth = getAuth();

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and check admin role
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (!decodedToken.admin && decodedToken.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    } catch (authError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get all users from Firebase Auth
    const listUsersResult = await adminAuth.listUsers(1000); // Get up to 1000 users
    
    // Get additional user data from Firestore
    const usersCollection = db.collection('users');
    const firestoreUsers = await usersCollection.get();
    
    // Create a map of Firestore user data
    const firestoreUserMap = new Map();
    firestoreUsers.forEach(doc => {
      firestoreUserMap.set(doc.id, doc.data());
    });

    // Format users for the frontend
    const formattedUsers = listUsersResult.users.map(user => {
      const firestoreData = firestoreUserMap.get(user.uid) || {};
      
      return {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || firestoreData.displayName || user.email?.split('@')[0] || 'User',
        role: user.customClaims?.role || firestoreData.role || 'user',
        status: firestoreData.status || (user.disabled ? 'inactive' : 'active'),
        lastLogin: firestoreData.lastLogin || null,
        createdAt: user.metadata.creationTime,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL || firestoreData.photoURL || null,
      };
    });

    // Sort by creation date (newest first)
    formattedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const statusCode = errorMessage === 'Unauthorized' ? 401 : errorMessage === 'Forbidden' ? 403 : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and check admin role
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      if (!decodedToken.admin && decodedToken.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    } catch (authError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const userData = await request.json();
    const { email, password, name, role, status } = userData;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: true,
    });

    // Set custom claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role,
      admin: role === 'admin'
    });

    // Add user to Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName: name,
      role,
      status: status || 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null,
    });

    return NextResponse.json({
      id: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName,
      role,
      status: status || 'active',
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    let statusCode = 500;
    
    // Map specific Firebase error codes
    if (errorMessage.includes('email-already-exists')) {
      statusCode = 409;
    } else if (errorMessage.includes('invalid-email')) {
      statusCode = 400;
    } else if (errorMessage.includes('weak-password')) {
      statusCode = 400;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
