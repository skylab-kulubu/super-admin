"use client"; 

import React from 'react';

export default function AgcLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full"> {/* Ensures children can take full height if needed */}
      {children}
    </div>
  );
}
