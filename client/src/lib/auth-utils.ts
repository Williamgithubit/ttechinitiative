import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
import { authOptions } from './auth';

export const requireAuth = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session;
};

export const requireAdmin = async (req: NextRequest) => {
  const session = await requireAuth(req);
  
  if (session.user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  
  return session;
};
