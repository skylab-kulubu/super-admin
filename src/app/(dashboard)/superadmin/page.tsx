"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { ApiUser, ApiResponse } from "@/types";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import UserTable from "@/components/admin/UserTable";
import AddUserModal from "@/components/admin/AddUserModal";
import EditUserRolesModal from "@/components/admin/EditUserRolesModal";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export default function SuperAdminPage() {
  const { user: authUser, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditRolesModalOpen, setIsEditRolesModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<ApiUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const response = await api.get<ApiResponse<ApiUser[]>>('/users/getAll');
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

  const handleOpenEditRolesModal = (user: ApiUser) => {
    setSelectedUserForEdit(user);
    setIsEditRolesModalOpen(true);
  };

  const handleRolesUpdated = () => {
    fetchUsers(); // Refetch users after roles are updated
  };
  
  const handleUserAdded = () => {
    fetchUsers(); // Refetch users after a new user is added
  };

  const handleResetPassword = async (username: string) => {
    if (!window.confirm(`${username} adlı kullanıcının şifresini sıfırlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }
    try {
      await api.post('/users/resetPassword', { username });
      toast.success(`${username} kullanıcısının şifresi başarıyla sıfırlandı.`);
      // No need to refetch users list as password change is backend only and doesn't affect user data shown in table.
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || 'Şifre sıfırlanırken bir hata oluştu.');
    }
  };

  if (authLoading || isLoadingUsers && hasRole("ROLE_ADMIN")) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
      </div>
    );
  }

  if (!authUser || !hasRole("ROLE_ADMIN")) {
    return null; 
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Kullanıcı Yönetimi
        </h1>
        <Button onClick={() => setIsAddUserModalOpen(true)}>
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Yeni Kullanıcı Ekle
        </Button>
      </div>
      
      <UserTable 
        users={users} 
        onEditRoles={handleOpenEditRolesModal} 
        onResetPassword={handleResetPassword} // Pass the implemented function
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
      
      {selectedUserForEdit && (
        <EditUserRolesModal
          isOpen={isEditRolesModalOpen}
          onClose={() => {
            setIsEditRolesModalOpen(false);
            setSelectedUserForEdit(null);
          }}
          user={selectedUserForEdit}
          onRolesUpdated={handleRolesUpdated}
        />
      )}
    </div>
  );
}
