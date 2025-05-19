"use client";

import React, { useState, useRef, useEffect } from 'react'; // Added useEffect
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import { BizbizeEvent, BizbizeEventPhoto, ImageUploadResponseData, PhotoMetadata, ApiResponse } from '@/types';
import { XMarkIcon, CloudArrowUpIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image'; // For displaying images
import Link from 'next/link'; // Import Link for client-side navigation if needed, but <a> for external

interface ManageEventPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: BizbizeEvent | null;
  onPhotosUpdated: () => void; // Callback to refresh event list or event details
}

const ManageEventPhotosModal: React.FC<ManageEventPhotosModalProps> = ({ isOpen, onClose, event, onPhotosUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhotos, setCurrentPhotos] = useState<BizbizeEventPhoto[]>([]); // Initialize as empty
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update currentPhotos when the event prop changes or when the modal opens with a new event
    if (event && isOpen) {
      setCurrentPhotos(event.photos || []);
    } else if (!isOpen) {
      // Optionally reset photos when modal is closed to ensure fresh state next time
      // setCurrentPhotos([]); 
    }
  }, [event, isOpen]); // Depend on event and isOpen

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !event) return;
    const file = e.target.files[0];
    setIsLoading(true);

    try {
      // Step 1: Upload image
      const formData = new FormData();
      formData.append('image', file);
      const imageUploadResponse = await api.post<ApiResponse<ImageUploadResponseData>>('/images/addImage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!imageUploadResponse.data.success || !imageUploadResponse.data.data.url) {
        throw new Error(imageUploadResponse.data.message || 'Resim yüklenemedi.');
      }
      const imageUrl = imageUploadResponse.data.data.url;

      // Step 2: Add photo metadata
      const photoMetadataPayload = { photoUrl: imageUrl, tenant: "BIZBIZE" };
      const photoMetadataResponse = await api.post<ApiResponse<PhotoMetadata>>('/photos/addPhoto', photoMetadataPayload);

      if (!photoMetadataResponse.data.success || !photoMetadataResponse.data.data.id) {
        throw new Error(photoMetadataResponse.data.message || 'Fotoğraf metadatası oluşturulamadı.');
      }
      const photoId = photoMetadataResponse.data.data.id;

      // Step 3: Add photo to event
      await api.post(`/events/addPhotosToEvent?id=${event.id}`, [photoId]);
      
      toast.success('Fotoğraf etkinliğe başarıyla eklendi!');
      // Optimistically update or refetch
      // Ensure the new photo object matches BizbizeEventPhoto structure
      const newPhoto: BizbizeEventPhoto = { 
        id: Number(photoId), 
        photoUrl: imageUrl, 
        tenant: "BIZBIZE" // Assuming tenant is always BIZBIZE here
      };
      setCurrentPhotos(prev => [...prev, newPhoto]); 
      onPhotosUpdated();
    } catch (error: any) {
      console.error("Add photo to event error:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Fotoğraf eklenirken bir hata oluştu.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    }
  };
  
  // TODO: Implement photo deletion if API supports it (e.g., removePhotoFromEvent, deletePhoto, deleteImage)

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Fotoğrafları Yönet: {event.guestName} - {event.title.substring(0,30)}...
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
                  {/* TODO: Add delete button per photo if functionality exists */}
                  {/* <button className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Fotoğrafı Sil">
                    <TrashIcon className="h-4 w-4" />
                  </button> */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Bu etkinlik için henüz fotoğraf yok.</p>
          )}
        </div>

        <div className="mt-6">
          <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" id="event-photo-upload"/>
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

export default ManageEventPhotosModal;
