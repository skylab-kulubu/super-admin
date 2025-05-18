"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AgcRootPage() {
  const router = useRouter();
  const { loading, hasRole } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN")) {
        router.replace('/agc/events'); 
      } else {
        router.replace('/403'); 
      }
    }
  }, [loading, hasRole, router]);

  return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="ml-4 text-lg text-gray-700 dark:text-gray-200">AGC bölümü yükleniyor...</p>
    </div>
  );
}
