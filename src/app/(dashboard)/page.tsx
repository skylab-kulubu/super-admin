"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardRootPage() {
  const router = useRouter();
  const { user, loading, hasRole } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // This case should ideally be handled by a layout protecting routes,
        // but as a fallback, redirect to login.
        router.replace('/login');
      } else if (hasRole("ROLE_ADMIN")) {
        // If there's a specific /superadmin page, redirect there.
        // For now, this page can serve as the superadmin's root dashboard.
        // Example: router.replace('/superadmin'); if /superadmin/page.tsx exists
        // If not, this page itself is the superadmin dashboard.
      } else if (hasRole("ROLE_BIZBIZE_ADMIN")) {
        router.replace('/bizbize');
      } else if (hasRole("ROLE_GECEKODU_ADMIN")) {
        router.replace('/gecekodu');
      } else if (hasRole("ROLE_AGC_ADMIN")) {
        router.replace('/agc');
      } else {
        // If user has no specific admin/tenant roles, redirect to an error page.
        router.replace('/403');
      }
    }
  }, [user, loading, hasRole, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        <p className="ml-4 text-lg text-gray-700 dark:text-gray-200">Yükleniyor...</p>
      </div>
    );
  }

  // Display content for ROLE_ADMIN if not redirecting them elsewhere
  if (hasRole("ROLE_ADMIN")) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">Ana Sayfa</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Yönetim paneline hoş geldiniz. Soldaki menüyü kullanarak ilgili bölümlere ulaşabilirsiniz.
        </p>
        {/* 
          You can add specific dashboard widgets or summaries for ROLE_ADMIN here.
          For example, quick stats, links to common tasks, etc.
        */}
      </div>
    );
  }

  // Fallback content while redirection is in progress for other roles
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="ml-4 text-lg text-gray-700 dark:text-gray-200">Yönlendiriliyorsunuz...</p>
    </div>
  );
}
