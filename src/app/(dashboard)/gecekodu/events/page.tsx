"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { parseApiDateTimeToInput } from "@/lib/utils";
import { GecekoduEvent, ApiResponse } from "@/types"; // Ensure GecekoduEvent type is defined
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
// You'll need to create these GeceKodu specific components or adapt BizBize ones
import GecekoduEventTable from "@/components/gecekodu/GecekoduEventTable"; 
import AddEditGecekoduEventModal from "@/components/gecekodu/AddEditGecekoduEventModal";
import ManageGecekoduEventPhotosModal from "@/components/gecekodu/ManageGecekoduEventPhotosModal";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export default function GecekoduEventsPage() {
  const { user: authUser, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<GecekoduEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<GecekoduEvent | null>(null);

  const [isManagePhotosModalOpen, setIsManagePhotosModalOpen] = useState(false);
  const [eventForPhotos, setEventForPhotos] = useState<GecekoduEvent | null>(null);

  const fetchGecekoduEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const response = await api.get<ApiResponse<GecekoduEvent[]>>('/events/getAllByTenant?tenant=GECEKODU');
      if (response.data.success) {
        setEvents(response.data.data.sort((a, b) => new Date(parseApiDateTimeToInput(b.date)).getTime() - new Date(parseApiDateTimeToInput(a.date)).getTime()));
      } else {
        toast.error(response.data.message || 'GeceKodu etkinlikleri getirilemedi.');
      }
    } catch (error) {
      console.error("Fetch GeceKodu events error:", error);
      toast.error('GeceKodu etkinlikleri getirilirken bir hata oluştu.', { id: 'fetch-gecekodu-events-error' });
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !(hasRole("ROLE_GECEKODU_ADMIN") || hasRole("ROLE_ADMIN"))) { // Check for GECEKODU_ADMIN or ADMIN
      router.replace("/403"); 
      return;
    }
    if (hasRole("ROLE_GECEKODU_ADMIN") || hasRole("ROLE_ADMIN")) {
      fetchGecekoduEvents();
    }
  }, [authLoading, hasRole, router, fetchGecekoduEvents]);

  const handleOpenAddModal = () => {
    setEventToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (event: GecekoduEvent) => {
    setEventToEdit(event);
    setIsAddEditModalOpen(true);
  };
  
  const handleOpenManagePhotosModal = (event: GecekoduEvent) => {
    setEventForPhotos(event);
    setIsManagePhotosModalOpen(true);
  };

  const handleEventSaved = () => {
    fetchGecekoduEvents();
  };
  
  const handlePhotosUpdated = () => {
    fetchGecekoduEvents(); 
  };

  if (authLoading || (isLoadingEvents && (hasRole("ROLE_GECEKODU_ADMIN") || hasRole("ROLE_ADMIN")))) {
    return (
      <div className="space-y-4"> {/* No p-6, handled by main dashboard layout */}
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
    <div className="space-y-6"> {/* No p-6, handled by main dashboard layout */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          GeceKodu Etkinlik Yönetimi
        </h1>
        <Button onClick={handleOpenAddModal}>
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Yeni Etkinlik Ekle
        </Button>
      </div>
      
      <GecekoduEventTable 
        events={events} 
        onEditEvent={handleOpenEditModal}
        onManagePhotos={handleOpenManagePhotosModal}
      />

      <AddEditGecekoduEventModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onEventSaved={handleEventSaved}
        eventToEdit={eventToEdit}
      />

      <ManageGecekoduEventPhotosModal
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
