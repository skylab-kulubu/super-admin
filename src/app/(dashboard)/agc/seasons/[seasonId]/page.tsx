"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { Season, Competitor, ApiResponse } from '@/types';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import AgcSeasonCompetitorManager from '@/components/agc/AgcSeasonCompetitorManager';
import { formatDateToLocale, parseApiTimestampToYyyyMmDd } from '@/lib/utils';

export default function AgcSeasonDetailPage() {
  const params = useParams();
  const seasonId = params?.seasonId as string;
  const router = useRouter();
  const { user: authUser, loading: authLoading, hasRole } = useAuth();

  const [season, setSeason] = useState<Season | null>(null);
  const [allSystemCompetitors, setAllSystemCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSeasonDetails = useCallback(async () => {
    if (!seasonId) return;
    setIsLoading(true);
    try {
      // Corrected API endpoint
      const response = await api.get<ApiResponse<Season>>(`/seasons/getSeasonById?id=${seasonId}`);
      if (response.data.success) {
        setSeason(response.data.data);
      } else {
        toast.error(response.data.message || 'Sezon detayları getirilemedi.');
        router.push('/agc/seasons'); // Redirect if season not found or error
      }
    } catch (error) {
      console.error("Fetch AGC season details error:", error);
      toast.error('Sezon detayları getirilirken bir hata oluştu.');
      router.push('/agc/seasons');
    } finally {
      setIsLoading(false);
    }
  }, [seasonId, router]);

  const fetchAllSystemCompetitors = useCallback(async () => {
    try {
      // Corrected API endpoint path
      const response = await api.get<ApiResponse<Competitor[]>>('/competitors/getAllCompetitorsByTenant?tenant=AGC');
      if (response.data.success) {
        setAllSystemCompetitors(response.data.data);
      } else {
        toast.error('Sistemdeki tüm yarışmacılar getirilemedi.');
      }
    } catch (error) {
      console.error("Fetch all system competitors error:", error);
      toast.error('Sistemdeki tüm yarışmacılar getirilirken bir hata oluştu.');
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!(hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN"))) {
        router.replace("/403");
        return;
      }
      if (seasonId) {
        fetchSeasonDetails();
        fetchAllSystemCompetitors();
      }
    }
  }, [authLoading, hasRole, router, seasonId, fetchSeasonDetails, fetchAllSystemCompetitors]);

  const handleDataUpdated = () => {
    fetchSeasonDetails(); // Refetch season details (which includes its competitors)
    fetchAllSystemCompetitors(); // Refetch all system competitors in case new ones were added or points updated globally
  };

  if (authLoading || isLoading) {
    return (
      <div className="space-y-4 p-4 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="mt-8 h-64 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="p-4 text-center text-gray-600 dark:text-gray-400">
        Sezon bulunamadı veya yüklenemedi.
        <Button onClick={() => router.push('/agc/seasons')} className="mt-4">
          Sezon Listesine Geri Dön
        </Button>
      </div>
    );
  }
  
  if (!authUser || !(hasRole("ROLE_AGC_ADMIN") || hasRole("ROLE_ADMIN"))) {
    return null; 
  }

  return (
    <div className="space-y-6 p-4">
      <Button variant="primary" onClick={() => router.push('/agc/seasons')} className="mb-4">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Tüm Sezonlara Geri Dön
      </Button>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
          {season.name}
        </h1>
        <div className="flex items-center mb-4">
          {season.isActive ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span className={`text-sm font-medium ${season.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {season.isActive ? 'Aktif Sezon' : 'Pasif Sezon'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <p><strong>Başlangıç Tarihi:</strong> {formatDateToLocale(parseApiTimestampToYyyyMmDd(season.startDate))}</p>
          <p><strong>Bitiş Tarihi:</strong> {formatDateToLocale(parseApiTimestampToYyyyMmDd(season.endDate))}</p>
          <p><strong>Tenant:</strong> {season.tenant}</p>
          <p><strong>Kayıtlı Yarışmacı Sayısı:</strong> {season.competitors?.length || 0}</p>
        </div>
      </div>

      <AgcSeasonCompetitorManager
        season={season}
        allSystemCompetitors={allSystemCompetitors}
        onCompetitorsUpdated={handleDataUpdated}
      />
    </div>
  );
}
