"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { parseApiDateTimeToInput } from "@/lib/utils";
import { BizbizeEvent, ApiResponse } from "@/types";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import BizbizeEventTable from "@/components/bizbize/BizbizeEventTable";
import AddEditBizbizeEventModal from "@/components/bizbize/AddEditBizbizeEventModal";
import ManageEventPhotosModal from "@/components/bizbize/ManageBizbizeEventPhotosModal";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export default function BizBizeEventsPage() { // Renamed component
  const { user: authUser, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<BizbizeEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<BizbizeEvent | null>(null);

  const [isManagePhotosModalOpen, setIsManagePhotosModalOpen] = useState(false);
  const [eventForPhotos, setEventForPhotos] = useState<BizbizeEvent | null>(null);

  const fetchBizbizeEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const response = await api.get<ApiResponse<BizbizeEvent[]>>('/events/getAllBizbizeEvents');
      if (response.data.success) {
        setEvents(response.data.data.sort((a, b) => new Date(parseApiDateTimeToInput(b.date)).getTime() - new Date(parseApiDateTimeToInput(a.date)).getTime()));
      } else {
        toast.error(response.data.message || 'BizBize etkinlikleri getirilemedi.');
      }
    } catch (error) {
      console.error("Fetch BizBize events error:", error);
      toast.error('BizBize etkinlikleri getirilirken bir hata oluştu.');
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !hasRole("ROLE_BIZBIZE_ADMIN")) {
      router.replace("/403"); 
      return;
    }
    if (hasRole("ROLE_BIZBIZE_ADMIN") || hasRole("ROLE_ADMIN")) {
      fetchBizbizeEvents();
    }
  }, [authLoading, hasRole, router, fetchBizbizeEvents]);

  const handleOpenAddModal = () => {
    setEventToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (event: BizbizeEvent) => {
    setEventToEdit(event);
    setIsAddEditModalOpen(true);
  };
  
  const handleOpenManagePhotosModal = (event: BizbizeEvent) => {
    if (!event || !event.id) { // Check if event or event.id is null/undefined
      toast.error("Etkinlik bilgisi bulunamadı. Fotoğraflar yönetilemiyor.");
      console.error("handleOpenManagePhotosModal called with invalid event:", event);
      return;
    }
    setEventForPhotos(event);
    setIsManagePhotosModalOpen(true);
  };

  const handleEventSaved = () => {
    fetchBizbizeEvents();
  };
  
  const handlePhotosUpdated = () => {
    fetchBizbizeEvents(); 
  };

  if (authLoading || (isLoadingEvents && (hasRole("ROLE_BIZBIZE_ADMIN") || hasRole("ROLE_ADMIN")))) {
    return (
      <div className="space-y-4"> {/* Correct: No p-6 here, handled by parent layout */}
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
    <div className="space-y-6"> {/* Correct: No p-6 here, handled by parent layout */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Etkinlik Yönetimi
        </h1>
        <Button onClick={handleOpenAddModal}>
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Yeni Etkinlik Ekle
        </Button>
      </div>
      
      <BizbizeEventTable 
        events={events} 
        onEditEvent={handleOpenEditModal}
        onManagePhotos={handleOpenManagePhotosModal}
      />

      <AddEditBizbizeEventModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onEventSaved={handleEventSaved}
        eventToEdit={eventToEdit}
      />

      <ManageEventPhotosModal
        isOpen={isManagePhotosModalOpen}
        onClose={() => {
          setIsManagePhotosModalOpen(false);
          setEventForPhotos(null); // Reset eventForPhotos when modal is closed
        }}
        event={eventForPhotos}
        onPhotosUpdated={handlePhotosUpdated}
      />
    </div>
  );
}
