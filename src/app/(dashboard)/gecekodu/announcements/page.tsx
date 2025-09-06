"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { GecekoduAnnouncement, ApiResponse } from '@/types'; // Ensure GecekoduAnnouncement type
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
// You'll need to create these GeceKodu specific components or adapt BizBize ones
import GecekoduAnnouncementTable from '@/components/gecekodu/GecekoduAnnouncementTable';
import AddEditGecekoduAnnouncementModal from '@/components/gecekodu/AddEditGecekoduAnnouncementModal';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { parseApiDateTimeToInput } from '@/lib/utils';


export default function GecekoduAnnouncementsPage() {
  const { user: authUser, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<GecekoduAnnouncement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<GecekoduAnnouncement | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    setIsLoadingAnnouncements(true);
    try {
      const response = await api.get<ApiResponse<GecekoduAnnouncement[]>>('/announcements/getAllByTenant?tenant=GECEKODU');
      if (response.data.success) {
        const sortedData = response.data.data.sort((a, b) => 
          new Date(parseApiDateTimeToInput(b.date)).getTime() - new Date(parseApiDateTimeToInput(a.date)).getTime()
        );
        setAnnouncements(sortedData);
      } else {
        toast.error(response.data.message || 'Duyurular getirilemedi.');
      }
    } catch (error) {
      console.error("Fetch GeceKodu announcements error:", error);
      toast.error('Duyurular getirilirken bir hata oluştu.', { id: 'fetch-announcements-error' });
    } finally {
      setIsLoadingAnnouncements(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !(hasRole("ROLE_GECEKODU_ADMIN") || hasRole("ROLE_ADMIN"))) {
      router.replace("/403");
      return;
    }
    if (hasRole("ROLE_GECEKODU_ADMIN") || hasRole("ROLE_ADMIN")) {
      fetchAnnouncements();
    }
  }, [authLoading, hasRole, router, fetchAnnouncements]);

  const handleOpenAddModal = () => {
    setAnnouncementToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (announcement: GecekoduAnnouncement) => {
    setAnnouncementToEdit(announcement);
    setIsAddEditModalOpen(true);
  };

  const handleAnnouncementSaved = () => {
    fetchAnnouncements(); 
  };

  if (authLoading || (isLoadingAnnouncements && (hasRole("ROLE_GECEKODU_ADMIN") || hasRole("ROLE_ADMIN")))) {
    return (
      <div className="space-y-4"> {/* No p-6 */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
      </div>
    );
  }

  if (!authUser || !(hasRole("ROLE_GECEKODU_ADMIN") || hasRole("ROLE_ADMIN"))) {
    return null; 
  }

  return (
    <div className="space-y-6"> {/* No p-6 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          GeceKodu Duyuru Yönetimi
        </h1>
        <Button onClick={handleOpenAddModal}>
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Yeni Duyuru Ekle
        </Button>
      </div>
      
      <GecekoduAnnouncementTable 
        announcements={announcements} 
        onEditAnnouncement={handleOpenEditModal}
      />

      <AddEditGecekoduAnnouncementModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onAnnouncementSaved={handleAnnouncementSaved}
        announcementToEdit={announcementToEdit}
      />
    </div>
  );
}
