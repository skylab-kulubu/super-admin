"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import { ApiUser, ALL_ROLES, Role } from '@/types';
import { XMarkIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import RoleBadge from '@/components/RoleBadge';

interface EditUserRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: ApiUser | null;
  onRolesUpdated: () => void; // Callback to refresh user list
}

const EditUserRolesModal: React.FC<EditUserRolesModalProps> = ({ isOpen, onClose, user, onRolesUpdated }) => {
  const [currentUserRoles, setCurrentUserRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setCurrentUserRoles(user.roles as Role[]);
    }
  }, [user]);

  const handleRoleChange = async (role: Role, action: 'add' | 'remove') => {
    if (!user) return;
    setIsLoading(true);
    const endpoint = action === 'add' ? '/users/addRole' : '/users/removeRole';
    try {
      await api.post(`${endpoint}?username=${user.username}&role=${role}`);
      toast.success(`Rol başarıyla ${action === 'add' ? 'eklendi' : 'kaldırıldı'}.`);
      // Optimistically update UI or refetch
      if (action === 'add') {
        setCurrentUserRoles(prev => [...prev, role]);
      } else {
        setCurrentUserRoles(prev => prev.filter(r => r !== role));
      }
      onRolesUpdated(); // Notify parent to refetch all users for consistency
    } catch (error: any) {
      console.error("Role change error:", error);
      const errorMessage = error.response?.data?.message || 'Rol değiştirilirken bir hata oluştu.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const availableRolesToAdd = ALL_ROLES.filter(role => !currentUserRoles.includes(role));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Rolleri Düzenle: {user.username}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Mevcut Roller:</h3>
          {currentUserRoles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentUserRoles.map(role => (
                <div key={role} className="flex items-center">
                  <RoleBadge role={role} />
                  <button
                    onClick={() => handleRoleChange(role, 'remove')}
                    disabled={isLoading || role === "ROLE_USER"} // Prevent removing ROLE_USER for example
                    className="ml-1 p-0.5 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-700 disabled:opacity-50"
                    title="Rolü Kaldır"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Kullanıcının atanmış rolü yok.</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Eklenebilecek Roller:</h3>
          {availableRolesToAdd.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableRolesToAdd.map(role => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role, 'add')}
                  disabled={isLoading}
                  className="flex items-center px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  title="Rol Ekle"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  {role.replace("ROLE_", "")}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Eklenebilecek başka rol yok.</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditUserRolesModal;
