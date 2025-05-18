"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { XMarkIcon, UserCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { BizbizeStaff, AddStaffPayload, UpdateStaffPayload, ImageUploadResponseData, PhotoId, ApiResponse } from '@/types';

interface AddEditBizbizeStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffSaved: () => void;
  staffToEdit?: BizbizeStaff | null;
}

type StaffFormInputs = {
  firstName: string;
  lastName: string;
  department?: string;
  linkedin?: string;
};

const AddEditBizbizeStaffModal: React.FC<AddEditBizbizeStaffModalProps> = ({ isOpen, onClose, onStaffSaved, staffToEdit }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<StaffFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // uploadedPhotoId is used internally by processPhotoUpload, not directly for payload unless it's a new photo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!staffToEdit;

  useEffect(() => {
    if (staffToEdit) {
      reset({
        firstName: staffToEdit.firstName,
        lastName: staffToEdit.lastName,
        department: staffToEdit.department || '',
        linkedin: staffToEdit.linkedin || '',
      });
      setPreviewImage(staffToEdit.photo?.photoUrl || null);
      setSelectedFile(null); 
    } else {
      reset({ firstName: '', lastName: '', department: '', linkedin: '' });
      setPreviewImage(null);
      setSelectedFile(null);
    }
  }, [staffToEdit, reset, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const processPhotoUpload = async (file: File): Promise<number | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const imageUploadRes = await api.post<ApiResponse<ImageUploadResponseData>>('/images/addImage', formData);
      if (!imageUploadRes.data.success || !imageUploadRes.data.data.url) {
        throw new Error(imageUploadRes.data.message || 'Resim yüklenemedi.');
      }
      const imageUrl = imageUploadRes.data.data.url;

      const photoRes = await api.post<ApiResponse<PhotoId>>('/photos/addPhoto', { photoUrl: imageUrl, tenant: "BIZBIZE" });
      if (!photoRes.data.success || typeof photoRes.data.data !== 'number') {
        throw new Error(photoRes.data.message || 'Fotoğraf metadatası oluşturulamadı veya ID alınamadı.');
      }
      return photoRes.data.data;
    } catch (error: any) {
      toast.error(error.message || 'Fotoğraf işlenirken hata oluştu.');
      return null;
    }
  };

  const onSubmit: SubmitHandler<StaffFormInputs> = async (data) => {
    setIsLoading(true);
    let finalPhotoIdForPayload: number | undefined = undefined;

    if (selectedFile && !isEditMode) {
      const newPhotoId = await processPhotoUpload(selectedFile);
      if (newPhotoId === null) {
        setIsLoading(false);
        return; 
      }
      finalPhotoIdForPayload = newPhotoId;
    }
    
    try {
      if (isEditMode && staffToEdit) {
        const payload: UpdateStaffPayload = {
          id: staffToEdit.id,
          ...data,
        };
        await api.post('/staff/updateStaff', payload);
        toast.success('Ekip üyesi başarıyla güncellendi!');
      } else {
        const payload: AddStaffPayload = {
          ...data,
          photoId: finalPhotoIdForPayload,
          tenant: "BIZBIZE",
        };
        await api.post('/staff/addStaff', payload);
        toast.success('Ekip üyesi başarıyla eklendi!');
      }
      onStaffSaved();
      onClose();
    } catch (error: any) {
      console.error("Save BizBize staff error:", error);
      const errorMessage = error.response?.data?.message || 'Ekip üyesi kaydedilirken bir hata oluştu.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isEditMode ? 'Ekip Üyesini Düzenle' : 'Yeni Ekip Üyesi Ekle'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            {previewImage ? (
              <Image src={previewImage} alt="Staff photo preview" width={100} height={100} className="rounded-full object-cover" />
            ) : (
              <UserCircleIcon className="h-24 w-24 text-gray-400" />
            )}
            {!isEditMode && (
                 <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="text-sm">
                    <CloudArrowUpIcon className="h-4 w-4 mr-1" /> Fotoğraf Seç
                </Button>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" id="bizbize-staff-photo-upload"/>
             {isEditMode && <p className="text-xs text-gray-500 dark:text-gray-400">Fotoğraf güncelleme bu ekrandan desteklenmemektedir.</p>}
          </div>

          <Input label="Ad" {...register('firstName', { required: 'Ad zorunludur.' })} error={errors.firstName?.message} />
          <Input label="Soyad" {...register('lastName', { required: 'Soyad zorunludur.' })} error={errors.lastName?.message} />
          <Input label="Departman" {...register('department')} error={errors.department?.message} />
          <Input label="LinkedIn Profili (URL)" type="url" {...register('linkedin')} error={errors.linkedin?.message} />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>İptal</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>{isEditMode ? 'Güncelle' : 'Ekle'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditBizbizeStaffModal;
