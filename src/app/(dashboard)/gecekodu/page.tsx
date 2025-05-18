"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function GecekoduRootPage() {
  const router = useRouter();
  const { loading, hasRole } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (hasRole("ROLE_GECEKODU_ADMIN") || hasRole("ROLE_ADMIN")) {
        router.replace('/gecekodu/events'); 
      } else {
        router.replace('/403'); 
      }
    }
  }, [loading, hasRole, router]);

  return (
    <div className="flex justify-center items-center h-full"> {/* No p-6, handled by main dashboard layout */}
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="ml-4 text-lg text-gray-700 dark:text-gray-200">GeceKodu bölümü yükleniyor...</p>
    </div>
  );
}
