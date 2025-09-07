"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { parseApiDateTimeToInput } from "@/lib/utils";
import { AgcEvent, ApiResponse } from "@/types"; // Use AgcEvent type
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import AgcEventTable from "@/components/agc/AgcEventTable"; 
import AddEditAgcEventModal from "@/components/agc/AddEditAgcEventModal";
import ManageAgcEventPhotosModal from "@/components/agc/ManageAgcEventPhotosModal";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export default function AgcEventsPage() {
  const { user: authUser, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<AgcEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<AgcEvent | null>(null);

  const [isManagePhotosModalOpen, setIsManagePhotosModalOpen] = useState(false);
  const [eventForPhotos, setEventForPhotos] = useState<AgcEvent | null>(null);

  const fetchAgcEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const response = await api.get<ApiResponse<AgcEvent[]>>('/events/getAllByTenant?tenant=AGC');
      if (response.data.success) {
        setEvents(response.data.data.sort((a, b) => new Date(parseApiDateTimeToInput(b.date)).getTime() - new Date(parseApiDateTimeToInput(a.date)).getTime()));
      } else {
        toast.error(response.data.message || 'AGC etkinlikleri getirilemedi.');
      }
    } catch (error) {
      console.error("Fetch AGC events error:", error);
      toast.error('AGC etkinlikleri getirilirken bir hata oluştu.', { id: 'fetch-agc-events-error' });
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !(hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN"))) {
      router.replace("/403"); 
      return;
    }
    if (hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN")) {
      fetchAgcEvents();
    }
  }, [authLoading, hasRole, router, fetchAgcEvents]);

  const handleOpenAddModal = () => {
    setEventToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (event: AgcEvent) => {
    setEventToEdit(event);
    setIsAddEditModalOpen(true);
  };
  
  const handleOpenManagePhotosModal = (event: AgcEvent) => {
    setEventForPhotos(event);
    setIsManagePhotosModalOpen(true);
  };

  const handleEventSaved = () => {
    fetchAgcEvents();
  };
  
  const handlePhotosUpdated = () => {
    fetchAgcEvents(); 
  };

  if (authLoading || (isLoadingEvents && (hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN")))) {
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
          AGC Etkinlik Yönetimi
        </h1>
        <Button onClick={handleOpenAddModal}>
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Yeni Etkinlik Ekle
        </Button>
      </div>
      
      <AgcEventTable 
        events={events} 
        onEditEvent={handleOpenEditModal}
        onManagePhotos={handleOpenManagePhotosModal}
      />

      <AddEditAgcEventModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onEventSaved={handleEventSaved}
        eventToEdit={eventToEdit}
      />

      <ManageAgcEventPhotosModal
        isOpen={isManagePhotosModalOpen}
        onClose={() => {
            setIsManagePhotosModalOpen(false);
            setEventForPhotos(null); 
        }}
        event={eventForPhotos}
        onPhotosUpdated={handlePhotosUpdated}
      />
    </div>
  );
}
