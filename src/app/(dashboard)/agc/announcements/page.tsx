"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { AgcAnnouncement, ApiResponse } from '@/types'; // Use AgcAnnouncement type
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import AgcAnnouncementTable from '@/components/agc/AgcAnnouncementTable';
import AddEditAgcAnnouncementModal from '@/components/agc/AddEditAgcAnnouncementModal';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { parseApiDateTimeToInput } from '@/lib/utils';


export default function AgcAnnouncementsPage() {
  const { user: authUser, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<AgcAnnouncement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<AgcAnnouncement | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoadingAnnouncements(true);
    try {
      const response = await api.get<ApiResponse<AgcAnnouncement[]>>('/announcements/getAllByTenant?tenant=AGC');
      if (response.data.success) {
        const sortedData = response.data.data.sort((a, b) => 
          new Date(parseApiDateTimeToInput(b.date)).getTime() - new Date(parseApiDateTimeToInput(a.date)).getTime()
        );
        setAnnouncements(sortedData);
      } else {
        toast.error(response.data.message || 'Duyurular getirilemedi.');
      }
    } catch (error) {
      console.error("Fetch AGC announcements error:", error);
      toast.error('Duyurular getirilirken bir hata oluştu.');
    } finally {
      setIsLoadingAnnouncements(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !(hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN"))) {
      router.replace("/403");
      return;
    }
    if (hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN")) {
      fetchAnnouncements();
    }
  }, [authLoading, hasRole, router, fetchAnnouncements]);

  const handleOpenAddModal = () => {
    setAnnouncementToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (announcement: AgcAnnouncement) => {
    setAnnouncementToEdit(announcement);
    setIsAddEditModalOpen(true);
  };

  const handleAnnouncementSaved = () => {
    fetchAnnouncements(); 
  };

  if (authLoading || (isLoadingAnnouncements && (hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN")))) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
      </div>
    );
  }

  if (!authUser || !(hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN"))) {
    return null; 
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          AGC Duyuru Yönetimi
        </h1>
        <Button onClick={handleOpenAddModal}>
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Yeni Duyuru Ekle
        </Button>
      </div>
      
      <AgcAnnouncementTable 
        announcements={announcements} 
        onEditAnnouncement={handleOpenEditModal}
      />

      <AddEditAgcAnnouncementModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onAnnouncementSaved={handleAnnouncementSaved}
        announcementToEdit={announcementToEdit}
      />
    </div>
  );
}
