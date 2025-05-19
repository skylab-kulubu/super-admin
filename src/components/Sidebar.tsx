"use client";

import React, { useState, useEffect } from "react"; // useEffect was already there
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { HomeIcon, ArrowLeftOnRectangleIcon, UserGroupIcon, ShieldCheckIcon, ChevronDownIcon, ChevronRightIcon, CalendarDaysIcon, UsersIcon as StaffIcon, MegaphoneIcon as AnnouncementIcon, CodeBracketSquareIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

interface NavSubItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavItem {
  href?: string;
  label: string;
  icon: React.ElementType;
  roles?: string[]; 
  adminOnly?: boolean;
  subItems?: NavSubItem[];
  id: string;
}

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();
  const isSuperAdmin = user?.roles?.includes("ROLE_ADMIN") || false;
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const navItems: NavItem[] = [
    { id: "home", href: isSuperAdmin ? "/superadmin" : "/", label: "Ana Sayfa", icon: HomeIcon },
    { 
      id: "bizbize",
      label: "BizBize Yönetimi", 
      icon: UserGroupIcon, 
      roles: ["ROLE_BIZBIZE_ADMIN"],
      subItems: [
        { href: "/bizbize/events", label: "Etkinlik Yönetimi", icon: CalendarDaysIcon },
        { href: "/bizbize/staff", label: "Ekip Yönetimi", icon: StaffIcon },
        { href: "/bizbize/announcements", label: "Duyuru Yönetimi", icon: AnnouncementIcon },
      ]
    },
    { 
      id: "gecekodu",
      label: "GeceKodu Yönetimi", 
      icon: CodeBracketSquareIcon, // Using a different icon for GeceKodu
      roles: ["ROLE_GECEKODU_ADMIN"],
      subItems: [
        { href: "/gecekodu/events", label: "Etkinlik Yönetimi", icon: CalendarDaysIcon },
        { href: "/gecekodu/staff", label: "Ekip Yönetimi", icon: StaffIcon },
        { href: "/gecekodu/announcements", label: "Duyuru Yönetimi", icon: AnnouncementIcon },
      ]
    },
    { 
      id: "agc", 
      label: "AGC Yönetimi", 
      icon: UserGroupIcon, // Or a different icon for AGC if desired
      roles: ["ROLE_AGC_ADMIN"],
      subItems: [
        { href: "/agc/events", label: "Etkinlik Yönetimi", icon: CalendarDaysIcon },
        { href: "/agc/staff", label: "Ekip Yönetimi", icon: StaffIcon },
        { href: "/agc/announcements", label: "Duyuru Yönetimi", icon: AnnouncementIcon },
        { href: "/agc/seasons", label: "Sezon Yönetimi", icon: ChartBarIcon },
      ]
    },
  ];

  const toggleSubMenu = (id: string) => {
    setOpenSubMenu(openSubMenu === id ? null : id);
  };

  const isActive = (href?: string, currentItem?: NavItem) => {
    if (currentItem?.subItems) { // For parent items of submenus (accordion header)
      return currentItem.subItems.some(sub => pathname?.startsWith(sub.href));
    }
    if (!href) return false;
    // For direct links or sub-items
    if (href === "/" || href === "/superadmin") return pathname === href;
    return pathname?.startsWith(href);
  };
  
  useEffect(() => {
    const activeParent = navItems.find(item => item.subItems?.some(sub => pathname?.startsWith(sub.href)));
    if (activeParent) {
      setOpenSubMenu(activeParent.id);
    }
  }, [pathname, navItems]);

  const accessibleNavItems = navItems.filter(item => {
    if (item.adminOnly) {
      return hasRole("ROLE_ADMIN");
    }
    if (!item.roles) return true; 
    return item.roles.some(role => hasRole(role));
  });
  
  // bizbizeNavItems is removed as its logic is now part of the generalized isActive

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col fixed top-0 left-0">
      <div className="p-4">
        <Link href={isSuperAdmin ? "/superadmin" : "/"} className="text-2xl font-semibold text-center text-primary block">
          Yönetim Paneli
        </Link>
      </div>
      <nav className="flex-grow p-4 space-y-1">
        {accessibleNavItems.map((item) => (
          <div key={item.id}>
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleSubMenu(item.id)}
                  className={`flex items-center justify-between w-full p-3 rounded-md transition-colors text-left ${
                    isActive(undefined, item) || openSubMenu === item.id 
                      ? "bg-gray-700 text-white" 
                      : "hover:bg-gray-700 text-gray-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="h-6 w-6 mr-3 flex-shrink-0" />
                    {item.label}
                  </div>
                  {openSubMenu === item.id ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                </button>
                {openSubMenu === item.id && (
                  <div className="pl-6 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex items-center p-2.5 rounded-md transition-colors text-sm ${
                          isActive(subItem.href)
                            ? "bg-primary text-white"
                            : "hover:bg-gray-700 text-gray-300 hover:text-white"
                        }`}
                      >
                        <subItem.icon className="h-5 w-5 mr-2 flex-shrink-0" />
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href!} 
                className={`flex items-center p-3 rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-white"
                    : "hover:bg-gray-700 text-gray-300 hover:text-white"
                }`}
              >
                <item.icon className="h-6 w-6 mr-3 flex-shrink-0" />
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        {user && (
          <div className="mb-4 p-2 rounded bg-gray-700">
            <p className="text-sm font-medium text-white">{user.email}</p>
            <p className="text-xs text-gray-400">{user.roles.join(", ")}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center p-3 rounded-md bg-red-600 hover:bg-red-700 transition-colors text-white font-medium"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
