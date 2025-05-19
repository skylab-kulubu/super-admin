"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Season, ApiResponse } from '@/types'; // Removed Competitor from here
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import AgcSeasonTable from '@/components/agc/AgcSeasonTable';
import AddEditAgcSeasonModal from '@/components/agc/AddEditAgcSeasonModal';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

export default function AgcSeasonsPage() {
  const { user: authUser, loading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  const [seasons, setSeasons] = useState<Season[]>([]);
  // const [allCompetitors, setAllCompetitors] = useState<Competitor[]>([]); // Removed
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [seasonToEdit, setSeasonToEdit] = useState<Season | null>(null);

  const fetchSeasons = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<Season[]>>('/seasons/getAllSeasonsByTenant?tenant=AGC');
      if (response.data.success) {
        const sortedSeasons = response.data.data.sort((a, b) => {
          const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
          const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
          return dateB - dateA;
        });
        setSeasons(sortedSeasons);
      } else {
        toast.error(response.data.message || 'Sezonlar getirilemedi.');
      }
    } catch (error) {
      console.error("Fetch AGC seasons error:", error);
      toast.error('Sezonlar getirilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // fetchAllCompetitors function is removed
  /*
  const fetchAllCompetitors = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<Competitor[]>>('/competitors/getAllByTenant?tenant=AGC');
      if (response.data.success) {
        setAllCompetitors(response.data.data);
      } else {
        console.warn(response.data.message || 'Tüm yarışmacılar getirilemedi. Bu özellik etkilenebilir.');
      }
    } catch (error) {
      console.error("Fetch all AGC competitors error:", error);
      toast.error('Tüm yarışmacılar getirilirken bir hata oluştu.');
    }
  }, []);
  */

  useEffect(() => {
    if (!authLoading) {
      if (!(hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN"))) {
        router.replace("/403");
        return;
      }
      if (hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN")) {
        fetchSeasons();
        // fetchAllCompetitors(); // Removed call
      }
    }
  }, [authLoading, hasRole, router, fetchSeasons]); // Removed fetchAllCompetitors from dependencies

  const handleOpenAddModal = () => {
    setSeasonToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (season: Season) => {
    setSeasonToEdit(season);
    setIsAddEditModalOpen(true);
  };

  const handleDataUpdated = () => {
    fetchSeasons();
    // fetchAllCompetitors(); // Removed call
  };

  if (authLoading || (isLoading && (hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN")))) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
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
          AGC Sezon Yönetimi
        </h1>
        <Button onClick={handleOpenAddModal} variant="primary">
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Yeni Sezon Ekle
        </Button>
      </div>
      
      <AgcSeasonTable 
        seasons={seasons} 
        onEditSeason={handleOpenEditModal}
      />

      <AddEditAgcSeasonModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSeasonSaved={handleDataUpdated}
        seasonToEdit={seasonToEdit}
        // allCompetitors prop is removed
      />
    </div>
  );
}
