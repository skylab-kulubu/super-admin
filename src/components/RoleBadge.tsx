import React from 'react';
import { Role } from '@/types';

interface RoleBadgeProps {
  role: Role;
}

const roleColorMap: Record<Role, string> = {
  ROLE_USER: "bg-gray-500 text-white",
  ROLE_ADMIN: "bg-red-600 text-white",
  ROLE_BIZBIZE_ADMIN: "bg-blue-500 text-white",
  ROLE_GECEKODU_ADMIN: "bg-green-500 text-white",
  ROLE_AGC_ADMIN: "bg-yellow-500 text-black",
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const colorClass = roleColorMap[role] || "bg-gray-400 text-black";
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colorClass}`}>
      {role.replace("ROLE_", "")}
    </span>
  );
};

export default RoleBadge;
