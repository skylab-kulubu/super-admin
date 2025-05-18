"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { BizbizeStaff, ApiResponse } from '@/types';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import BizbizeStaffTable from '@/components/bizbize/BizbizeStaffTable';
import AddEditBizbizeStaffModal from '@/components/bizbize/AddEditBizbizeStaffModal';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

export default function BizbizeStaffPage() {
  const { user: authUser, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  const [staffMembers, setStaffMembers] = useState<BizbizeStaff[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<BizbizeStaff | null>(null);

  const fetchStaff = useCallback(async () => {
    setIsLoadingStaff(true);
    try {
      const response = await api.get<ApiResponse<BizbizeStaff[]>>('/staff/getAllByTenant?tenant=BIZBIZE');
      if (response.data.success) {
        setStaffMembers(response.data.data);
      } else {
        toast.error(response.data.message || 'Ekip üyeleri getirilemedi.');
      }
    } catch (error) {
      console.error("Fetch staff error:", error);
      toast.error('Ekip üyeleri getirilirken bir hata oluştu.');
    } finally {
      setIsLoadingStaff(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !hasRole("ROLE_BIZBIZE_ADMIN")) {
      router.replace("/403");
      return;
    }
    if (hasRole("ROLE_BIZBIZE_ADMIN") || hasRole("ROLE_ADMIN")) {
      fetchStaff();
    }
  }, [authLoading, hasRole, router, fetchStaff]);

  const handleOpenAddModal = () => {
    setStaffToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (staff: BizbizeStaff) => {
    setStaffToEdit(staff);
    setIsAddEditModalOpen(true);
  };

  const handleStaffSaved = () => {
    fetchStaff(); // Refetch staff list after saving
  };

  if (authLoading || (isLoadingStaff && (hasRole("ROLE_BIZBIZE_ADMIN") || hasRole("ROLE_ADMIN")))) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
      </div>
    );
  }

  if (!authUser || !(hasRole("ROLE_BIZBIZE_ADMIN") || hasRole("ROLE_ADMIN"))) {
    return null; 
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          BizBize Ekip Yönetimi
        </h1>
        <Button onClick={handleOpenAddModal}>
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Yeni Ekip Üyesi Ekle
        </Button>
      </div>
      
      <BizbizeStaffTable 
        staffMembers={staffMembers} 
        onEditStaff={handleOpenEditModal}
      />

      <AddEditBizbizeStaffModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onStaffSaved={handleStaffSaved}
        staffToEdit={staffToEdit}
      />
    </div>
  );
}
