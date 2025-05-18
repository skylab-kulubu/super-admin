"use client"; 

import React from 'react';
// GecekoduSubSidebar import is removed.

export default function GecekoduLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The main DashboardLayout (src/app/(dashboard)/layout.tsx) already provides
  // the overall page structure, including sidebar margin and content padding.
  // This layout can be minimal.
  return (
    <div className="h-full"> {/* Ensures children can take full height if needed */}
      {children}
    </div>
  );
}
