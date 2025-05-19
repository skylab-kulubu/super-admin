"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { GecekoduEvent, AddGecekoduEventPayload, UpdateGecekoduEventPayload } from '@/types';
import { formatDateTimeForApi, parseApiDateTimeToInput } from '@/lib/utils';

interface AddEditGecekoduEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventSaved: () => void;
  eventToEdit?: GecekoduEvent | null;
}

type EventFormInputs = {
  title: string;
  date: string; 
  linkedin?: string; // Optional based on CreateEventDto
  isActive: boolean;
  type?: string;
  description?: string;
  formUrl?: string;
  // guestName removed
};

const AddEditGecekoduEventModal: React.FC<AddEditGecekoduEventModalProps> = ({ isOpen, onClose, onEventSaved, eventToEdit }) => {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<EventFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!eventToEdit;

  useEffect(() => {
    if (eventToEdit) {
      reset({
        title: eventToEdit.title,
        date: parseApiDateTimeToInput(eventToEdit.date),
        linkedin: '', // Assuming not directly editable or fetched for GeceKodu edit
        isActive: eventToEdit.isActive,
        type: eventToEdit.type || '',
        description: eventToEdit.description || '',
        formUrl: eventToEdit.formUrl || '',
      });
    } else {
      reset({ 
        title: '',
        date: '',
        linkedin: '',
        isActive: true,
        type: 'WORKSHOP', // Default type for GeceKodu
        description: '',
        formUrl: '',
      });
    }
  }, [eventToEdit, reset, isOpen]);

  const onSubmit: SubmitHandler<EventFormInputs> = async (data) => {
    setIsLoading(true);
    const formattedDate = formatDateTimeForApi(data.date);

    try {
      if (isEditMode && eventToEdit) {
        // Assuming a generic update endpoint or a specific one for GeceKodu
        // For now, using a placeholder update payload structure
        const payload: UpdateGecekoduEventPayload = {
          id: eventToEdit.id,
          title: data.title,
          description: data.description,
          date: formattedDate, // Assuming date can be updated
          isActive: data.isActive, // Assuming isActive can be updated
          type: data.type,
          formUrl: data.formUrl,
        };
        // Replace with actual update endpoint if different
        await api.post('/events/updateEvent', payload); // Placeholder endpoint
        toast.success('Etkinlik başarıyla güncellendi!');
      } else {
        const payload: AddGecekoduEventPayload = {
          title: data.title,
          description: data.description,
          date: formattedDate,
          linkedin: data.linkedin, // Included as per CreateEventDto
          isActive: data.isActive,
          tenant: "GECEKODU",
          type: data.type,
          formUrl: data.formUrl,
        };
        await api.post('/events/addEvent', payload);
        toast.success('Etkinlik başarıyla eklendi!');
      }
      onEventSaved();
      onClose();
    } catch (error: any) {
      console.error("Save GeceKodu event error:", error);
      const errorMessage = error.response?.data?.message || 'Etkinlik kaydedilirken bir hata oluştu.';
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
            {isEditMode ? 'GeceKodu Etkinliğini Düzenle' : 'Yeni GeceKodu Etkinliği Ekle'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* guestName input removed */}
          <Input id="title" label="Başlık" {...register('title', { required: 'Başlık zorunludur.' })} error={errors.title?.message} />
          <Input id="date" label="Tarih ve Saat" type="datetime-local" {...register('date', { required: 'Tarih zorunludur.' })} error={errors.date?.message} />
          <Input id="type" label="Etkinlik Tipi (örn: WORKSHOP, HACKATHON)" {...register('type')} error={errors.type?.message} />
          <div>
            <label htmlFor="descriptionGK" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama</label>
            <textarea
              id="descriptionGK"
              {...register('description')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <Input id="linkedin" label="LinkedIn (Etkinlik/Organizatör)" type="url" {...register('linkedin')} error={errors.linkedin?.message} />
          <Input id="formUrl" label="Form URL (opsiyonel)" type="url" {...register('formUrl')} error={errors.formUrl?.message} />
          <div className="flex items-center">
            <Controller
              name="isActive"
              control={control}
              defaultValue={true}
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="isActiveGK"
                  onChange={field.onChange}
                  checked={field.value}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2"
                />
              )}
            />
            <label htmlFor="isActiveGK" className="text-sm text-gray-700 dark:text-gray-300">Aktif Etkinlik</label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>İptal</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>{isEditMode ? 'Güncelle' : 'Ekle'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditGecekoduEventModal;
