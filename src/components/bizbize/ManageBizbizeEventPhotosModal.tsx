"use client";

import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import { BizbizeEvent, BizbizeEventPhoto, ImageUploadResponseData, PhotoId, ApiResponse } from '@/types';
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface ManageBizbizeEventPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: BizbizeEvent | null; 
  onPhotosUpdated: () => void;
}

const ManageBizbizeEventPhotosModal: React.FC<ManageBizbizeEventPhotosModalProps> = ({ isOpen, onClose, event, onPhotosUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<BizbizeEventPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (event && isOpen) {
      setCurrentPhotos(event.photos || []);
    }
  }, [event, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !event) return;
    const file = e.target.files[0];
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const imageUploadResponse = await api.post<ApiResponse<ImageUploadResponseData>>('/images/addImage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!imageUploadResponse.data.success || !imageUploadResponse.data.data.url) {
        throw new Error(imageUploadResponse.data.message || 'Resim yüklenemedi.');
      }
      const imageUrl = imageUploadResponse.data.data.url;

      const photoMetadataPayload = { photoUrl: imageUrl, tenant: "BIZBIZE" };
      const photoResponse = await api.post<ApiResponse<PhotoId>>('/photos/addPhoto', photoMetadataPayload);

      if (!photoResponse.data.success || typeof photoResponse.data.data !== 'number') {
        throw new Error(photoResponse.data.message || 'Fotoğraf metadatası oluşturulamadı veya ID alınamadı.');
      }
      const photoId = photoResponse.data.data;

      await api.post(`/events/addPhotosToEvent?id=${event.id}`, [photoId]);
      
      toast.success('Fotoğraf etkinliğe başarıyla eklendi!');
      const newPhoto: BizbizeEventPhoto = { 
        id: photoId, 
        photoUrl: imageUrl, 
        tenant: "BIZBIZE" 
      };
      setCurrentPhotos(prev => [...prev, newPhoto]); 
      onPhotosUpdated();

    } catch (error: any) {
      console.error("Add photo to BizBize event error:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Fotoğraf eklenirken bir hata oluştu.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };
  
  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Fotoğrafları Yönet: {event.title.substring(0,30)}...
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Mevcut Fotoğraflar:</h3>
          {currentPhotos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {currentPhotos.map(photo => (
                <div key={photo.id} className="relative group">
                  <a href={photo.photoUrl} target="_blank" rel="noopener noreferrer" title="Fotoğrafı yeni sekmede aç">
                    <Image src={photo.photoUrl} alt={`Event photo ${photo.id}`} width={150} height={150} className="rounded object-cover aspect-square cursor-pointer" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Bu etkinlik için henüz fotoğraf yok.</p>
          )}
        </div>

        <div className="mt-6">
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" id="bizbize-event-photo-upload"/>
          <Button onClick={() => fileInputRef.current?.click()} isLoading={isLoading} disabled={isLoading} className="w-full">
            <CloudArrowUpIcon className="h-5 w-5 mr-2"/>
            Yeni Fotoğraf Yükle
          </Button>
        </div>

        <div className="flex justify-end mt-8">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManageBizbizeEventPhotosModal;
