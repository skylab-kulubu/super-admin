"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { BizbizeEvent, AddBizbizeEventPayload, UpdateBizbizeEventDto } from '@/types';
import { formatDateTimeForApi, parseApiDateTimeToInput } from '@/lib/utils';

interface AddEditBizbizeEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventSaved: () => void;
  eventToEdit?: BizbizeEvent | null;
}

type EventFormInputs = {
  guestName: string;
  title: string;
  date: string; // For datetime-local input: "yyyy-MM-ddTHH:mm"
  linkedin?: string;
  isActive: boolean;
  type: string;
  description?: string;
  formUrl?: string;
};

const AddEditBizbizeEventModal: React.FC<AddEditBizbizeEventModalProps> = ({ isOpen, onClose, onEventSaved, eventToEdit }) => {
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<EventFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!eventToEdit;

  useEffect(() => {
    if (eventToEdit) {
      reset({
        guestName: eventToEdit.guestName,
        title: eventToEdit.title,
        date: parseApiDateTimeToInput(eventToEdit.date),
        linkedin: eventToEdit.linkedin || '',
        isActive: eventToEdit.isActive,
        type: eventToEdit.type,
        description: eventToEdit.description || '',
        formUrl: eventToEdit.formUrl || '',
      });
    } else {
      reset({ // Default values for new event
        guestName: '',
        title: '',
        date: '',
        linkedin: '',
        isActive: true,
        type: 'TALK', // Default type
        description: '',
        formUrl: '',
      });
    }
  }, [eventToEdit, reset]);

  const onSubmit: SubmitHandler<EventFormInputs> = async (data) => {
    setIsLoading(true);
    const formattedDate = formatDateTimeForApi(data.date);

    try {
      if (isEditMode && eventToEdit) {
        const payload: UpdateBizbizeEventDto = {
          id: eventToEdit.id,
          guestName: data.guestName,
          title: data.title,
          date: formattedDate,
          linkedin: data.linkedin,
          isActive: data.isActive,
          type: data.type,
          description: data.description,
          formUrl: data.formUrl,
        };
        await api.post('/events/updateBizbizeEvent', payload);
        toast.success('Etkinlik başarıyla güncellendi!');
      } else {
        const payload: AddBizbizeEventPayload = {
          guestName: data.guestName,
          title: data.title,
          date: formattedDate,
          linkedin: data.linkedin,
          isActive: data.isActive ? 1 : 0, // Convert boolean to 0/1 for add API
          tenant: "BIZBIZE",
          type: data.type,
          description: data.description,
          formUrl: data.formUrl,
        };
        await api.post('/events/addEvent', payload);
        toast.success('Etkinlik başarıyla eklendi!');
      }
      onEventSaved();
      onClose();
    } catch (error: any) {
      console.error("Save event error:", error);
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
            {isEditMode ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Misafir Adı" {...register('guestName', { required: 'Misafir adı zorunludur.' })} error={errors.guestName?.message} />
          <Input label="Başlık/Pozisyon" {...register('title', { required: 'Başlık zorunludur.' })} error={errors.title?.message} />
          <Input label="Tarih ve Saat" type="datetime-local" {...register('date', { required: 'Tarih zorunludur.' })} error={errors.date?.message} />
          <Input label="LinkedIn Profili (URL)" type="url" {...register('linkedin')} error={errors.linkedin?.message} />
          <Input label="Etkinlik Tipi (örn: TALK, WORKSHOP)" {...register('type', { required: 'Tip zorunludur.' })} error={errors.type?.message} />
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Açıklama</label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <Input label="Form URL (opsiyonel)" type="url" {...register('formUrl')} error={errors.formUrl?.message} />
          <div className="flex items-center">
            <Controller
              name="isActive"
              control={control}
              defaultValue={true}
              render={({ field }) => (
                <input type="checkbox" id="isActive" {...field} checked={field.value} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary mr-2" value={undefined} />
              )}
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">Aktif Etkinlik</label>
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

export default AddEditBizbizeEventModal;
