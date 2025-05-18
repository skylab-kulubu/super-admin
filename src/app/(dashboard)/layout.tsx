import React from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto ml-64"> {/* Add ml-64 to offset fixed sidebar */}
        {children}
      </main>
    </div>
  );
}
