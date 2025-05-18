"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext'; // For role check if needed

export default function BizBizeRootPage() {
  const router = useRouter();
  const { loading, hasRole } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Optional: Add role check if this page should be protected differently
      // than the sub-pages, though the parent layout already handles general access.
      if (hasRole("ROLE_BIZBIZE_ADMIN") || hasRole("ROLE_ADMIN")) {
        router.replace('/bizbize/events'); // Default to events page
      } else {
        router.replace('/403'); // Fallback if somehow accessed without role
      }
    }
  }, [loading, hasRole, router]);

  // Display a loading state or minimal content while redirecting
  return (
    <div className="p-6 flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="ml-4 text-lg text-gray-700 dark:text-gray-200">BizBize bölümü yükleniyor...</p>
    </div>
  );
}
