"use client";

import React from 'react';
import { ApiUser } from '@/types';
import RoleBadge from '@/components/RoleBadge';
import Button from '@/components/ui/Button';
import { PencilSquareIcon, KeyIcon as ResetPasswordIcon } from '@heroicons/react/24/outline';

interface UserTableProps {
  users: ApiUser[];
  onEditRoles: (user: ApiUser) => void;
  onResetPassword: (username: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEditRoles, onResetPassword }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('tr-TR', {
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateString; // fallback if date is invalid
    }
  };

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kullanıcı Adı</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roller</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Oluşturulma Tarihi</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Son Giriş</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Eylemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Kullanıcı bulunamadı.
              </td>
            </tr>
          )}
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex flex-wrap gap-1">
                  {user.roles.map(role => <RoleBadge key={role} role={role as any} />)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{formatDate(user.createdAt)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{formatDate(user.lastLogin)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => onEditRoles(user)}
                  className="text-primary hover:text-red-700 dark:text-primary dark:hover:text-red-400 !p-1.5"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  <span className="sr-only">Rolleri Düzenle</span>
                </Button>
                <Button
                  variant="danger"
                  onClick={() => onResetPassword(user.username)}
                  aria-label={`${user.username} şifresini sıfırla`}
                >
                  <ResetPasswordIcon className="h-4 w-4 mr-1 sm:mr-0" /> <span className="hidden sm:inline">Şifre Sıfırla</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
