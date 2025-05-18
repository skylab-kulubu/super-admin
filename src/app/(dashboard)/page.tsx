"use client";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter }  from "next/navigation";

export default function DashboardHomePage() {
  const { user, loading, getRedirectPath, hasRole } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user) {
      if (hasRole("ROLE_ADMIN")) {
        router.replace("/superadmin"); // Redirect ROLE_ADMIN to their dedicated page
      } else {
        // For non-admin users, redirect if they land on "/" and have a specific team path
        const path = getRedirectPath(); 
        if (path && path !== "/" && path !== "/login" && path !== "/superadmin") { 
          router.replace(path);
        }
      }
    }
  }, [user, loading, router, getRedirectPath, hasRole]);


  if (loading || (user && hasRole("ROLE_ADMIN"))) { // Show loader if loading or if admin (will be redirected)
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
      </div>
    );
  }
  
  // This content will be shown to non-admin users who don't have a specific team redirect
  // or if redirection hasn't happened yet.
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
        Yönetim Paneline Hoş Geldiniz!
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Sol taraftaki menüden size atanmış bölümlere geçiş yapabilirsiniz.
      </p>
      {/* This page can be a generic welcome or info page for users who land here */}
    </div>
  );
}
