import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-utils';
import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    await requireAdmin(request);

    // List all users from Firebase Auth
    const listUsersResult = await adminAuth.listUsers(1000); // Adjust the batch size as needed
    const users = listUsersResult.users.map(user => ({
      id: user.uid,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'User',
      role: user.customClaims?.role || 'user',
      status: user.disabled ? 'inactive' : 'active',
      lastLogin: user.metadata.lastSignInTime || null,
      createdAt: user.metadata.creationTime,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL || null,
    }));

    return NextResponse.json(users);
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
