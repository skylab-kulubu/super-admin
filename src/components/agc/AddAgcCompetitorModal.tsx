import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import api from '@/lib/axios';
import { AddCompetitorPayload, ApiResponse, CompetitorId } from '@/types';
import toast from 'react-hot-toast';

interface AddAgcCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompetitorAdded: () => void; // Callback to refresh system-wide competitor list
}

interface CompetitorFormInputs {
  name: string;
  totalPoints: number;
  competitionCount: number;
  isActive: boolean;
}

const AddAgcCompetitorModal: React.FC<AddAgcCompetitorModalProps> = ({
  isOpen,
  onClose,
  onCompetitorAdded,
}) => {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<CompetitorFormInputs>({
    defaultValues: {
      name: '',
      totalPoints: 0,
      competitionCount: 0,
      isActive: true,
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({ // Reset to defaults when modal opens
        name: '',
        totalPoints: 0,
        competitionCount: 0,
        isActive: true,
      });
    }
  }, [isOpen, reset]);

  const onSubmit: SubmitHandler<CompetitorFormInputs> = async (data) => {
    const payload: AddCompetitorPayload = {
      ...data,
      tenant: "AGC",
    };

    try {
      await api.post<ApiResponse<CompetitorId>>('/competitors/addCompetitor', payload);
      toast.success('Yarışmacı sisteme başarıyla eklendi.');
      onCompetitorAdded(); // Notify parent to refresh data
      onClose(); // Close this modal
    } catch (error: any) {
      console.error("Add competitor error:", error);
      toast.error(error.response?.data?.message || 'Yarışmacı eklenirken bir hata oluştu.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sisteme Yeni Yarışmacı Ekle (AGC)">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Yarışmacı Adı"
          id="competitorName"
          {...register('name', { required: 'Yarışmacı adı zorunludur.' })}
          error={errors.name?.message}
          className="w-full"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Başlangıç Puanı"
            id="totalPoints"
            type="number"
            {...register('totalPoints', { 
              required: 'Puan zorunludur.',
              valueAsNumber: true,
              min: { value: 0, message: 'Puan negatif olamaz.' }
            })}
            error={errors.totalPoints?.message}
            className="w-full"
          />
          <Input
            label="Başlangıç Yarışma Sayısı"
            id="competitionCount"
            type="number"
            {...register('competitionCount', {
              required: 'Yarışma sayısı zorunludur.',
              valueAsNumber: true,
              min: { value: 0, message: 'Yarışma sayısı negatif olamaz.' }
            })}
            error={errors.competitionCount?.message}
            className="w-full"
          />
        </div>
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="Aktif Yarışmacı"
              id="isActiveCompetitor"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="primary" onClick={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button type="submit" isLoading={isSubmitting} variant="primary">
            Yarışmacı Ekle
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAgcCompetitorModal;
