"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { GecekoduAnnouncement, AddGecekoduAnnouncementPayload, UpdateGecekoduAnnouncementPayload } from '@/types'; // Gecekodu types
import { formatDateTimeForApi, parseApiDateTimeToInput } from '@/lib/utils';

interface AddEditGecekoduAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnnouncementSaved: () => void;
  announcementToEdit?: GecekoduAnnouncement | null;
}

type AnnouncementFormInputs = {
  title: string;
  content: string;
  date: string; 
  isActive: boolean;
};

const AddEditGecekoduAnnouncementModal: React.FC<AddEditGecekoduAnnouncementModalProps> = ({ isOpen, onClose, onAnnouncementSaved, announcementToEdit }) => {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<AnnouncementFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!announcementToEdit;

  useEffect(() => {
    if (announcementToEdit) {
      reset({
        title: announcementToEdit.title,
        content: announcementToEdit.content,
        date: parseApiDateTimeToInput(announcementToEdit.date), 
        isActive: announcementToEdit.isActive,
      });
    } else {
      reset({
        title: '',
        content: '',
        date: '',
        isActive: true,
      });
    }
  }, [announcementToEdit, reset, isOpen]);

  const onSubmit: SubmitHandler<AnnouncementFormInputs> = async (data) => {
    setIsLoading(true);
    try {
      if (isEditMode && announcementToEdit) {
        const payload: UpdateGecekoduAnnouncementPayload = { // Use Gecekodu type
          id: announcementToEdit.id,
          title: data.title,
          content: data.content,
          // isActive and date are not part of the update DTO for announcements as per existing logic
        };
        await api.post('/announcements/updateAnnouncement', payload);
        toast.success('Duyuru başarıyla güncellendi!');
      } else {
        const formattedDate = formatDateTimeForApi(data.date);
        const payload: AddGecekoduAnnouncementPayload = { // Use Gecekodu type
          title: data.title,
          content: data.content,
          date: formattedDate,
          isActive: data.isActive,
          tenant: "GECEKODU", // Set tenant for GeceKodu
        };
        await api.post('/announcements/addAnnouncement', payload);
        toast.success('Duyuru başarıyla eklendi!');
      }
      onAnnouncementSaved();
      onClose();
    } catch (error: any) {
      console.error("Save GeceKodu announcement error:", error);
      const errorMessage = error.response?.data?.message || 'Duyuru kaydedilirken bir hata oluştu.';
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
            {isEditMode ? 'GeceKodu Duyurusunu Düzenle' : 'Yeni GeceKodu Duyurusu Ekle'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Başlık" {...register('title', { required: 'Başlık zorunludur.' })} error={errors.title?.message} />
          <div>
            <label htmlFor="contentGKAnn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İçerik</label>
            <textarea
              id="contentGKAnn"
              {...register('content', { required: 'İçerik zorunludur.' })}
              rows={5}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.content ? 'border-red-500' : ''}`}
            />
            {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>}
          </div>

          {!isEditMode && (
            <>
              <Input label="Yayın Tarihi ve Saati" type="datetime-local" {...register('date', { required: 'Tarih zorunludur.' })} error={errors.date?.message} />
              <div className="flex items-center">
                <Controller
                  name="isActive"
                  control={control}
                  defaultValue={true}
                  render={({ field }) => (
                    <input
                      type="checkbox"
                      id="isActiveGKAnnouncement"
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                      checked={field.value}
                      className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"
                    />
                  )}
                />
                <label htmlFor="isActiveGKAnnouncement" className="text-sm text-gray-700 dark:text-gray-300">Aktif Duyuru</label>
              </div>
            </>
          )}
           {isEditMode && announcementToEdit && (
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p><strong>Yayın Tarihi:</strong> {announcementToEdit.date}</p>
                <p><strong>Durum:</strong> {announcementToEdit.isActive ? "Aktif" : "Pasif"}</p>
                <p className="text-xs italic">Tarih ve aktiflik durumu bu ekrandan güncellenemez.</p>
            </div>
           )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>İptal</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>{isEditMode ? 'Güncelle' : 'Ekle'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditGecekoduAnnouncementModal;
