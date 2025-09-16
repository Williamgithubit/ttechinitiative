'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiUsers, FiCalendar, FiSettings, FiLogOut, FiBook, FiUser, FiMessageSquare, FiAward, FiEdit3, FiImage, FiChevronDown, FiChevronRight, FiBookOpen } from 'react-icons/fi';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, selectCurrentUser } from '@/store/Auth/authSlice';
import toast from 'react-hot-toast';
import { useState } from 'react';

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [isContentManagementOpen, setIsContentManagementOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
      toast.success('Successfully logged out!', {
        duration: 2000,
        position: 'top-right',
      });
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out. Please try again.', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const isActive = (path: string) => {
    return pathname === path ? 'bg-gray-100 text-[#000054]' : 'text-gray-600 hover:bg-gray-50';
  };

  const isContentManagementActive = () => {
    return pathname.includes('/dashboard/admin/blog') || pathname.includes('/dashboard/admin/media');
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-[#000054]">T-Tech Initiative</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <Link
              href="/dashboard"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive('/dashboard')}`}
            >
              <FiHome className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            
            {user?.role === 'admin' && (
              <Link
                href="/dashboard/users"
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive('/dashboard/users')}`}
              >
                <FiUsers className="mr-3 h-5 w-5" />
                User Management
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link
                href="/dashboard/admin/subjects-classes"
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive('/dashboard/admin/subjects-classes')}`}
              >
                <FiBookOpen className="mr-3 h-5 w-5" />
                Subjects & Classes
              </Link>
            )}
            
            <Link
              href="/dashboard/programs"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive('/dashboard/programs')}`}
            >
              <FiBook className="mr-3 h-5 w-5" />
              Programs
            </Link>

            {/* Content Management Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsContentManagementOpen(!isContentManagementOpen)}
                className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isContentManagementActive() ? 'bg-gray-100 text-[#000054]' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiEdit3 className="mr-3 h-5 w-5" />
                Content Management
                {isContentManagementOpen ? (
                  <FiChevronDown className="ml-auto h-4 w-4" />
                ) : (
                  <FiChevronRight className="ml-auto h-4 w-4" />
                )}
              </button>
              
              {isContentManagementOpen && (
                <div className="ml-6 space-y-1">
                  <Link
                    href="/dashboard/admin/blog"
                    className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/dashboard/admin/blog')}`}
                  >
                    <FiEdit3 className="mr-3 h-4 w-4" />
                    Blog Management
                  </Link>
                  <Link
                    href="/dashboard/admin/media"
                    className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/dashboard/admin/media')}`}
                  >
                    <FiImage className="mr-3 h-4 w-4" />
                    Media Library
                  </Link>
                </div>
              )}
            </div>
            
            <Link
              href="/dashboard/events"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive('/dashboard/events')}`}
            >
              <FiCalendar className="mr-3 h-5 w-5" />
              Events
            </Link>
            
            <Link
              href="/dashboard/messages"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive('/dashboard/messages')}`}
            >
              <FiMessageSquare className="mr-3 h-5 w-5" />
              Messages
            </Link>
            
            <Link
              href="/dashboard/profile"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive('/dashboard/profile')}`}
            >
              <FiUser className="mr-3 h-5 w-5" />
              Profile
            </Link>
            
            <Link
              href="/dashboard/settings"
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${isActive('/dashboard/settings')}`}
            >
              <FiSettings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>
        </div>
        
        {/* User Profile & Sign Out */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#000054] hover:bg-[#1a1a6e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#000054]"
          >
            <FiLogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
