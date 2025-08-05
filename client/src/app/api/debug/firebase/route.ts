import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Firebase Admin SDK...');
    
    // Test Firebase Admin SDK without authentication
    const listUsersResult = await adminAuth.listUsers(5); // Limit to 5 users for testing
    
    console.log('Firebase Admin SDK working! Found users:', listUsersResult.users.length);
    
    // Format users for the frontend
    const formattedUsers = listUsersResult.users.map(user => ({
      id: user.uid,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'User',
      role: user.customClaims?.role || 'user',
      status: user.disabled ? 'disabled' : 'active',
      lastLogin: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null,
      createdAt: new Date(user.metadata.creationTime),
      emailVerified: user.emailVerified,
      photoURL: user.photoURL || null,
    }));

    return NextResponse.json({
      message: 'Firebase Admin SDK test successful',
      userCount: listUsersResult.users.length,
      users: formattedUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Firebase Admin SDK test error:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Firebase Admin SDK test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
