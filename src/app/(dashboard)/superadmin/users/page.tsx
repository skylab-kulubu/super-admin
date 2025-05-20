"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ApiUser, ApiResponse } from '@/types';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import UserTable from '@/components/admin/UserTable'; // Assuming UserTable component
import AddUserModal from '@/components/admin/AddUserModal';
import EditUserRolesModal from '@/components/admin/EditUserRolesModal';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

export default function ManageUsersPage() {
  const { user: authUser, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditRolesModalOpen, setIsEditRolesModalOpen] = useState(false);
  const [userToEditRoles, setUserToEditRoles] = useState<ApiUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const response = await api.get<ApiResponse<ApiUser[]>>('/users/getAllUsers');
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        toast.error(response.data.message || 'Kullanıcılar getirilemedi.');
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error('Kullanıcılar getirilirken bir hata oluştu.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !hasRole("ROLE_ADMIN")) {
      router.replace("/403");
      return;
    }
    if (hasRole("ROLE_ADMIN")) {
      fetchUsers();
    }
  }, [authLoading, hasRole, router, fetchUsers]);

  const handleOpenAddUserModal = () => setIsAddUserModalOpen(true);
  const handleUserAdded = () => {
    setIsAddUserModalOpen(false);
    fetchUsers();
  };

  const handleOpenEditRolesModal = (user: ApiUser) => {
    setUserToEditRoles(user);
    setIsEditRolesModalOpen(true);
  };
  const handleRolesUpdated = () => {
    setIsEditRolesModalOpen(false);
    fetchUsers();
  };

  const handleResetPassword = async (username: string) => {
    if (!window.confirm(`${username} adlı kullanıcının şifresini sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }
    try {
      await api.post('/users/resetPassword', { username });
      toast.success(`${username} kullanıcısının şifresi başarıyla sıfırlandı.`);
      // No need to refetch users, password change is backend only
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || 'Şifre sıfırlanırken bir hata oluştu.');
    }
  };

  if (authLoading || (isLoadingUsers && hasRole("ROLE_ADMIN"))) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  if (!authUser || !hasRole("ROLE_ADMIN")) {
    return null; 
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Kullanıcı Yönetimi
        </h1>
        <Button onClick={handleOpenAddUserModal} variant="primary">
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Yeni Kullanıcı Ekle
        </Button>
      </div>
      
      <UserTable 
        users={users} 
        onEditRoles={handleOpenEditRolesModal}
        onResetPassword={handleResetPassword} // Pass the handler
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
      <EditUserRolesModal
        isOpen={isEditRolesModalOpen}
        onClose={() => setIsEditRolesModalOpen(false)}
        user={userToEditRoles}
        onRolesUpdated={handleRolesUpdated}
      />
    </div>
  );
}
