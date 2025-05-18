"use client"; // Add this line

import React from 'react';
import BizbizeSubSidebar from '@/components/bizbize/BizbizeSubSidebar';

export default function BizbizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full"> {/* Ensure this layout takes full height of its container */}
      <div className="flex-1 p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
