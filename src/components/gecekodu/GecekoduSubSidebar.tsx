"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDaysIcon, UsersIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

const gecekoduNavItems = [
  { href: '/gecekodu/events', label: 'Etkinlik Yönetimi', icon: CalendarDaysIcon },
  { href: '/gecekodu/staff', label: 'Ekip Yönetimi', icon: UsersIcon },
  { href: '/gecekodu/announcements', label: 'Duyuru Yönetimi', icon: MegaphoneIcon },
];

const GecekoduSubSidebar = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <div className="w-60 h-full bg-gray-100 dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">GeceKodu Menüsü</h2>
      <nav className="space-y-1">
        {gecekoduNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-primary text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default GecekoduSubSidebar;
