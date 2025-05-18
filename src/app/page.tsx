"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootRedirectPage() {
  const router = useRouter();
  const { token, user, loading, getRedirectPath } = useAuth();

  useEffect(() => {
    if (loading) {
      // Still waiting for auth context to determine user/token status
      return;
    }

    if (token && user) {
      // User is authenticated, redirect them to their appropriate dashboard page
      const path = getRedirectPath(); // getRedirectPath uses user.roles from context
      router.replace(path || '/'); // if getRedirectPath returns null/undefined, default to '/'
    } else {
      // User is not authenticated, redirect to login
      router.replace('/login');
    }
  }, [loading, token, user, router, getRedirectPath]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="text-lg text-gray-700 dark:text-gray-200">Yönlendiriliyor...</p>
    </div>
  );
}
